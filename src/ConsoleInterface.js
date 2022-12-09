const { clients } = require('./clientManager');

/* Console Interface */
var stdin = process.openStdin();

stdin.addListener("data", async (d) => {
  var input = String(d).trim().replace('\\r\\n', '');
  args = input.split(" ");
  try {
    const cmd = (cmd) => cmd.toLowerCase() == args[0].toLowerCase();

    if(/ +/.test(args[0])) {
      console.log("Commands:");
      console.log("- list");
      console.log("- client");
      //TODO Create a real commandHandler
    } else if(cmd('list')) console.log(clients.getClients);
    else if(cmd("client")) {
      if(args.length > 2) {
        clients.client(args[1]).runCommand(args[2], args.slice(3).join(" "));
      } else {
        console.log(`Needed 3+ arguments, got only ${args.length} args`)
      }
    } else {
        console.log("Not a valid command.", args.length);
    }
  } catch (error) {
    console.warn(error);
  }
});