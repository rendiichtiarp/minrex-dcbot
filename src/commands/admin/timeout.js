const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Berikan timeout pada member")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Member yang akan diberi timeout")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("durasi")
        .setDescription("Durasi timeout")
        .setRequired(true)
        .addChoices(
          { name: "60 Detik", value: "60" },
          { name: "5 Menit", value: "300" },
          { name: "10 Menit", value: "600" },
          { name: "1 Jam", value: "3600" },
          { name: "1 Hari", value: "86400" },
          { name: "1 Minggu", value: "604800" }
        )
    )
    .addStringOption((option) =>
      option.setName("alasan").setDescription("Alasan memberikan timeout")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const duration = parseInt(interaction.options.getString("durasi"));
    const reason =
      interaction.options.getString("alasan") ?? "Tidak ada alasan";

    // Check if the target can be timed out
    if (!target.moderatable) {
      return interaction.reply({
        content:
          "Saya tidak bisa memberikan timeout pada member ini! Mungkin role mereka lebih tinggi dari saya.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      // Buat embed untuk DM
      const timeoutEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`⏳ Notifikasi Timeout`)
        .setDescription(`📢 Anda telah diberi timeout di server.`)
        .addFields(
          {
            name: "🏰 Server:",
            value: interaction.guild.name,
            inline: true,
          },
          {
            name: "👮 Diberi timeout oleh:",
            value: interaction.user.tag,
            inline: true,
          },
          {
            name: "⏱️ Durasi:",
            value: getDurationText(duration),
            inline: true,
          },
          {
            name: "📝 Alasan:",
            value: reason,
          }
        )
        .setFooter({
          iconURL: interaction.guild.iconURL(),
          text: `${interaction.guild.name} | Notifikasi Timeout`,
        })
        .setTimestamp();

      // Kirim DM sebelum timeout
      try {
        await target.send({ embeds: [timeoutEmbed] });
      } catch (dmError) {
        logger.warn(`Tidak bisa mengirim DM ke ${target.user.tag}`, {
          error: dmError,
        });
        // Lanjutkan proses timeout meskipun DM gagal
      }

      // Timeout user
      await target.timeout(duration * 1000, reason);

      // Log aksi
      logger.info(
        `${target.user.tag} telah di-timeout oleh ${interaction.user.tag}`,
        {
          duration: duration,
          reason: reason,
          guildId: interaction.guildId,
        }
      );

      // Balas ke executor
      await interaction.reply({
        content: `Berhasil memberikan timeout pada ${
          target.user.tag
        } selama ${getDurationText(duration)}\nAlasan: ${reason}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      logger.error("Error saat melakukan timeout:", error);
      await interaction.reply({
        content: "Terjadi kesalahan saat mencoba memberikan timeout!",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

function getDurationText(seconds) {
  const duration = {
    value: 0,
    unit: "",
  };

  if (seconds < 60) {
    duration.value = seconds;
    duration.unit = "detik";
  } else if (seconds < 3600) {
    duration.value = Math.floor(seconds / 60);
    duration.unit = "menit";
  } else if (seconds < 86400) {
    duration.value = Math.floor(seconds / 3600);
    duration.unit = "jam";
  } else if (seconds < 604800) {
    duration.value = Math.floor(seconds / 86400);
    duration.unit = "hari";
  } else {
    duration.value = Math.floor(seconds / 604800);
    duration.unit = "minggu";
  }

  return `${duration.value} ${duration.unit}`;
}
