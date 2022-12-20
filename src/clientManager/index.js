const fs = require('fs');
if(!fs.existsSync("./data")) fs.mkdirSync("./data");

const { Op } = require('sequelize');
const { CronJob } = require("cron");
const { Socket } = require('socket.io');


const { DB } = require("../DB");

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
            var args = cmd.slice(1).join(" ");
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
            socket: null,
            commands: {},
            Controls: {},
            storeRemote: {
                saveCMD: false,
                getCMD: false
            }
        }, opts);

        /** @type {Socket} */
        this.socket = opts.socket;
        this.name = opts.clientName;
        this.commands = opts.commands;
        this.Controls = opts.Controls;
        this.crons = [];
        this.saveCMD = opts.storeRemote?.saveCMD;
        this.getCMD = opts.storeRemote?.getCMD;

        console.log(`Client ${this.name} is connected.`)

        if(this.getCMD) {
            try {
                var command = JSON.parse(fs.readFileSync(`data/${this.name}.json`, { encoding: 'utf8' }));
                this.runCommand(command.cmd, command.args);
            } catch(err) {}
        }
    }
    /**
    * @param {Object} cmdObj
    * @param {string} cmd
    * @return {boolean}
    */
    isCMD(cmdObj, cmd) {
        var res = cmdObj[Object.keys(cmdObj).find(key => key.toLowerCase() === cmd.toLowerCase())];
        return (res !== undefined);
    }

    disconnect() {
        console.log(`Client ${this.name} is disconnected, starting cleanup.`)
        return new Promise(async (resolve, reject) => {
            this.crons.forEach(e => e.stop());
            resolve();
            console.log(`The cleanup for ${this.name} is completed.`)
        })
    }

    /**
     * @param {String} cmd
     * @param {String} args
     */
    runCommand(cmd, args) {
        if(this.socket == null) return console.warn("Invalid SerialClient!");
        if(this.saveCMD) fs.writeFileSync(`data/${this.name}.json`, JSON.stringify({cmd, args}));

        if(this.isCMD(this.commands, cmd)) {
            this.socket.emit('data', `${cmd} ${args}`);
        } else {
            console.warn(`The command ${cmd} ${args} is not registered.`);
        }
    }
}


module.exports = {
    clients, SerialClient
};