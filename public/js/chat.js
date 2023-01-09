const ws = io();

ws.on('pull', (text)=>{
    //console.log('Message Received !', text);
    document.getElementById('chatbox').value += text;
})

function sendMessage(e) {
    e.preventDefault(); 
    const messagerBox = e.target.elements.message
    const text = messagerBox.value
    ws.emit('push', text)
    //console.log('Sent !', text)
    messagerBox.value = ''
}

document.querySelector('#message-form').addEventListener('submit', sendMessage);