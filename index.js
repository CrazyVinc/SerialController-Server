require("dotenv-flow").config();

require("./src/startupController");
const server = require("./src/WebServer");
require("./src/ConsoleInterface")

server.listen(process.env.port, () => {
    console.log(`The server is running on port: ${process.env.port}`);
});