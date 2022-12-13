const { ws } = require("../SocketIO");
const { clients, SerialClient } = require("./index");

module.exports = ws().of('/client').on("connection", (socket) => {
        /** @type {SerialClient} */
        let client;
        console.info(`There is a client connected[id=${socket.id}]`);

        socket.on('disconnect', () => {
            if(client?.name) clients.removeClient(client.name);
            console.info(`There is a client disconnected[id=${socket.id}]`);
        });

        socket.on('init', (e) => {
            console.log(e)
            client = clients.newClient({ ...e, socketID: socket.id });
            // client.runCommand("RGB", "${R}=255");
        });
        return socket;
    })