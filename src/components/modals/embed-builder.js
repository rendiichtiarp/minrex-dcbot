const { EmbedBuilder, MessageFlags } = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  customId: "embed-builder", // Base ID yang akan dicocokkan dengan prefix dari modal ID
  async execute(interaction) {
    try {
      // Get channel ID from customId
      const channelId = interaction.customId.split("-").pop();
      const channel = interaction.guild.channels.cache.get(channelId);

      if (!channel) {
        await interaction.reply({
          content: "Channel tidak ditemukan.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      } // Get values from modal
      const title = interaction.fields.getTextInputValue("embedTitle");
      const description =
        interaction.fields.getTextInputValue("embedDescription");
      const imageUrl = interaction.fields.getTextInputValue("embedImage");
      const footerText = interaction.fields.getTextInputValue("embedFooter");

      // Validate image URL if provided
      if (imageUrl && !imageUrl.startsWith("http")) {
        await interaction.reply({
          content: "Link gambar harus dimulai dengan http:// atau https://",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor("#9F00FF") // Warna ungu default
        .setFooter({
          text: `${interaction.guild.name} | ${footerText}`,
          iconURL: interaction.guild.iconURL(),
        });

      // Add image if provided
      if (imageUrl) {
        embed.setImage(imageUrl);
      }

      // Send the embed
      await channel.send({
        embeds: [embed],
      });

      // Reply to the modal
      await interaction.reply({
        content: `Embed berhasil dikirim ke ${channel}!`,
        flags: MessageFlags.Ephemeral,
      });

      logger.info(
        `Custom embed sent in channel ${channel.id} by ${interaction.user.tag}`
      );
    } catch (error) {
      logger.error("Error sending embed:", error);
      await interaction.reply({
        content: "Terjadi kesalahan saat mengirim embed.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
