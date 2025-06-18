const { EmbedBuilder, MessageFlags } = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  customId: "add-product-modal",
  async execute(interaction) {
    const channelId = interaction.customId.split("-").pop();
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      await interaction.reply({
        content: "Channel tidak ditemukan.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Get values from modal
    const title = interaction.fields.getTextInputValue("productTitle");
    const description =
      interaction.fields.getTextInputValue("productDescription");
    const imageUrl = interaction.fields.getTextInputValue("productImage");

    // Validate image URL
    if (!imageUrl.startsWith("http")) {
      await interaction.reply({
        content: "Link gambar harus dimulai dengan http:// atau https://",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      // Create the product embed
      const productEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor("#9F00FF")
        .setThumbnail(interaction.guild.iconURL())
        .setImage(imageUrl)
        .setFooter({
          iconURL: interaction.guild.iconURL(),
          text: `${interaction.guild.name} | Produk`,
        });

      // Create the info embed
      const infoEmbed = new EmbedBuilder()
        .setTitle("**Cara Membeli**")
        .setDescription(
          "- Membuat tiket pemesanan di <#1061147057416572928>\n" +
            "- Melakukan pembayaran ke <#1089861130039595061>"
        )
        .setColor("#9F00FF")
        .setFooter({
          iconURL: interaction.guild.iconURL(),
          text: `${interaction.guild.name} | Informasi`,
        });

      // Send both embeds
      await channel.send({
        embeds: [productEmbed, infoEmbed],
      });

      // Reply to the modal
      await interaction.reply({
        content: `Produk berhasil ditambahkan di ${channel}!`,
        flags: MessageFlags.Ephemeral,
      });

      logger.info(
        `Product added in channel ${channel.id} by ${interaction.user.tag}`
      );
    } catch (error) {
      logger.error("Error adding product:", error);
      await interaction.reply({
        content: "Terjadi kesalahan saat menambahkan produk.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
