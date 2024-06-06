const socketHandler = require("./socketHandler");

const initialiseSocketObserver = (socketIO) => {
    socketHandler.setSocketIO(socketIO)
    socketIO.on("connection", (socket) => {
        socket.on("createNewUser", (currentUserName) => {
            socketHandler.createNewUser(currentUserName, socket);
        });

        socket.on("loginUser", (currentUserName) => {
            socketHandler.loginUser(currentUserName, socket);
        });

        socket.on("getAllConnectedUser", (id) => {
            socketHandler.getAllConnectedUser();
        });

        socket.on("logout", (id) => {
            socketHandler.logout(id);
        });

        socket.on("getOldMessage", (data) => {
            socketHandler.getOldMessage(data, socket);
        });

        socket.on("sendMessage", (data) => {
            socketHandler.sendMessage(data);
        });

        socket.on("chatStart", (data) => {
            socketHandler.chatStart(data);
        });

        socket.on("chatStop", (data) => {
            socketHandler.chatStop(data);
        });
    });
}

module.exports = initialiseSocketObserver;