const socket=io()
//Elementes
const messageForm=document.querySelector('#message-form');
const messageFormInput=messageForm.querySelector('input');
const messageFormButton=messageForm.querySelector('button')
const sendLoc=document.querySelector("#send-location")
const messages=document.querySelector("#messages")

//Templates
const messageTemplate=document.querySelector("#message-template").innerHTML

socket.on("message",(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        message
    })
    messages.insertAdjacentHTML("beforeend",html)
})

messageForm.addEventListener('submit',(el)=>{
    el.preventDefault()
    //disable
    messageFormButton.setAttribute('disabled','disabled');
    

    const message=el.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        //enable
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value='';
        messageFormInput.focus()
        if(error)
         {
        return console.log(error)
        }else{
            console.log('Message Delivered')
        }
    })
})

sendLoc.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    sendLoc.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        const newObj={latitude:position.coords.latitude,longitude:position.coords.longitude}
        socket.emit('sendLocation',newObj,()=>{
            sendLoc.removeAttribute('disabled')
            console.log('Location Shared')
        })
    },)
})