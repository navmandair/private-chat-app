const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app)
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../public')))

io.on('connection', (ws) => {
    console.log('New WS Connection')
    ws.emit('serverToClientTextMessage', generateMessage('ChatBot', 'Welcome !'))
    //ws.broadcast.emit('serverToClientTextMessage', generateMessage('New User Joined'))
    ws.on('clientToServerTextMessage', (text, callback) => {
        const { error, user } = getUser(ws.id)
        if (error) {
            return callback(error)
        }
        if (user) {
            if (new Filter().isProfane(text)) {
                callback('Profanity is not allowed')
                return
            }
            io.to(user.room).emit('serverToClientTextMessage', generateMessage(user.username, text));
            callback()
        } else {
            return callback('Session is invalid, Please log in again')
        }
    })

    ws.on('clientToServerLocation', (locationData, callback) => {
        const { error, user } = getUser(ws.id)
        if (error) {
            return callback(error)
        }
        if (user) {
            io.emit('serverToClientLocation', generateLocationMessage(user.username, `https://google.com/maps?q=${locationData.latitude},${locationData.longitude}`))
            callback()
        } else {
            return callback('Session is invalid, Please log in again')
        }
    })

    ws.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: ws.id, username, room });
        if (error) {
            return callback(error)
        } else {
            ws.join(user.room)
            ws.broadcast.to(user.room).emit('serverToClientTextMessage', generateMessage(`${user.username} has joined!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            callback()
        }
    })

    ws.on('disconnect', () => {
        let { error, user } = removeUser(ws.id);
        if (error) {
            return
        } else {
            io.emit('serverToClientTextMessage', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })
})

const PORT = process.env.PORT || 3000;

const init = (PORT) => { server.listen(PORT, () => { console.log('Express server started on', PORT) }) }

init(PORT);