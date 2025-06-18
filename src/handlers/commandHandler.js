const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const logger = require("../utils/logger");

module.exports = (client) => {
  const commands = [];
  const commandsPath = path.join(__dirname, "..", "commands");

  // Function to recursively read command files from directories
  function loadCommands(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        loadCommands(filePath);
      } else if (file.endsWith(".js")) {
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
          commands.push(command.data.toJSON());
          logger.debug(`Loaded command: ${command.data.name} from ${filePath}`);
        } else {
          logger.warn(
            `Command at ${filePath} missing required "data" or "execute" property`
          );
        }
      }
    }
  }

  // Load all commands
  loadCommands(commandsPath); // Deploy commands
  const rest = new REST().setToken(process.env.TOKEN);
  const isDevelopment = process.env.DEVELOPMENT === "true";

  (async () => {
    try {
      logger.info(
        `Started refreshing ${
          isDevelopment ? "development" : "global"
        } application (/) commands.`
      );
      logger.debug(`Found ${commands.length} commands to register`);

      let data;
      if (isDevelopment) {
        // In development mode, register commands only to development server
        logger.debug(
          `Registering commands to development guild: ${process.env.DEV_GUILD_ID}`
        );
        data = await rest.put(
          Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.DEV_GUILD_ID
          ),
          { body: commands }
        );
        logger.info(
          `Successfully reloaded ${data.length} development commands for guild ${process.env.DEV_GUILD_ID}`
        );
      } else {
        // In production mode, register commands globally
        logger.debug("Registering commands globally");
        data = await rest.put(
          Routes.applicationCommands(process.env.CLIENT_ID),
          { body: commands }
        );
        logger.info(`Successfully reloaded ${data.length} global commands`);
      }
    } catch (error) {
      logger.error("Error while registering commands:", error);
    }
  })();
};
