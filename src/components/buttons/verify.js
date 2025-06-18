const { MessageFlags } = require('discord.js');
const logger = require('../../utils/logger');

async function execute(interaction) {
    try {
        const verifiedRole = process.env.VERIFIED_ROLE_ID;
        const role = interaction.guild.roles.cache.get(verifiedRole);
        
        if (!verifiedRole || !role) {
            logger.error('Verified role not found or not configured');
            await interaction.reply({
                content: 'Verification system is not properly configured. Please contact an administrator.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const member = interaction.member;
        
        // Check if user already has the role
        if (member.roles.cache.has(verifiedRole)) {
            await interaction.reply({
                content: `You already have the ${role.name} role!`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Check if bot can add the role
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            logger.error(`Cannot assign role ${role.name} due to role hierarchy`);
            await interaction.reply({
                content: 'Unable to assign role due to role hierarchy. Please contact an administrator.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }        // Add the verified role
        await member.roles.add(verifiedRole);
        
        await interaction.reply({
            content: `✅ You have been successfully verified! The ${role.name} role has been added.`,
            flags: MessageFlags.Ephemeral
        });

        logger.info(`User ${interaction.user.tag} (${interaction.user.id}) has been verified with role ${role.name} (${role.id})`);
    } catch (error) {
        logger.error('Error in verification process:', error);
        await interaction.reply({
            content: 'There was an error during verification. Please contact an administrator.',
            flags: MessageFlags.Ephemeral
        });
    }
}

module.exports = {
    customId: 'verify-button',
    execute
};
