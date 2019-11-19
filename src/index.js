const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {generateMessage, generateLocationMessage} = require('./utils/messages')

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirPath = path.join(__dirname, '../public')
app.use(express.static(publicDirPath))
app.use(express.json())

var onlineUsers = 0

io.on('connection', (socket) => {
    onlineUsers++
    console.log('new websocket connection')

    socket.on('join', (username, room) => {
        socket.join(room)

        socket.emit('message', generateMessage(`Welcome! ${onlineUsers} user(s) online`))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined! ${onlineUsers} user(s) online`))    
    })

    socket.on('sendMsg', (message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('profanity is not allowed b*tch')
        }

        io.to('room').emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.lat},${coords.long}`))
        callback()
    })

    socket.on('disconnect', () => {
        onlineUsers--
        io.emit('message', generateMessage(`a user has left the chat! ${onlineUsers} user(s) online`))
    })
})

server.listen(port, () => {
    console.log(`listening on ${port}...`)
})