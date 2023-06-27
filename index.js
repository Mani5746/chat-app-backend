

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const userRoutes=require(`./routes/userRoutes`)
const messageRoute=require("./routes/messageRoute")
const socket=require("socket.io")
const BASE_URL= process.env.BASE_URL

 const app = express();
 require('dotenv').config();


app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
res.send("Server Started!")
})

app.use('/api/auth', userRoutes);
app.use('/api/messages', messageRoute);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection Succesful')
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is started on ${process.env.PORT}`);
});

const io=socket(server,{
cors:{
origin:`${ BASE_URL}`,
credentials:true,
}
})

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});

