import {
    ApplicationCommandOptionData,
    Client,
    CommandInteraction, Guild,
    GuildMember,
    Message,
    TextChannel,
    User
} from "discord.js";
import WOKCommands from "../index";

interface ICallbackObject {
    channel: TextChannel;
    message: Message;
    args: string[];
    text: string;
    client: Client;
    prefix: string;
    instance: WOKCommands;
    interaction: CommandInteraction;
    options: ApplicationCommandOptionData[];
    user: User;
    member: GuildMember;
    guild: Guild | null;

    cancelCoolDown(): any;
}

interface IErrorObject {
    command: string;
    message: Message;
    info: object;
}

interface ICommand {
    names?: string[] | string;
    aliases?: string[] | string;
    category: string;
    description: string;

    callback?(obj: ICallbackObject): any;

    error?(obj: IErrorObject): any;

    guildOnly?: boolean;
    testOnly?: boolean;
    slash?: boolean | "both";
    options?: ApplicationCommandOptionData[];
}

interface Commands {
    commandsDir: string;
    showWarns?: boolean;
    ignoreBots?: boolean;
    testServers?: string | string[];
    botOwners?: string | string[];
    ephemeral?: boolean;
    debug?: boolean;
}

export {
    ICommand,
    Commands
};
