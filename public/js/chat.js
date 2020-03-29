const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messageFormLocation = document.querySelector('#location')
const $messages = document.querySelector('#messages')

// Templates
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Option

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height

    const visibleHeight = $messages.offsetHeight 

    //height of message containerr

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset) {

        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message)=> {

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('Locationmessage', (message)=> {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({room, users})=> {
 
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error)=> {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error) {
            return console.log(error)
        }

        console.log('the message was delivered')
    })
})

$messageFormLocation.addEventListener('click', ()=> {
    if(!navigator.geolocation) {
        return alert('your browser doesnot support geolocation')
    }

    $messageFormLocation.setAttribute('disabled', 'disabled')

//     socket.emit('sendLocation', {
//   \titude: 
//     })
    navigator.geolocation.getCurrentPosition((position)=> {

        $messageFormLocation.removeAttribute('disabled')
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=> {
            console.log('Location Shared')
        })

    })
})

socket.emit('join', {username, room}, (error)=> {
    if(error) {
        alert(error)
        location.href = '/'
    }

})