const socket=io()
//Elementes
const messageForm=document.querySelector('#message-form');
const messageFormInput=messageForm.querySelector('input');
const messageFormButton=messageForm.querySelector('button')
const sendLoc=document.querySelector("#send-location")
const messages=document.querySelector("#messages")

//Templates
const messageTemplate=document.querySelector("#message-template").innerHTML
const locationTemplate=document.querySelector("#location-message-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML

//options
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

const autoScroll=()=>{
//new Message
const newMessage=messages.lastElementChild

//Height of the new message
const newMessageStyles=getComputedStyle(newMessage)
const newMessageMargin=parseInt(newMessageStyles.marginBottom)
const newMessageHeight=newMessage.offsetHeight+newMessageMargin

//Visible Height
const visibleHeight=messages.offsetHeight

//Height of messages container

const containerHeight=messages.scrollHeight

//How far we are scrolled

const scrollOfset=messages.scrollTop+visibleHeight

if(containerHeight-newMessageHeight<=scrollOfset){
messages.scrollTop=messages.scrollHeight

}


}


socket.on("message",(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
       })
    messages.insertAdjacentHTML("beforeend",html)
    autoScroll()

})

socket.on("locationMessage",(url)=>{
    console.log(url)
    const html=Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML("beforeend",html)
    autoScroll()
})

socket.on("roomData",({room,users})=>{
   const html=Mustache.render(sidebarTemplate,{
    room,users
   })
   document.querySelector("#sidebar").innerHTML=html;
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
socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }
})