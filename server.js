const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app); // I assume that "http server" adds modules that the express "app handler" might not come with regularly

//===FAKE DB

const db = require("./models/fakeDb")

//====MIDDLEWARE
app.use(express.static(__dirname + "/public"));
app.use(express.json()); //-JSON parsing

const { Server } = require('socket.io'); // getting the class Server out of socket.io
const io = new Server(server);

//i assume we use app here because it still will handle the routes for the server
app.get('/', (req, res) => {
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + "/index.html");
});


io.on('connection', (socket) =>{
  console.log(socket.id + "user logged in");
  socket.emit('user.connected', {channels: db});// sends only to the connecting socket

  socket.on('new user', (userName) => {//when server receives message that new user name has being establish
    console.log(socket.id);
    socket.broadcast.emit('new user', userName); // broadcasts for remaining sockets the new user
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