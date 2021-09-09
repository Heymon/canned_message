//=====EXTERNAL IMPORTS
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const http = require('http');
const server = http.createServer(app); // I assume that "http server" adds modules that the express "app handler" might not come with regularly

//===FAKE DB

const db = require("./models/fakeDb")

//====MIDDLEWARE
app.use(express.static(__dirname + "/public"));
app.use(express.json()); //-JSON parsing

const { Server } = require('socket.io'); // getting the class Server out of socket.io
const { response } = require('express');
const io = new Server(server);

//i assume we use app here because it still will handle the routes for the server
app.get('/', (req, res) => {
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + "/index.html");
});

//======ROUTES

app.post('/register', (req, res) => {

  /* this doesnt work because it is happening outside of the io so it doesnt know the socket
  {
      socketId : socket.id,
      ...req.body
  }, 
  */
  // console.log(req.body);
  const signedJwt = jwt.sign(
    req.body,
    "secret key",
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


io.on('connection', (socket) =>{
  console.log(socket.id + "user logged in");
  /* socket.emit('user.connected', {channels: db});// sends only to the connecting socket */
  socket.emit('user.connected', {socketId: socket.id});// sends only to the connecting socket

  socket.on('new user', (userInfo) => {//when server receives message that new user name has being establish
    console.log(socket.id);
    socket.broadcast.emit('new user', userInfo); // broadcasts for remaining sockets the new user
  })

  socket.on('chat message', (msg) => {//when server receives message
    io.emit('chat message', msg);// sends the message to everyone else
    //socket.broadcast.emit('chat message', msg);// sends to the other people but not who sent
  });

  socket.on('disconnect', () =>{
    console.log("user logged out")
  });
});


//the server port is is initialized to start listening here
server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});