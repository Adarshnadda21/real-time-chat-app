const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

const PORT = 3000;

// Serve frontend
app.use(express.static(path.join(__dirname, "..")));

// Store connected users
const users = new Map();

// Socket connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins chat
    socket.on("joinChat", (username) => {
        users.set(socket.id, username);

        socket.username = username;

        // Notify everyone
        io.emit("userJoined", {
            username: username,
            message: `${username} joined the chat`
        });

        // Send current user count
        io.emit("userCount", users.size);
    });

    // Receive message
    socket.on("sendMessage", (message) => {

        if (!message || message.trim() === "") {
            return;
        }

        io.emit("receiveMessage", {
            username: socket.username || "Anonymous",
            message: message,
            time: new Date().toLocaleTimeString()
        });
    });

    // User typing
    socket.on("typing", () => {
        socket.broadcast.emit("userTyping", {
            username: socket.username || "Someone"
        });
    });

    // User stopped typing
    socket.on("stopTyping", () => {
        socket.broadcast.emit("userStoppedTyping");
    });

    // User disconnect
    socket.on("disconnect", () => {

        const username = users.get(socket.id);

        if (username) {
            users.delete(socket.id);

            io.emit("userLeft", {
                username: username,
                message: `${username} left the chat`
            });

            io.emit("userCount", users.size);
        }

        console.log("User disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});