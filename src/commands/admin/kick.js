const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Keluarkan member dari server")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Member yang akan dikeluarkan")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("alasan").setDescription("Alasan mengeluarkan member")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason =
      interaction.options.getString("alasan") ?? "Tidak ada alasan";

    // Check if the target is kickable
    if (!target.kickable) {
      return interaction.reply({
        content:
          "Saya tidak bisa mengeluarkan member ini! Mungkin role mereka lebih tinggi dari saya.",
        flags: MessageFlags.Ephemeral,
      });
    }
    try {
      // Buat embed untuk DM
      const kickEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`🚷 Notifikasi Kick`)
        .setDescription(`📢 Anda telah dikeluarkan dari server.`)
        .addFields(
          {
            name: "🏰 Server:",
            value: interaction.guild.name,
            inline: true,
          },
          {
            name: "⛔ Dikeluarkan oleh:",
            value: interaction.user.tag,
            inline: true,
          },
          {
            name: "📝 Alasan:",
            value: reason,
          }
        )
        .setFooter({
          iconURL: interaction.guild.iconURL(),
          text: `${interaction.guild.name} | Notifikasi Kick`,
        })
        .setTimestamp();

      // Kirim DM sebelum kick
      try {
        await target.send({ embeds: [kickEmbed] });
      } catch (dmError) {
        logger.warn(`Tidak bisa mengirim DM ke ${target.user.tag}`, {
          error: dmError,
        });
        // Lanjutkan proses kick meskipun DM gagal
      }

      // Kick user
      await target.kick(reason);

      // Log aksi
      logger.info(
        `${target.user.tag} telah dikick oleh ${interaction.user.tag}`,
        {
          reason: reason,
          guildId: interaction.guildId,
        }
      );

      // Balas ke executor
      await interaction.reply({
        content: `Berhasil mengeluarkan ${target.user.tag}\nAlasan: ${reason}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      logger.error("Error saat melakukan kick:", error);
      await interaction.reply({
        content: "Terjadi kesalahan saat mencoba mengeluarkan member!",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
