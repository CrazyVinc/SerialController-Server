const { Server } = require('socket.io');
let io;

exports.socketConnection = (httpServer) => {
    io = new Server(httpServer)
    io.on('connection', (socket) => {
        console.info(`Client connected [id=${socket.id}]`);

        socket.on('disconnect', () => {
            console.info(`Client disconnected [id=${socket.id}]`);
        });
    });
    return io;
}

module.exports.ws = () => io;