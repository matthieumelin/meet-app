const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const { v4 : uuidV4 } = require("uuid");
const path = require("path");

app.use("/peerjs", peerServer);

app.get("/", (request, response) => {
    response.redirect(`/room/${uuidV4()}`);
});

app.get("/room/:roomId", (request, response) => {
    response.render("room", { roomId: request.params.id });
});

app.set("view engine", "ejs");
app.use('/static', express.static(path.join(__dirname, 'public')));

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
        // messages
        socket.on("message", (message) => {
            // send message to room
            io.to(roomId).emit("createMessage", message);
        });
        socket.on("disconnect", () => {
            socket.to(roomId).broadcast.emit("user-disconnected", userId);
        });
    });
});

server.listen(process.env.PORT||3030);