const { ws } = require("../SocketIO");
const { clients, SerialClient } = require("./index");

module.exports = ws().of('/client').on("connection", (socket) => {
        /** @type {SerialClient} */
        let client;
        console.info(`There is a client connected[id=${socket.id}]`);

        socket.on('disconnect', () => {
            if(client) clients.removeClient(client);
            console.info(`There is a client disconnected[id=${socket.id}]`);
        });

        socket.on('init', async(data) => {
            client = await clients.newClient({ ...data, socketID: socket.id });
        });
        return socket;
    })