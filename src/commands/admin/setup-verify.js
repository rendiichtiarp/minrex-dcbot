const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const logger = require("../../utils/logger");
const db = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-verify")
    .setDescription("Setup sistem verifikasi")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel untuk mengirim pesan verifikasi")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Role yang akan diberikan saat member terverifikasi")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const role = interaction.options.getRole("role");

    // Validate role hierarchy
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      await interaction.reply({
        content:
          "Saya tidak bisa memberikan role tersebut karena posisinya lebih tinggi atau setara dengan role tertinggi saya. Mohon pindahkan role saya di atas role verifikasi.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    } // Store verification settings in database
    await db.verification.saveSettings(
      interaction.guildId,
      channel.id,
      role.id
    );

    // Create the embed
    const verifyEmbed = new EmbedBuilder()
      .setTitle("**Verifikasi**")
      .setDescription(
        `Selamat datang di ${interaction.guild.name}! Ketuk tombol di bawah untuk memverifikasi diri Anda dan mendapatkan role ${role}.`
      )
      .setColor("#9F00FF")
      .setThumbnail(interaction.guild.iconURL())
      .setImage(
        "https://cdn.discordapp.com/attachments/1382999797786476737/1383859750311301220/Verifikasi.png?ex=6852f653&is=6851a4d3&hm=617839e4e1524467279d4dacff58445619bd5b3200323060406f59dd3fff4bb1&"
      )
      .setFooter({
        iconURL: interaction.guild.iconURL(),
        text: `${interaction.guild.name} | Verifikasi`,
      });

    // Create the button
    const verifyButton = new ButtonBuilder()
      .setCustomId("verify-button")
      .setLabel("Verifikasi")
      .setStyle(ButtonStyle.Success)
      .setEmoji("✅");

    const row = new ActionRowBuilder().addComponents(verifyButton);

    try {
      // Send the verification message
      await channel.send({
        embeds: [verifyEmbed],
        components: [row],
      });

      // Reply to the command user
      await interaction.reply({
        content: `Sistem verifikasi telah diatur di ${channel} dengan role ${role}!`,
        flags: MessageFlags.Ephemeral,
      });

      logger.info(
        `Verification system set up in channel ${channel.id} with role ${role.id} by ${interaction.user.tag}`
      );
    } catch (error) {
      logger.error("Error setting up verification system:", error);
      await interaction.reply({
        content: "Terjadi kesalahan saat mengatur sistem verifikasi.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
