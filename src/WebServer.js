const http = require('http');

var express = require('express');

const app = express();
const server = http.createServer(app);

const { socketConnection } = require("./SocketIO");
socketConnection(server);
require("./clientManager/Socket");

app.use(express.urlencoded({extended: true}));

app.get("*", function (req, res) {
    res.status(404).send({ error: "NOT FOUND" });
});

module.exports = server