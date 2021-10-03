//=====EXTERNAL IMPORTS
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const app = express();
const http = require('http');
const server = http.createServer(app); // I assume that "http server" adds modules that the express "app handler" might not come with regularly

//======DB

const db = require("./models")

//====MIDDLEWARE
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(express.json()); //-JSON parsing
dotenv.config()

//======ROUTES

//i assume we use app here because it still will handle the routes for the server
app.get('/', (req, res) => {
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + "/index.html");
});


app.post('/register', (req, res) => {
  
  db.User.create(req.body, (err, savedUser) => {
    if (err) console.log("Error registering new User: ", err)
    
    console.log(savedUser);
  })
  
  /* this doesnt work because it is happening outside of the io so it doesnt know the socket
  {
    socketId : socket.id,
    ...req.body
  }, 
  */
 // console.log(req.body);
 const signedJwt = jwt.sign(
   req.body,
   process.env.JWT_SECRET_KEY,
   {
     expiresIn: "1d",
    }
    );
    
    return res.status(200).json({
      status: 200,
      message: "Success",
      signedJwt
    });
    
  });

//=====SOCKET COMUNNICATIONS
  
const { Server } = require('socket.io'); // getting the class Server out of socket.io
const io = new Server(server);
  
io.on('connection', (socket) =>{
  console.log(socket.id + " user logged in");
  db.User.find({}, (err, foundUsers) => {
    if (err) console.log("Error finding Users: ", err)

    // console.log(foundUsers);
    socket.emit('user.connected', {socketId: socket.id, usersList: foundUsers, nameApiKey: process.env.NAME_API_KEY})
  });
  //socket.emit('user.connected', {socketId: socket.id});// sends only to the connecting socket

  socket.on('new user', (userInfo) => {//when server receives message that new user name has being establish
    console.log(socket.id);
    socket.broadcast.emit('new user', userInfo); // broadcasts for remaining sockets the new user
  })

  socket.on('chat message', (msg) => {//when server receives message
    db.User.findOne({socketId: socket.id}, (err, foundUser) =>{
      if(err) console.log("Error finding User: ", err);

      if(foundUser === null) console.log("USER NOT FOUND")
      io.emit('chat message', {userInfo: foundUser, msg: msg.msg});// sends the message to everyone else
    })
    //socket.broadcast.emit('chat message', msg);// sends to the other people but not who sent
  });

  socket.on('disconnect', () =>{
    db.User.findOneAndDelete({socketId: socket.id}, (err, deletedUser) =>{
      if(err) console.log("Error deleting User: ", err);

      if (deletedUser) {
        console.log(deletedUser.userName, " logged out");
        io.emit('user.disconnected', (deletedUser));
      }else {
        console.log("Something went wrong; \n User wasn't properly loggout and/or deleted of Database");
      }

    })
  });
});


//the server port is is initialized to start listening here
server.listen(process.env.PORT, () => {
  console.log('listening on http://localhost:3000');
});