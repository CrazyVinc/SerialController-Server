const { ws } = require("../SocketIO");


class Clients {
    constructor() {
        this.clients = {}
    }

    newClient(opts) {
        if(opts == undefined) return;
        var client = new LEDClient(opts);
        this.clients[client.name] = client;
        return client;
    }

    removeClient(client) {
        delete this.clients[client];
    }

    /**
     * @param {String} name 
     * @returns {LEDClient}
     */
    client(name) {
        if(!name) {
            console.warn("NO CLIENTNAME");
            return new LEDClient();
        }
        if(this.clients[name]) return this.clients[name];
        return new LEDClient();
    }
    get getClients() {
        return this.clients;
    }
}
const clients = new Clients();

class LEDClient {
    constructor(opts) {
        opts = Object.assign({
            clientName: null,
            socketID: null,
            commands: {},
            Controls: {},
        }, opts);

        this.socketID = opts.socketID;
        this.name = opts.clientName;
        this.commands = opts.commands;
        this.Controls = opts.Controls;
    }

    /**
     * @param {String} cmd
     * @param {String} args
     */
    runCommand(cmd, args) {
        if(this.socketID == null) return console.warn("Invalid LEDClient!");
        console.log(cmd, args);
        // if(this.commands[cmd])
        ws().of('/client').emit('data', `${cmd} ${args}`);
    }
}


module.exports = {
    clients, LEDClient
};