const path=require('path')
const http=require('http')
const express=require("express")
const socketio=require("socket.io")
const filter=require('bad-words')
const{generateMessage,generateLocationMessage}=require('./utils/message')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')
const app = express();
const server=http.createServer(app)
const io=socketio(server)

const Port=process.env.PORT||3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))
io.on("connection",(socket)=>{
    console.log("New WebSocket Connection")
  
  socket.on('join',(options,callback)=>{
    const{error,user}=addUser({id:socket.id,...options})
    
    if(error){
      return callback(error)
    }


    socket.join(user.room)
    //io.to.emit,socket.broadcase.to.emit
    //above methods are for specific group
    //Emiting msg to new client
   socket.emit("message",generateMessage('Admin','Welcome!!!'))
   // To emit everybody except new connection
   socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!!!`))
    io.to(user.room).emit("roomData",{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
   callback()
  })


   socket.on('sendMessage',(message,callback)=>{
    const user=getUser(socket.id)
      const filte=new filter()
    if(filte.isProfane(message)){
      return callback('Profanity is not allowed')
    }
      //Every client
      io.to(user.room).emit('message',generateMessage(user.username,message))
    //sending acknowledgment back to client
      callback()
  })

  //while sharing location
  socket.on("sendLocation",(position,callback)=>{
    const user=getUser(socket.id)
      io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
      
      callback()
  })
  //when disconnected
  socket.on('disconnect',()=>{
    const user=removeUser(socket.id)
    if(user){
    io.to(user.room).emit("message",generateMessage('Admin',`${user.username} has left!!!`))
    io.to(user.room).emit("roomData",{
      room:user.room,
      users:getUsersInRoom(user.room)
    })  
  }
  })

})


server.listen(Port,()=>{
    console.log(`Application is running on port ${Port}`)
})