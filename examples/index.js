const { join } = require("path");
const { Client, GatewayIntentBits } = require("discord.js");
const WOKCommands = require("wokcommands");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ],
});

client.on("ready", () => {
    new WOKCommands(client, {
        // The name of the local folder for your command files
        commandsDir: join(__dirname, "commands"),
        testServers: ["YOUR_SERVER_ID"]
    });
});

client.login("BOT_TOKEN_HERE");
