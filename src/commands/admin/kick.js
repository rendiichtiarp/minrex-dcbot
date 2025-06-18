const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for kicking'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        // Check if the target is kickable
        if (!target.kickable) {
            return interaction.reply({
                content: 'I cannot kick this user! They might have a higher role than me.',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            await target.kick(reason);
            await interaction.reply({
                content: `Successfully kicked ${target.user.tag}\nReason: ${reason}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while trying to kick the member!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
