const { Events, MessageFlags } = require("discord.js");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

// Collection to store modal handlers
const modals = new Map();

// Load all modal handlers
const modalsPath = path.join(__dirname, "..", "components", "modals");
const modalFiles = fs
  .readdirSync(modalsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
  const modal = require(path.join(modalsPath, file));
  modals.set(modal.customId, modal);
  logger.debug(`Loaded modal handler: ${modal.customId}`);
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {    if (!interaction.isModalSubmit()) return; 
    
    // Get base modal ID by matching known patterns
    let baseModalId;
    const customIdParts = interaction.customId.split("-");
    
    // Cek apakah customId mengikuti pola add-product-modal-channelId
    if (customIdParts.length > 3 && customIdParts.slice(0, 3).join("-") === "add-product-modal") {
      baseModalId = "add-product-modal";
    } else {
      // Default behavior: ambil 2 bagian pertama
      baseModalId = customIdParts.slice(0, 2).join("-");
    }
    
    const modal = modals.get(baseModalId);

    if (!modal) {
      logger.warn(
        `No handler found for modal ${baseModalId} (full ID: ${interaction.customId})`
      );
      return;
    }

    if (!modal) {
      logger.warn(`No handler found for modal ${baseModalId}`);
      return;
    }

    try {
      await modal.execute(interaction);
    } catch (error) {
      logger.error(`Error executing modal ${baseModalId}:`, error);
      await interaction
        .reply({
          content: "Terjadi kesalahan saat memproses form!",
          flags: MessageFlags.Ephemeral,
        })
        .catch(() => {}); // Ignore if already replied
    }
  },
};
