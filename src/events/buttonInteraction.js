const { Events, MessageFlags } = require("discord.js");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

// Collection to store button handlers
const buttons = new Map();

// Load all button handlers
const buttonsPath = path.join(__dirname, "..", "components", "buttons");
const buttonFiles = fs
  .readdirSync(buttonsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of buttonFiles) {
  const button = require(path.join(buttonsPath, file));
  buttons.set(button.customId, button);
  logger.debug(`Loaded button handler: ${button.customId}`);
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const button = buttons.get(interaction.customId);
    if (!button) {
      logger.warn(`No handler found for button ${interaction.customId}`);
      return;
    }

    try {
      await button.execute(interaction);
    } catch (error) {
      logger.error(`Error executing button ${interaction.customId}:`, error);
      await interaction
        .reply({
          content: "There was an error while executing this button!",
          flags: MessageFlags.Ephemeral,
        })
        .catch(() => {}); // Ignore if already replied
    }
  },
};
