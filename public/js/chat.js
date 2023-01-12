const ws = io();

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message-form').querySelector('#message')
const $messageFormSubmitBtn = document.querySelector('#message-form').querySelector('#submit')
const $shareLocationBtn = document.querySelector('#share-location')

const $messagesDiv = document.querySelector('#messages')
const $chatSidebar = document.querySelector('#sidebar')

const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    $messagesDiv.scrollTop = $messagesDiv.scrollHeight
}

ws.emit('join', {username, room}, (error) =>{
    if(error){
        alert(error)
    } else {
        console.log(`${username} joined ${room} room`)
    }
});

ws.on('serverToClientTextMessage', (data)=>{
    //console.log('Message Received !', text);
    const html = Mustache.render($messageTemplate, {username: data.username, message: data.text, createdAt: moment(data.createdAt).format('h:mma')});
    $messagesDiv.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

ws.on('serverToClientLocation', (data)=>{
    //console.log('Location Received !', locationURL);
    const html = Mustache.render($locationTemplate, {username: data.username, locationURL: data.url, createdAt: moment(data.createdAt).format('h:mma')});
    $messagesDiv.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

ws.on('roomData', (data)=>{
    //console.log(data.users);
    const html = Mustache.render($sidebarTemplate, {room: data.room, users: data.users});
    $chatSidebar.innerHTML = html
})

function sendMessage(e) {
    e.preventDefault(); 
    $messageFormSubmitBtn.setAttribute('disabled', 'disabled');
    const text = $messageFormInput.value
    ws.emit('clientToServerTextMessage', text, (error)=>{
        $messageFormSubmitBtn.removeAttribute('disabled');
        if(error){
            alert(error)
        }
        console.log('Message:', res)
    })
    //console.log('Sent !', text)
    $messageFormInput.value = ''
}

function shareLocation() {
    if(!navigator.geolocation){
        return alert('Location cannot be shared !')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        $shareLocationBtn.setAttribute('disabled', 'disabled');
        const locationData = {latitude: position.coords.latitude, longitude: position.coords.longitude}
        ws.emit('clientToServerLocation', locationData, async (error)=>{
            await new Promise(r => setTimeout(r, 1000));
            $shareLocationBtn.removeAttribute('disabled');
            if(error){
                alert(error)
            }
            //console.log('Shared Location:', res)
        })
        //console.log(locationData)
    })
}

$messageForm.addEventListener('submit', sendMessage);

$shareLocationBtn.addEventListener('click', shareLocation);