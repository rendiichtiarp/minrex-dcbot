const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/logger');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-verify')
        .setDescription('Setup the verification system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the verification message to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to give when members verify')
                .setRequired(true)),    
    
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');

        // Validate role hierarchy
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            await interaction.reply({
                content: 'I cannot assign that role as it is higher than or equal to my highest role. Please move my role above the verification role.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }        // Store verification settings in database
        await db.verification.saveSettings(interaction.guildId, channel.id, role.id);

        // Create the embed
        const verifyEmbed = new EmbedBuilder()
            .setTitle('✅ Server Verification')
            .setDescription(`Welcome to the server! Click the button below to verify yourself and get the ${role} role.`)
            .setColor('#2ECC71')
            .setFooter({ text: 'Click the button below to verify' });

        // Create the button
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify-button')
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const row = new ActionRowBuilder()
            .addComponents(verifyButton);

        try {
            // Send the verification message
            await channel.send({
                embeds: [verifyEmbed],
                components: [row]
            });

            // Reply to the command user
            await interaction.reply({
                content: `Verification system has been set up in ${channel} with role ${role}!`,
                flags: MessageFlags.Ephemeral
            });

            logger.info(`Verification system set up in channel ${channel.id} with role ${role.id} by ${interaction.user.tag}`);
        } catch (error) {
            logger.error('Error setting up verification system:', error);
            await interaction.reply({
                content: 'There was an error setting up the verification system.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
