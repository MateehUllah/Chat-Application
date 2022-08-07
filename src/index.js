const path=require('path')
const http=require('http')
const express=require("express")
const socketio=require("socket.io")
const filter=require('bad-words')
const app = express();
const server=http.createServer(app)
const io=socketio(server)


const Port=process.env.PORT||3000

const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))
io.on("connection",(socket)=>{
    console.log("New WebSocket Connection")
  

   //Emiting msg to new client
   socket.emit("message","Welcome to chat Applciation")
   // To emit everybody except new connection
   socket.broadcast.emit('message','A new user has joined')

   socket.on('sendMessage',(message,callback)=>{
   const filte=new filter()
   if(filte.isProfane(message)){
    return callback('Profanity is not allowed')
   }
    //Every client
    io.emit('message',message)
   //sending acknowledgment back to client
    callback()
  })

  //while sharing location
  socket.on("sendLocation",(position,callback)=>{
  
    io.emit('message',`https://google.com/maps?q=${position.latitude},${position.longitude}`)
    
    callback()
  })
  //when disconnected
  socket.on('disconnect',()=>{
    io.emit("message","A User has left!!")
  })

})


server.listen(Port,()=>{
    console.log(`Application is running on port ${Port}`)
})