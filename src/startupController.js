const { EventEmitter } = require("events");
                    
class startupController {
    constructor() {
        this.eventEmitter = new EventEmitter()
        this.list = [];
        this.completed = [];
        this.starting = [];
    }

    /**
     * @param {String} name
     */
    complete(name) {
        if(this.list.includes(name)) {
            if(this.completed.includes(name)) return;
            this.completed.push(name);
            var index = this.starting.indexOf(name);
            if(index > -1) this.starting.splice(index, 1);

            // if(this.list.length == this.completed.length) {}
            this.eventEmitter.emit("Ready", {
                newReady: name,
                Ready: this.completed,
                notReady: this.starting,
                isFullyReady: (this.list.length == this.completed.length)
            });
            this.eventEmitter.emit(name);
        }
    }

    get isFullyStarted() {
        if(this.list.length == this.completed.length) return true;
        return false;
    }

    /**
     * @param {String} name
     */
    addProcess(name) {
        if(this.list.includes(name)) return;
        this.list.push(name)
        this.starting.push(name)
    }

}

module.exports = {
    startupController: new startupController()
};