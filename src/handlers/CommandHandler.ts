import { Client } from "discord.js";
import WOKCommands from "../index";
import { getAllFiles } from "../utils";
import { join } from "path";
import { existsSync } from "fs";
import { Command } from "./Command";

class CommandHandler {
    private _commands: Map<String, Command> = new Map();
    private _client: Client | null = null;
    private _commandChecks: Map<String, Function> = new Map();

    constructor(instance: WOKCommands, client: Client, dir: string, typeScript = false) {
        this._client = client;
        this.setUp(instance, client, dir, typeScript).then();
    }

    private async setUp(instance: WOKCommands, client: Client, dir: string, typeScript = false) {
        // Do not pass in TS here because this should always be compiled to JS
        //for (const [file, fileName] of getAllFiles(join(__dirname, "command-checks")))
            //this._commandChecks.set(fileName, require(file));

        if (dir) {
            if (!existsSync(dir))
                throw new Error(`Commands directory "${dir}" doesn't exist!`);

            const files = getAllFiles(dir, typeScript ? ".ts" : "");
            const amount = files.length;

            console.log(
                `WOKCommands > Loaded ${amount} command${amount === 1 ? "" : "s"}.`
            );

            for (const [file, fileName] of files)
                await this.registerCommand(instance, client, file, fileName);
        }
    }

    public async registerCommand(instance: WOKCommands, client: Client, file: string, fileName: string) {
        let configuration = await require(file);

        // person is using 'export default' so we import the default instead
        if (configuration.default && Object.keys(configuration).length === 1)
            configuration = configuration.default;

        const {
            name = fileName,
            category,
            commands,
            aliases,
            init,
            callback,
            run,
            execute,
            error,
            description,
            slash,
            expectedArgs,
            expectedArgsTypes,
            minArgs,
            options = [],
        } = configuration;

        const { testOnly } = configuration;
        if (run || execute)
            throw new Error(
                `Command located at "${file}" has either a "run" or "execute" function. Please rename that function to "callback".`
            );

        let names = commands || aliases || [];
        if (!name && (!names || names.length === 0))
            throw new Error(
                `Command located at "${file}" does not have a name, commands array, or aliases array set. Please set at lease one property to specify the command name.`
            );

        if (typeof names === "string")
            names = [names];

        if (name && !names.includes(name.toLowerCase()))
            names.unshift(name.toLowerCase());

        const missing = [];
        if (!category)
            missing.push("Category");

        if (!description)
            missing.push("Description");

        if (missing.length && instance.showWarns)
            console.warn(
                `WOKCommands > Command "${names[0]}" does not have the following properties: ${missing}.`
            );

        if (testOnly && !instance.testServers.length)
            console.warn(
                `WOKCommands > Command "${names[0]}" has "testOnly" set to true, but no test servers are defined.`
            );

        if (slash !== undefined && typeof slash !== "boolean" && slash !== "both")
            throw new Error(
                `WOKCommands > Command "${names[0]}" has a "slash" property that is not boolean "true" or string "both".`
            );

        if (!slash && options.length)
            throw new Error(
                `WOKCommands > Command "${names[0]}" has an "options" property but is not a slash command.`
            );

        if (slash) {
            if (!description)
                throw new Error(
                    `WOKCommands > A description is required for command "${names[0]}" because it is a slash command.`
                );

            if (minArgs !== undefined && !expectedArgs)
                throw new Error(
                    `WOKCommands > Command "${names[0]}" has "minArgs" property defined without "expectedArgs" property as a slash command.`
                );

            if (options.length) {
                for (const key in options) {
                    const name = options[key].name;
                    let lowerCase = name.toLowerCase();
                    if (name !== lowerCase && instance.showWarns)
                        console.log(
                            `WOKCommands > Command "${names[0]}" has an option of "${name}". All option names must be lower case for slash commands. WOKCommands will modify this for you.`
                        );

                    if (lowerCase.match(/\s/g)) {
                        lowerCase = lowerCase.replace(/\s/g, "_");
                        console.log(
                            `WOKCommands > Command "${names[0]}" has an option of "${name}" with a white space in it. It is a best practice for option names to only be one word. WOKCommands will modify this for you.`
                        );
                    }

                    options[key].name = lowerCase;
                }
            } else if (expectedArgs) {
                const split = expectedArgs
                    .substring(1, expectedArgs.length - 1)
                    .split(/[>\]] [<\[]/);
                for (let a = 0; a < split.length; ++a) {
                    const item = split[a];

                    options.push({
                        name: item.replace(/ /g, "-").toLowerCase(),
                        description: item,
                        type:
                            expectedArgsTypes && expectedArgsTypes.length >= a
                                ? expectedArgsTypes[a]
                                : "STRING",
                        required: a < minArgs,
                    });
                }
            }

            const slashCommands = instance.slashCommands;
            if (testOnly)
                for (const id of instance.testServers)
                    await slashCommands.create(names[0], description, options, id);
            else
                await slashCommands.create(names[0], description, options);
        }

        if (callback) {
            if (init)
                init(client, instance);

            const command = new Command(instance, client, names, callback, error, configuration);
            for (const name of names)
                // Ensure the alias is lower case because we read as lower case later on
                this._commands.set(name.toLowerCase(), command);
        }
    }

    public getCommand(name: string): Command | undefined {
        return this._commands.get(name);
    }
}

export {
    CommandHandler
};
