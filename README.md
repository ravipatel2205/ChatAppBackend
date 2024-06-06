
# Socket Chat Backend

This Chat Backend server provides chat services with different users using Socket.



## Running Locally

Install socket-chat-backend with npm

Make sure you have [Node.js](https://nodejs.org/en) CLI installed. Checkout the sample [app](https://github.com/ravipatel2205/ChatAppReactNative) which configured this server.

```bash
$ git clone git@github.com:ravipatel2205/ChatAppBackend.git # or clone your own fork
$ cd ChatAppBackend
$ npm install
```

#### Your server and app should now be running on "http://192.168.1.101:3001/"	
- Use the IP address of your machine (192.168.X.X)
- Use any available PORT number (3001)
- Make sure your server and app running on same IP address and PORT.

#### Start server 
```bash
$ cd ChatAppBackend
$ npm start
```

## Events used from the app side


#### Create New User
- Emit "`createNewUser`" event with user name to register new user.

#### Login User
- Emit "`loginUser`" event with user name to login new user.

#### User Register and Login responce
- Observe "`isUserRegisterSuccessfully`" event which gives optional user model.

#### UserList
- Emit "`getAllConnectedUser`" event with user id to get all connected users.
- Obsers "`userList`" event which gives all connected Users

#### Get Unread Count
- Observe "`update_unreadCount_(currentUser_id)`" which gives you current user and list of all connected user.

### Chats

#### Start Chat
- Emit "`chatStart`" event when you start the chat from app side.
```bash
socket.emit('chatStart', {
    senderIdentifier: currentUser.id,
    reciverIdentifier: reciver.id
})
```

#### Get Old Chats
- Emit "`getOldMessage`" to send request old chats between two users.
- Observe "`oldMessages`" to get array old massages.
```bash
socket.emit('getOldMessage', {
    senderIdentifier: currentUser.id,
    reciverIdentifier: reciver.id
})
socket.on('oldMessages', (allChats) => {
    setNewMessageList(allChats as [MessageModel])
})
```

#### Stop Chat
- Emit "`chatStop`" event when you stop the chat from app side.
```bash
socket.emit('chatStop', {
    senderIdentifier: currentUser.id
})
```

### Send New Message
- Emit "`sendMessage`" to send new message to server using below parameters
```bash
const date = new Date()
const timeData = {
    hr: date.getHours() < 10 ? `0${date.getHours()}` : date.getHours(),
    mins: date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes(),
    date: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    secound: date.getSeconds()
 }

const currentUserName = currentUser.name
    socket.emit('sendMessage', {
        currentChatMesage,
        senderIdentifier: currentUser.id,
        reciverIdentifier: reciver.id,
        timeData
})
```
### Fetch New messages from server
- Observe "`new_message_${currentUser.id}_${reciver.id}`" which gives message model as response.

## Models which helps from app side

### UserModel
```bash
interface UserModel {
    id: string
    name: string
    messages: [MessageModel]
    unReadMessagesCountByUser: [UnReadMessagesCountByUser]
}
```
### MessageModel
```bash
interface MessageModel {
    id: string
    text: string
    senderIdentifier: string
    reciverIdentifier: string
    hr: string
    mins: string
    date: string
    month: string
    year: string
    secound: string
}
```
### UnReadMessagesCountByUserModel
```bash
interface UnReadMessagesCountByUser {
    id: string
    count: number
}
```
