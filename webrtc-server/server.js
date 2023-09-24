const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*",
        credentials: true
      }
});
const cors = require('cors');

app.use(cors({
    origin: '*', // Replace with your React app's domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent with the request if needed
  }));


io.on("connection", function (socket) {
    console.log("connected");
    socket.on("join", function (data) {
    socket.join(data.roomId);
    socket.room = data.roomId;
    const sockets = io.sockets.adapter.rooms.get(data.roomId);
    if (sockets.size === 1) {
        return socket.emit("init");
    } else {
        if (sockets.size === 2) {
        io.to(data.roomId).emit("ready");
        } else {
        socket.room = null;
        socket.leave(data.roomId);
        socket.emit("full");
        }
    }
    });
    socket.on("signal", (data) => {
    io.to(data.room).emit("desc", data.desc);
    });
    socket.on("disconnect", () => {
    const roomId = Object.keys(socket.adapter.rooms)[0];
    if (socket.room) {
        io.to(socket.room).emit("disconnected");
    }
    });
});
  

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
