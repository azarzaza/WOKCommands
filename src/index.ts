import { Client } from "discord.js";
import { EventEmitter } from "events";
import { CommandHandler, SlashCommands, } from "./handlers";
import { Commands } from "./interfaces";

export default class WOKCommands extends EventEmitter {
    private readonly _client: Client;
    private _commandsDir = "commands";
    private _commandHandler: CommandHandler | null = null;
    private _showWarns = true;
    private _ignoreBots = true;
    private _botOwner: string[] = [];
    private _testServers: string[] = [];
    private _ephemeral = true;
    private _debug = false;
    private _slashCommand: SlashCommands | null = null;

    constructor(client: Client, options?: Commands) {
        super();

        this._client = client;
        this.setUp(client, options).then();
    }

    private async setUp(client: Client, options?: Commands) {
        if (!client)
            throw new Error("No Discord JS Client provided as first argument!");

        let {
            commandsDir = "",
            showWarns = true,
            ignoreBots = true,
            testServers,
            botOwners,
            ephemeral = true,
            debug = false,
        } = options || {};

        this._commandsDir = commandsDir || this._commandsDir;
        this._ephemeral = ephemeral;
        this._debug = debug;

        if (this._commandsDir && !(this._commandsDir.includes("/") || this._commandsDir.includes("\\")))
            throw new Error(
                "WOKCommands > The 'commands' directory must be an absolute path. This can be done by using the 'path' module. More info: https://docs.wornoffkeys.com/setup-and-options-object"
            );

        if (testServers) {
            if (typeof testServers === "string")
                testServers = [testServers];

            this._testServers = testServers;
        }

        if (botOwners) {
            if (typeof botOwners === "string")
                botOwners = [botOwners];

            this._botOwner = botOwners;
        }

        this._showWarns = showWarns;
        this._ignoreBots = ignoreBots;

        this._commandHandler = new CommandHandler(this, client, this._commandsDir);
        this._slashCommand = new SlashCommands(this, true);

        console.log("WOKCommands > Your bot is now running.");
    }

    public get client(): Client {
        return this._client;
    }

    public get commandHandler(): CommandHandler {
        return this._commandHandler!;
    }

    public get showWarns(): boolean {
        return this._showWarns;
    }

    public get ignoreBots(): boolean {
        return this._ignoreBots;
    }

    public get botOwner(): string[] {
        return this._botOwner;
    }

    public setBotOwner(botOwner: string | string[]): WOKCommands {
        console.log(
            "WOKCommands > setBotOwner() is deprecated. Please specify your bot owners in the object constructor instead. See https://docs.wornoffkeys.com/setup-and-options-object"
        );

        if (typeof botOwner === "string")
            botOwner = [botOwner];
        this._botOwner = botOwner;

        return this;
    }

    public get testServers(): string[] {
        return this._testServers;
    }

    public get ephemeral(): boolean {
        return this._ephemeral;
    }

    public get debug(): boolean {
        return this._debug;
    }

    public get slashCommands(): SlashCommands {
        return this._slashCommand!;
    }
}

export {
    WOKCommands
};
