import { Server } from 'socket.io';

export function initSocket(httpServer){
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",              
      "https://stratifyy.netlify.app"     
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});


    io.on('connection', (socket)=>{
          console.log("Socket connected:", socket.id);

        socket.on('auth',({userId})=>{
            if(!userId) return;
            socket.join(userId);
            socket.emit('joined',{room: userId});
        });
        io.engine.on("connection_error", (err) => {
});

        socket.on('disconnect',() => {});
    })

    return io;
}