const users = []

const adUsers = ({id,username, room}) => {

    username = username.trim().toLowerCase()


    if(!username || !room) {
        return {
            error: 'username or room is not present'
        }
    }

    const existingUser = users.find((user)=> {
        return user.room === room && user.username === username
    })

    if(existingUser) {
        return { 
            error: 'username is taken as your crush is'
        }
    }

    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {

    const index = users.findIndex((user)=> user.id === id)
    if(index !== -1) {
        return users.splice(index,1)[0]
    }
}

const getUsers = (id) => {
    return users.find((user)=> user.id === id)
}

const getUsersInRoom = (room)=> {
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
}

module.exports = {
    adUsers,
    removeUser,
    getUsers,
    getUsersInRoom
}