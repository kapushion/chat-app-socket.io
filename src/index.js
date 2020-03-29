const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/message')
const { adUsers,
    removeUser,
    getUsers,
    getUsersInRoom}  = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const admin = 'chat bot'
const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket)=> {
    console.log('connection made succesfully')
    socket.on('join', (options, callback)=> {
        const {error ,user} = adUsers({id: socket.id , ...options})
        if(error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage( admin,'welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage( user.username,`${user.username} registered`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })

    socket.on('sendMessage', (message,callback)=> {
        const filter = new Filter()
        const user = getUsers(socket.id)

        
        if(filter.isProfane(message)) {
            return callback('shivya nako deu')
        }

        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation', (exactpos, callback)=> {
        const user = getUsers(socket.id)
        io.to(user.room).emit('Locationmessage', generateLocationMessage(user.username,`https://google.com/maps?q=${exactpos.latitude},${exactpos.longitude}`) )

        callback()
    })

    socket.on('disconnect', ()=> {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage( admin, `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })

    
})




server.listen(port, ()=> console.log(`Server is up on port ${port}`))