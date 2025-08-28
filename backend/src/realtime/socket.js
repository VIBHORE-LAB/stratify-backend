import { Server } from 'socket.io';

export function initSocket(httpServer){
    const io = new Server(httpServer,{
        cors:{origin: '*', methods:['GET', 'POST']}
    });


    io.on('connection', (socket)=>{
        socket.on('auth',({userId})=>{
            if(!userId) return;
            socket.join(userId);
            socket.emit('joined',{room: userId});
        });

        socket.on('disconnect',() => {});
    })

    return io;
}