import { Server } from 'socket.io';

export function initSocket(httpServer){
    const io = new Server(httpServer,{
        cors:{origin: '*', methods:['GET', 'POST']}
    });


    io.on('connection', (socket)=>{
          console.log("Socket connected:", socket.id);

        socket.on('auth',({userId})=>{
            if(!userId) return;
            socket.join(userId);
            socket.emit('joined',{room: userId});
        });
        io.engine.on("connection_error", (err) => {
  console.log("Socket engine connection error:", err.req.url, err.message);
});

        socket.on('disconnect',() => {});
    })

    return io;
}