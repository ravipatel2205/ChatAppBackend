const fs = require("fs");
const utils = require("./utils")
const constants = require("./constants/constants")

let chatUsers = [];
let socketIOInstance; // Declare a variable to hold the socketIO instance

function createUniqueId() {
    return Math.random().toString(20).substring(2, 10);
}

function setSocketIO(io) {
    socketIOInstance = io; // Set the socketIO instance
}

function sendAllConnectedUser() {
    if (socketIOInstance) {
        socketIOInstance.emit("userList", chatUsers);
    }
}

function createNewUser(currentUserName, socket) {
    const filteredUser = chatUsers.filter((user) => user.name === currentUserName);
    if (filteredUser.length == 0) {
        const newUser = createUser(currentUserName)
        socket.emit("isUserRegisterSuccessfully", newUser);
        sendAllConnectedUser()
    } else {
        socket.emit("isUserRegisterSuccessfully", null);
    }
}

function createUser(name) {
    const newUser = {
        id: createUniqueId(),
        name,
        messages: [],
        unReadMessagesCountByUser: [],
        currentChatWith: ""
    };
    chatUsers.unshift(newUser);
    return newUser;
}

function loginUser(currentUserName, socket) {
    const filteredUser = chatUsers.filter((user) => user.name === currentUserName);
    if (filteredUser.length != 0) {
        socket.emit("isUserRegisterSuccessfully", filteredUser[0]);
        sendAllConnectedUser()
    } else {
        socket.emit("isUserRegisterSuccessfully", null);
    }
}

function getAllConnectedUser() {
    sendAllConnectedUser()
}

function logout(id) {
    chatUsers = chatUsers.filter((user) => user.id != id)
    sendAllConnectedUser()
}

function getOldMessage(data, socket) {
    const { senderIdentifier, reciverIdentifier } = data;
    sendAllMessages(senderIdentifier, reciverIdentifier, socket)
}

function sendAllMessages(senderIdentifier, reciverIdentifier, socket) {
    const sender = chatUsers.filter((item) => item.id === senderIdentifier)
    const reciver = chatUsers.filter((item) => item.id === reciverIdentifier)

    const allMessages = []
    if (sender.length > 0 && sender[0].messages.length > 0) {
        const messagesByReciver = sender[0].messages.filter((item) => item.id === reciverIdentifier)
        if (messagesByReciver.length > 0) {
            allMessages.push(...messagesByReciver[0].messages);
        }
    }
    if (reciver.length > 0 && reciver[0].messages.length > 0) {
        const messagesBySender = reciver[0].messages.filter((item) => item.id === senderIdentifier)
        if (messagesBySender.length > 0) {
            allMessages.push(...messagesBySender[0].messages);
        }
    }
    // sort messages
    const sortedMessages = allMessages.sort((a, b) => {
        // convert time data to a Date object for comparison
        const dateB = new Date(b.year, b.month, b.date, b.hr, b.mins, b.secound);
        const dateA = new Date(a.year, a.month, a.date, a.hr, a.mins, a.secound);

        // compare the dates
        return dateA.getTime() - dateB.getTime();
    });
    if (sortedMessages.length > 0) {
        socket.emit("oldMessages", sortedMessages)
    }
}

function chatStart(data) {
    const { senderIdentifier, reciverIdentifier } = data;
    const sender = chatUsers.filter((item) => item.id === senderIdentifier)
    if (sender.length > 0) {
        // remove unread message count if any
        const unReadMessagesCountByUser = sender[0].unReadMessagesCountByUser.filter((user) => user.id !== reciverIdentifier)
        sender[0].unReadMessagesCountByUser = unReadMessagesCountByUser
    }
    const reciver = chatUsers.filter((item) => item.id === reciverIdentifier)
    if (reciver.length > 0) {
        // remove unread message count if any
        const unReadMessagesCountByUser = reciver[0].unReadMessagesCountByUser.filter((user) => user.id !== senderIdentifier)
        reciver[0].unReadMessagesCountByUser = unReadMessagesCountByUser
    }
    // set reciver id to server
    if (sender.length > 0) {
        sender[0].currentChatWith = reciverIdentifier
    }
}

function chatStop(data) {
    const { senderIdentifier } = data;
    const sender = chatUsers.filter((item) => item.id === senderIdentifier)
    // set reciver id to server
    if (sender.length > 0) {
        sender[0].currentChatWith = ""
    }
}

function sendMessage(data) {
    const { currentChatMesage, senderIdentifier, reciverIdentifier, imageData, originalname, timeData, type } = data;
    if (type === 'text') {
        const newMessage = createMessage(currentChatMesage, senderIdentifier, reciverIdentifier, timeData, type);
        sendMessages(senderIdentifier, reciverIdentifier, newMessage)
    } else if (type === 'image' || type === 'video') { // Save the binary data to a file
        const base64Data = imageData
        const binaryData = Buffer.from(base64Data, 'base64');
        fs.writeFile(`${constants.imageDir}/${originalname}`, binaryData, (err) => {
            if (err) {
                console.error(err);
                return;
            } else {
                try {
                    let uploadFolderPath = utils.getUploadFolderPath();
                    if (uploadFolderPath.startsWith("/")) {
                        uploadFolderPath = uploadFolderPath.substring(1);
                    }
                    const imageUrl = `${constants.SERVER_URL}${uploadFolderPath}/${originalname}`; // server and full path
                    console.log(imageUrl)
                    const newMessage = createMessage(imageUrl, senderIdentifier, reciverIdentifier, timeData, type);
                    sendMessages(senderIdentifier, reciverIdentifier, newMessage)
                } catch (error) {
                    console.error(error.message);
                }
            }
        });
    }
}

function createMessage(text, senderIdentifier, receiverIdentifier, timeData, type) {
    return {
        id: createUniqueId(),
        text,
        senderIdentifier,
        receiverIdentifier,
        hr: timeData.hr,
        mins: timeData.mins,
        date: timeData.date,
        month: timeData.month,
        year: timeData.year,
        secound: timeData.secound,
        type
    };
}

function sendMessages(senderIdentifier, reciverIdentifier, newMessage) {
    const sender = chatUsers.filter((item) => item.id === senderIdentifier)
    const reciver = chatUsers.filter((item) => item.id === reciverIdentifier)

    // push message to sender
    if (sender.length > 0) {
        const messageInSenderObjectByReciver = sender[0].messages.filter((item) => item.id === reciverIdentifier)
        if (messageInSenderObjectByReciver.length > 0) {
            sender[0].messages[0].messages.push(newMessage)
        } else {
            const newMessageObc = {
                id: reciverIdentifier,
                messages: [newMessage]
            }
            sender[0].messages.push(newMessageObc)
        }
    }
    if (reciver.length > 0) {
        if (reciver[0].currentChatWith != senderIdentifier) {
            const unReadMessagesCountByUser = reciver[0].unReadMessagesCountByUser;
            const senderIndex = unReadMessagesCountByUser.findIndex(user => user.id === senderIdentifier);
            if (senderIndex !== -1) { // If user is already present, increment unread count
                unReadMessagesCountByUser[senderIndex].count += 1;
            } else { // If user is not present, add new user with count 1
                unReadMessagesCountByUser.push({ id: senderIdentifier, count: 1 });
            }
            reciver[0].unReadMessagesCountByUser = unReadMessagesCountByUser
            // send event to reciver
            if (socketIOInstance) {
                socketIOInstance.emit(`update_unreadCount_${reciverIdentifier}`, {
                    chatUsers: chatUsers,
                    currentUser: reciver[0]
                })
            }
        }
    }

    // send message to reciver
    if (socketIOInstance) {
        socketIOInstance.emit(`new_message_${senderIdentifier}_${reciverIdentifier}`, newMessage)
        socketIOInstance.emit(`new_message_${reciverIdentifier}_${senderIdentifier}`, newMessage)
    }
}


module.exports = {
    setSocketIO,
    createNewUser,
    loginUser,
    getAllConnectedUser,
    logout,
    getOldMessage,
    chatStart,
    chatStop,
    sendMessage
};