const { ws } = require("../SocketIO");
const { DB } = require("../DB");
const { Op } = require('sequelize');
const { CronJob } = require("cron");

class Clients {
    constructor() {
        this.clients = {}
    }

    async newClient(opts) {
        if(opts == undefined) return;
        var client = new SerialClient(opts);
        this.clients[client.name] = client;


        var events = await DB.events.findAll({
            where: {
                enabled: true,
                [Op.or]: [{
                    targetType: "client",
                    target: client.name
                }, {
                    triggerDevice: "client",
                }]
            }
        });



        events.forEach((event) => {
            if(!['*', client.name].includes(event.target)) return;

            var cmd = event.onTrigger.split(" ");
            var args = cmd.slice(1);
            cmd = cmd[0];
            if(event.trigger == "onConnect") {
                client.runCommand(cmd, args);
            } else if(event.trigger.startsWith("cron ")) {
                var cron = new CronJob(
                    event.trigger.substring(5), () => {
                        client.runCommand(cmd, args);
                    }, null, true
                );
                this.clients[client.name].crons.push(cron);
            }
        });

        return client;
    }

    async removeClient(client) {
        await client.disconnect();
        delete this.clients[client];
    }

    /**
     * @param {String} name 
     * @returns {SerialClient}
     */
    client(name) {
        if(!name) {
            console.warn("NO CLIENTNAME");
            return new SerialClient();
        }
        if(this.clients[name]) return this.clients[name];
        return new SerialClient();
    }
    get getClients() {
        return this.clients;
    }
}
const clients = new Clients();

class SerialClient {
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
        this.crons = [];
    }

    disconnect() {
        return new Promise(async (resolve, reject) => {
            this.crons.forEach(e => e.stop());
            resolve();
        })
    }

    /**
     * @param {String} cmd
     * @param {String} args
     */
    runCommand(cmd, args) {
        if(this.socketID == null) return console.warn("Invalid SerialClient!");
        console.log(cmd, args);
        // if(this.commands[cmd])
        ws().of('/client').emit('data', `${cmd} ${args}`);
    }
}


module.exports = {
    clients, SerialClient
};