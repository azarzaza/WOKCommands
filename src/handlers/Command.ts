import { Client, Message } from "discord.js";
import WOKCommands from "../index";
import { ICommand } from "../interfaces";

class Command {
    private readonly instance: WOKCommands;
    private readonly client: Client;
    private readonly _names: string[] = [];
    private readonly _category: string = "";
    private readonly _description?: string;
    private readonly _callback: Function = () => {
    };
    private readonly _error: Function | null = null;
    private readonly _ownerOnly: boolean = false;
    private readonly _guildOnly: boolean = false;
    private readonly _testOnly: boolean = false;
    private readonly _slash: boolean | string = false;

    constructor(instance: WOKCommands, client: Client, names: string[], callback: Function, error: Function, {
        category,
        description,
        guildOnly = false,
        testOnly = false,
        slash = false
    }: ICommand) {
        this.instance = instance;
        this.client = client;
        this._names = names;
        this._category = category;
        this._description = description;
        this._guildOnly = guildOnly;
        this._testOnly = testOnly;
        this._callback = callback;
        this._error = error;
        this._slash = slash;
    }

    public async execute(message: Message, args: string[]) {
        const reply = await this._callback({
            message,
            channel: message.channel,
            args,
            text: args.join(" "),
            client: this.client,
            instance: this.instance,
            user: message.author,
            member: message.member,
            guild: message.guild
        });

        if (!reply)
            return;

        if (typeof reply === "string")
            message.reply({
                content: reply,
            }).then();
        else if (typeof reply === "object")
            if (reply.custom)
                message.reply(reply).then();
            else {
                let embeds = [];
                if (Array.isArray(reply))
                    embeds = reply;
                else
                    embeds.push(reply);

                message.reply({
                    embeds,
                }).then();
            }
    }

    public get names(): string[] {
        return this._names;
    }

    public get category(): string {
        return this._category;
    }

    public get description(): string | undefined {
        return this._description;
    }

    public get testOnly(): boolean {
        return this._testOnly;
    }

    public get guildOnly(): boolean {
        return this._guildOnly;
    }

    public get ownerOnly(): boolean {
        return this._ownerOnly;
    }

    public get callback(): Function {
        return this._callback;
    }

    public get error(): Function | null {
        return this._error;
    }

    public get slash(): boolean | string {
        return this._slash;
    }
}

export {
    Command
};
