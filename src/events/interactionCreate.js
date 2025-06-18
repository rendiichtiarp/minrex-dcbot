const { MessageFlags } = require("discord.js");
const logger = require("../utils/logger");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    const logContext = {
      userId: interaction.user.id,
      userName: interaction.user.tag,
      guildId: interaction.guildId,
      commandName: interaction.commandName,
      options: interaction.options.data
        .map((opt) => `${opt.name}:${opt.value}`)
        .join(", "),
    };

    if (!command) {
      logger.warn(
        `No command matching ${interaction.commandName} was found.`,
        logContext
      );
      return;
    }

    try {
      logger.info(`Command executed: ${interaction.commandName}`, logContext);
      await command.execute(interaction);
      logger.debug(`Command completed: ${interaction.commandName}`, logContext);
    } catch (error) {
      logger.error(`Error executing command: ${interaction.commandName}`, {
        ...logContext,
        error: error.stack,
      });

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
