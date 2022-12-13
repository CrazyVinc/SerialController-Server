// var PromiseQueue = require("./Queue");
// var { startupController } = require("../startupController");

class SerialClient {
    constructor() {
        this.clients = [];
    }

    newClient(name = "") {
        var isNewClient = this.clients.some(client => {
            return client.toLowerCase() === name.toLowerCase();
        });
        if(isNewClient) {

        }
    };

    calc(state) {
    }

    resume() {
        this._pause = false;
        this._next();
    };

    toggle() {
        if (this._pause) {
            this._pause = false;
            this._next();
        } else {
            this._pause = true;
        }
        return this._pause;
    }
}












// let ColorQueue = new PromiseQueue({ concurrency:1,
//     category: "Client",
//     saveToDB: true,
//     type: "Color",
// });


// DLQueue.eventEmitter.on('newRunCount', (data) => {
//     if(data == 0) processChart.resume();
//     else processChart.pause();
// });

// parserQueue.eventEmitter.on('resolve', value => console.log(value, 5));

// startupController.eventEmitter.on('Ready', async (value) => {
//     if(value.isFullyReady) {
//         try {
//             await parserQueue.startFromDB();
//             await addToDownloader.startFromDB();
//             await SearchDownload.startFromDB();
//         } catch(err) {
//             console.error(err, 4782);
//         }
//     }
// });


module.exports = {
    SerialClient
}