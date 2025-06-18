const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const logger = require("../../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-product")
    .setDescription("Tambahkan produk baru dengan pesan embed")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel untuk mengirim pesan produk")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Simpan channel ID di customId agar bisa diakses saat submit
    const channelId = interaction.options.getChannel("channel").id;

    // Buat modal
    const modal = new ModalBuilder()
      .setCustomId(`add-product-modal-${channelId}`)
      .setTitle("Tambah Produk Baru");

    // Input judul
    const titleInput = new TextInputBuilder()
      .setCustomId("productTitle")
      .setLabel("Judul Produk")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    // Input deskripsi (multiline)
    const descriptionInput = new TextInputBuilder()
      .setCustomId("productDescription")
      .setLabel("Deskripsi Produk")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder("Tulis deskripsi produk lengkap di sini...");

    // Input URL gambar
    const imageInput = new TextInputBuilder()
      .setCustomId("productImage")
      .setLabel("Link Gambar (https://...)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder("https://...");

    // Buat action row untuk setiap input
    const firstRow = new ActionRowBuilder().addComponents(titleInput);
    const secondRow = new ActionRowBuilder().addComponents(descriptionInput);
    const thirdRow = new ActionRowBuilder().addComponents(imageInput);

    // Tambahkan components ke modal
    modal.addComponents(firstRow, secondRow, thirdRow);

    // Tampilkan modal
    try {
      await interaction.showModal(modal);
    } catch (error) {
      logger.error("Error showing modal:", error);
      await interaction.reply({
        content: "Terjadi kesalahan saat membuka form produk.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
