import { EventEmitter } from "events";
import { Client } from "discord.js";
import { ICommand, Options } from "./interfaces";
import { CommandHandler, SlashCommands } from "./handlers";

export class WOKCommands extends EventEmitter {
    private readonly _client: Client;
    private _commandsDir?: string;
    private _showWarns?: boolean;
    private _ignoreBots?: boolean;
    private _ephemeral?: boolean;
    private _debug?: boolean;
    private _testServers?: string[];
    private _botOwners?: string[];
    private typescript?: boolean;

    private _commandHandler?: CommandHandler;
    private _slashCommands?: SlashCommands;

    constructor(client: Client, options?: Options) {
        super();

        this._client = client;
        this.checkAndSetup(client, options).then();
    }

    private async checkAndSetup(client: Client, options?: Options) {
        if (!client)
            throw new Error("No Discord JS Client provided as first argument!");

        const {
            commandsDir,
            showWarns,
            ignoreBots,
            testServers,
            botOwners,
            ephemeral,
            debug,
            typescript
        } = options || {};

        this._commandsDir = commandsDir;
        this._showWarns = showWarns;
        this._ignoreBots = ignoreBots;
        this._ephemeral = ephemeral;
        this._debug = debug;
        this.typescript = typescript;

        if (this._commandsDir && !(this._commandsDir.includes("/") || this._commandsDir.includes("\\")))
            throw new Error("WOKCommands > The 'commands' directory must be an absolute path. This can be done by using the 'path' module. More info: https://docs.wornoffkeys.com/setup-and-options-object");

        if (testServers)
            this._testServers = (typeof testServers === "string") ? [testServers] : testServers;
        if (botOwners)
            this._botOwners = (typeof botOwners === "string") ? [botOwners] : botOwners;

        this._commandHandler = new CommandHandler(this, client, this._commandsDir || "", this.typescript);
        this._slashCommands = new SlashCommands(this, true);

        console.log("WOKCommands > Your bot is now running.");
    }

    get client(): Client {
        return this._client;
    }

    get showWarns(): boolean {
        return this._showWarns || false;
    }

    get ephemeral(): boolean {
        return this._ephemeral || false;
    }

    get testServers(): string[] {
        return this._testServers || [];
    }

    get commandHandler(): CommandHandler {
        return this._commandHandler || new CommandHandler(this, this._client, this._commandsDir || "", this.typescript);
    }

    get slashCommands(): SlashCommands {
        return this._slashCommands || new SlashCommands(this, true);
    }
}

export {
    ICommand
};
