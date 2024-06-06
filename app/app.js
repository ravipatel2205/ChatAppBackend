const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
const {removeAllFilesFromUpload} = require("./utils")
const initialiseSocketObserver = require("./socket");
const constants = require("./constants/constants")

const socketIO = require("socket.io")(http, {
    cors: {
        origin: constants.SERVER_URL
    },
    maxHttpBufferSize: 1e9 // set limit of server upto 1 GB
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => {
    res.json(chatUsers);
});

app.use("/", express.static("/")); // used for static files loading

http.listen(constants.PORT, () => {
    console.log(`Server is listeing on ${constants.PORT}`);
    removeAllFilesFromUpload(); // Remove old uploaded files
    initialiseSocketObserver(socketIO);  // Initialize socket observer
});