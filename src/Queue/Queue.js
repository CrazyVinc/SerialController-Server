const { EventEmitter } = require("events");
const { Op } = require('sequelize')
const { v4 } = require("uuid");
var UglifyJS = require("uglify-js");

function wait(time = 1000) {
    return new Promise(async function (resolve, reject) {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

class PromiseQueue {
    constructor(opts) {
        this.eventEmitter = new EventEmitter()
        this._queue = [];
        this._pause = false;
        opts = Object.assign({
            concurrency: 1,
            type: "default",
            saveToDB: true,
            allowDublicatesInQueue: true,
            MaxExecTimes: 0,
            category: "default",
            db: null
        }, opts);
        this._inQueueObjs = [];

        if(saveToDB && opts.db == null) throw console.error("No sequelize DB given, cant save to DB.")
        if(saveToDB) this.DB = opts.db;
        
        if (opts.concurrency < 1) {
            throw console.error("Expected `concurrency` to be an integer which is bigger than 0");
        }
        this.allowDublicatesInQueue = opts.allowDublicatesInQueue;
        this.saveToDB = opts.saveToDB

        this._ongoingCount = 0;
        this.MaxExecTimes = opts.MaxExecTimes;
        this._concurrency = opts.concurrency;
        this._type = opts.type;
        this._job_category = opts.category;
        this.RemainingTime = 0;

        setInterval(() => {
            if(this.RemainingTime == 0) return;
            this.RemainingTime -= 1;
        }, 1000);
        
        this.ExecutionTimes = []
        this.calcTime = Date.now();
    }

    async startFromDB() {
    return new Promise(async (resolve, reject) => {
        await this.DB.Queue.findAll({
            where: {
                job_type: this._type,
                job_category: this._job_category,
                status: {
                    [Op.or]: [
                        {[Op.not]: "completed"},
                        {[Op.is]: null}
                    ]
                }
            }
        }).then((result) => {
            resolve(result);
            return result.forEach((QueueItem) => {
                let args;
                try {
                    args = JSON.parse(QueueItem.args);
                } catch (e) {
                    args = QueueItem.args;
                }
                this.add(args, QueueItem.functioncode, QueueItem.UUID)
            });
        }).catch(err => {
            console.error(err, 582);
            reject(err);
        });
    });
    }

    pause() {
        this._pause = true;
    };

    calc(state) {
        if(state) {
            this.calcTime = Date.now();
        } else {
            this.ExecutionTimes.push(Date.now() - this.calcTime);
            
            if(this.MaxExecTimes > 0) {
                if(this.ExecutionTimes.length >= this.MaxExecTimes) this.ExecutionTimes.shift();
            }
            
            this.calcTime = null;
            var msCalc = 0;
            this.ExecutionTimes.forEach((ms) => {
                msCalc = msCalc + Math.floor(ms / 1000)
            })

            this.RemainingTime = (msCalc / this.ExecutionTimes.length) * (this._queue.length / this._concurrency)
            this.eventEmitter.emit("countdownTime", this.RemainingTime);
        }
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

    add(args, fn, isFromDB = false) {
        if (Array.isArray(fn)) {
            // TODO: Find the need of this code
            // console.log("hoi", 457347, 3, args,4,  fn, 5, isFromDB, 473);
            if (fn.length > 1) {
                const res = this.add(fn.shift());
                if (!(res instanceof TypeError)) {
                    return this.add(fn);
                }
            }
            return this.add(fn[0]);
        } else {
            let minify;
            let UUID;
            if(isFromDB !== false) {
                minify = {code:fn};
                UUID = isFromDB;
            } else {
                minify = UglifyJS.minify(fn.toString(), {
                    compress: false/*{
                        module: true,
                        side_effects: false,
                        arguments: false,
                    }*/, v8: true,
                });
                // minify = {code:fn.toString()};
                UUID = v4();
            }

            if(!this.allowDublicatesInQueue) {
                if(this._inQueueObjs.includes({args, fnStr: minify.code.toString()})) return this._next();
            }

            if(this.saveToDB) {
                this.DB.Queue.findOrCreate({
                    where: {
                        UUID,
                        job_type: this._type,
                        job_category: this._job_category,
                        functioncode: minify.code,
                    },
                    defaults: {
                        args
                    }
                });
            }
            

            new Promise(async (resolve) => {
                await wait(250);
                const run = async () => {
                    this._ongoingCount++;
                    this.eventEmitter.emit("ongoingCount", this._ongoingCount);
                    this.eventEmitter.emit("_queueLength", this._queue.length);
                    this.eventEmitter.emit("newRunCount", (this._ongoingCount + this._queue.length));
                    if(this.saveToDB) {
                        await this.DB.Queue.update({
                            status: "running",
                            started: new Date()
                        }, {
                            where: {
                                UUID,
                                job_type: this._type,
                                job_category: this._job_category,
                                functioncode: minify.code,
                            },
                        });
                    }
                    let p = eval(minify.code)(args);
                    p.then(async(val) => {
                        resolve(val);
                        this.eventEmitter.emit("resolve", {
                            UUID,
                            result: val
                        });
                        if(this.saveToDB) {
                            await this.DB.Queue.update({
                                result: val,
                                status: "completed",
                                completed: new Date()
                            }, {
                                where: {
                                    UUID,
                                    job_type: this._type,
                                    job_category: this._job_category,
                                    functioncode: minify.code,
                                },
                            });
                        }
                        this._ongoingCount--;
                        this._next();
                    }).catch(async(err) => {
                        console.error(__filename, err, 842, 1211);
                        if(this.saveToDB) {
                            await this.DB.Queue.update({
                                result: JSON.stringify(err),
                                status: "failed",
                                completed: new Date()
                            }, {
                                where: {
                                    UUID,
                                    job_type: this._type,
                                    job_category: this._job_category,
                                    functioncode: minify.code,
                                },
                            });
                        }
                        this._ongoingCount--;
                        this._next();
                    });
                };
                if (this._ongoingCount < this._concurrency && !this._pause) {
                    run();
                } else {
                    if(!this.allowDublicatesInQueue)
                        this._inQueueObjs.push({ args, fnStr: minify.code.toString() });
                    this._queue.push(run);
                }
            });
            return this;
        }
    }

    get Remaining() {
        return this.RemainingTime;
    }

    // Promises which are not ready yet to run in the queue.
    get waitingCount() {
        return this._queue.length;
    }

    // Promises which are running but not done.
    get ongoingCount() {
        return this._ongoingCount;
    }

    _next() {
        if (this._ongoingCount >= this._concurrency || this._pause) {
            return;
        }

        if (this._queue.length > 0) {
            const firstQueueTask = this._queue.shift();
            
            if (firstQueueTask) {
                this._inQueueObjs.shift();
                firstQueueTask();
            }
        } else {
            if (this._ongoingCount == 0) {
                this.ExecutionTimes = [];
                console.log("Queue helemaal verwerkt", this._ongoingCount);
                this.eventEmitter.emit("empty");
            }
        }

        this.eventEmitter.emit("ongoingCount", this._ongoingCount);
        this.eventEmitter.emit("_queueLength", this._queue.length);
        this.eventEmitter.emit("newRunCount", (this._ongoingCount + this._queue.length));
    }
}

module.exports = PromiseQueue;