const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban member dari server")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Member yang akan diban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("alasan").setDescription("Alasan melakukan ban")
    )
    .addNumberOption((option) =>
      option
        .setName("hapus_pesan")
        .setDescription("Hapus riwayat pesan berapa hari kebelakang?")
        .addChoices(
          { name: "Tidak hapus", value: 0 },
          { name: "1 Hari", value: 1 },
          { name: "2 Hari", value: 2 },
          { name: "3 Hari", value: 3 },
          { name: "7 Hari", value: 7 }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason =
      interaction.options.getString("alasan") ?? "Tidak ada alasan";
    const deleteMessageDays = interaction.options.getNumber("hapus_pesan") ?? 0;

    // Check if the target is bannable
    if (!target.bannable) {
      return interaction.reply({
        content:
          "Saya tidak bisa melakukan ban pada member ini! Mungkin role mereka lebih tinggi dari saya.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      // Buat embed untuk DM
      const banEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`🚫 Notifikasi Ban`)
        .setDescription(`📢 Anda telah diban dari server.`)
        .addFields(
          {
            name: "🏰 Server:",
            value: interaction.guild.name,
            inline: true,
          },
          {
            name: "👮 Diban oleh:",
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
          text: `${interaction.guild.name} | Notifikasi Ban`,
        })
        .setTimestamp();

      // Kirim DM sebelum ban
      try {
        await target.send({ embeds: [banEmbed] });
      } catch (dmError) {
        logger.warn(`Tidak bisa mengirim DM ke ${target.user.tag}`, {
          error: dmError,
        });
        // Lanjutkan proses ban meskipun DM gagal
      }

      // Ban user
      await target.ban({
        deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
        reason: reason,
      });

      // Log aksi
      logger.info(
        `${target.user.tag} telah diban oleh ${interaction.user.tag}`,
        {
          reason: reason,
          deleteMessageDays: deleteMessageDays,
          guildId: interaction.guildId,
        }
      );

      // Balas ke executor
      await interaction.reply({
        content: `Berhasil melakukan ban pada ${target.user.tag}\nAlasan: ${reason}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      logger.error("Error saat melakukan ban:", error);
      await interaction.reply({
        content: "Terjadi kesalahan saat mencoba melakukan ban!",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
