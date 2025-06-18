const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed-builder")
    .setDescription("Buat pesan embed custom")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel untuk mengirim pesan embed")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Simpan channel ID di customId agar bisa diakses saat submit
    const channelId = interaction.options.getChannel("channel").id;

    // Buat modal
    const modal = new ModalBuilder()
      .setCustomId(`embed-builder-${channelId}`)
      .setTitle("Buat Embed Custom");

    // Input judul
    const titleInput = new TextInputBuilder()
      .setCustomId("embedTitle")
      .setLabel("Judul Embed")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder("Masukkan judul embed...");

    // Input deskripsi (multiline)
    const descriptionInput = new TextInputBuilder()
      .setCustomId("embedDescription")
      .setLabel("Deskripsi Embed")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder(
        "Tulis deskripsi embed di sini...\nBisa menggunakan enter untuk baris baru"
      ); // Input URL gambar (optional)
    const imageInput = new TextInputBuilder()
      .setCustomId("embedImage")
      .setLabel("Link Gambar (Opsional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder("https://... (kosongkan jika tidak perlu)");

    // Input footer (optional)
    const footerInput = new TextInputBuilder()
      .setCustomId("embedFooter")
      .setLabel("Teks Footer (Opsional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder(
        "Teks yang akan muncul di footer embed (kosongkan jika tidak perlu)"
      );

    // Buat action row untuk setiap input
    const firstRow = new ActionRowBuilder().addComponents(titleInput);
    const secondRow = new ActionRowBuilder().addComponents(descriptionInput);
    const thirdRow = new ActionRowBuilder().addComponents(imageInput);
    const fourthRow = new ActionRowBuilder().addComponents(footerInput);
    // Tambahkan components ke modal
    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

    // Tampilkan modal
    try {
      await interaction.showModal(modal);
    } catch (error) {
      logger.error("Error showing modal:", error);
      await interaction.reply({
        content: "Terjadi kesalahan saat membuka form embed.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
