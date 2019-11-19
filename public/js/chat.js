const socket = io()

const $messages = document.getElementById('messages')
const messageTmpl = document.getElementById('message-template').innerHTML
const locationMessageTmpl = document.getElementById('location-message-template').innerHTML

// options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('message', (message) => {

    const html = Mustache.render(messageTmpl, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    console.log(message)
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTmpl, {   
        url: message.url,
        createdAt: moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

document.getElementById('chat-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const input = e.target.elements.message
    const submit = e.target.elements.submit
    const message = e.target.elements.message.value

    console.log(e.target.elements)

    submit.setAttribute('disabled', 'disabled')

    socket.emit('sendMsg', message, (error) => {
        submit.removeAttribute('disabled')
        input.value = ''
        input.focus()

        if (error) {
           return console.log(error)
        }
        console.log(`the message was delivered!`)
    })
})

document.getElementById('send-location').addEventListener('click', (e) => {

    e.target.setAttribute('disabled', 'disabled')

    if(!navigator.geolocation){
        return alert('browser does not support location sharing')
    }
    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            e.target.removeAttribute('disabled')
            console.log('location shared')
        })
    })

})

socket.emit('join', {username, room})


// socket.on('updateCount', (count) => {
//     console.log(`count is ${count}`)
// })

// document.getElementById('increment').addEventListener('click', () => {

//     socket.emit('increment')
// })