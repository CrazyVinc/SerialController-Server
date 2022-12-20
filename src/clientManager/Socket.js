const { ws } = require("../SocketIO");

const { clients, SerialClient } = require("./index");

ws().of('/client').on("connection", (socket) => {
    /** @type {SerialClient} */
    let client;

    socket.on('disconnect', () => {
        if(client) clients.removeClient(client);
    });

    socket.on('init', async(data) => {
        client = await clients.newClient({ ...data, socket });
    });
    return socket;
});