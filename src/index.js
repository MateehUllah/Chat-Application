const path=require('path')
const http=require('http')
const express=require("express")
const socketio=require("socket.io")
const filter=require('bad-words')
const{generateMessage,generateLocationMessage}=require('./utils/message')

const app = express();
const server=http.createServer(app)
const io=socketio(server)

const Port=process.env.PORT||3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))
io.on("connection",(socket)=>{
    console.log("New WebSocket Connection")
  
  socket.on('join',({username,room})=>{
    socket.join(room)
    //io.to.emit,socket.broadcase.to.emit
    //above methods are for specific group
    //Emiting msg to new client
   socket.emit("message",generateMessage('Welcome!!!'))
   // To emit everybody except new connection
   socket.broadcast.to(room).emit('message',generateMessage(`${username} has joined!!!`))
  })


   socket.on('sendMessage',(message,callback)=>{
   const filte=new filter()
   if(filte.isProfane(message)){
    return callback('Profanity is not allowed')
   }
    //Every client
    io.emit('message',generateMessage(message))
   //sending acknowledgment back to client
    callback()
  })

  //while sharing location
  socket.on("sendLocation",(position,callback)=>{
  
    io.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`))
    
    callback()
  })
  //when disconnected
  socket.on('disconnect',()=>{

    io.emit("message",generateMessage('A user has left!!!'))
  })

})


server.listen(Port,()=>{
    console.log(`Application is running on port ${Port}`)
})