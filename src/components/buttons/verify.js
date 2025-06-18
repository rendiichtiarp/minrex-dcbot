const { MessageFlags } = require("discord.js");
const logger = require("../../utils/logger");
const db = require("../../utils/database");

async function execute(interaction) {
  try {
    // Get verification settings from database
    const settings = await db.verification.getSettings(interaction.guildId);
    if (!settings) {
      logger.error(
        `No verification settings found for guild ${interaction.guildId}`
      );
      await interaction.reply({
        content:
          "Sistem verifikasi belum diatur. Silakan hubungi administrator.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const role = interaction.guild.roles.cache.get(settings.role_id);
    if (!role) {
      logger.error(
        `Verification role ${settings.role_id} not found in guild ${interaction.guildId}`
      );
      await interaction.reply({
        content:
          "Role verifikasi sudah tidak ada. Silakan hubungi administrator.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!role) {
      logger.error("Verified role not found or not configured");
      await interaction.reply({
        content:
          "Sistem verifikasi tidak terkonfigurasi dengan benar. Silakan hubungi administrator.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.member; // Check if user already has the role
    if (member.roles.cache.has(settings.role_id)) {
      await interaction.reply({
        content: `Anda sudah memiliki role ${role.name}!`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if bot can add the role
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      logger.error(`Cannot assign role ${role.name} due to role hierarchy`);
      await interaction.reply({
        content:
          "Tidak dapat memberikan role karena masalah hierarki role. Silakan hubungi administrator.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    } // Add the verified role
    await member.roles.add(settings.role_id);
    await interaction.reply({
      content: `✅ Verifikasi berhasil! Role ${role.name} telah ditambahkan.`,
      flags: MessageFlags.Ephemeral,
    });

    logger.info(
      `User ${interaction.user.tag} (${interaction.user.id}) has been verified with role ${role.name} (${role.id}) in guild ${interaction.guildId}`
    );
  } catch (error) {
    logger.error("Error in verification process:", error);
    await interaction.reply({
      content:
        "Terjadi kesalahan saat proses verifikasi. Silakan hubungi administrator.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = {
  customId: "verify-button",
  execute,
};
