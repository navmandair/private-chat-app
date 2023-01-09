const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app)
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../public')))

io.on('connection', (ws) => {
    console.log('New WS Connection')
    ws.emit('pull', 'Welcome to My Private Chat App')
    ws.on('push', (text)=>{
        io.emit('pull', '\n'+text)
    })
})

const PORT = process.env.PORT || 3000;

const init = (PORT) => { server.listen(PORT, () => { console.log('Express server started on', PORT)}) }

init(PORT);