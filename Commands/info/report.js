const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, TextInput } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reportbug')
        .setDescription('Report a bug to the server moderators.')
        .addStringOption(option => 
            option.setName('bug')
                .setDescription('The bug you want to report.')
                .setRequired(true)),
    async execute(interaction) {
        // Check if the user has permission to use this command.
        if (!interaction.member.permissions.has(PermissionFlagsBits.SEND_MESSAGES)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        // Get the bug report from the user's input.
        const bug = interaction.options.getString('bug');

        // Set up the modal for confirmation.
        const confirmModal = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle(1), // Use numeric value 1 for PRIMARY
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle(4) // Use numeric value 4 for DANGER
            );

        // Show the confirmation modal.
        const confirmResult = await interaction.reply({ content: `Are you sure you want to report this bug?\n\nBug: ${bug}`, components: [confirmModal], ephemeral: true });

        // Handle the user's confirmation choice.
        const collector = interaction.channel.createMessageComponentCollector({ time: 15000 });

        collector.on('collect', async (button) => {
            if (button.customId === 'confirm') {
                // Get the channel to send the bug report to.
                const channel = interaction.client.channels.cache.get('1101154380381692055');

                // Send the bug report to the channel.
                await channel.send({ content: `New bug report from ${interaction.user.tag}:\n\n${bug}` });

                // Reply to the user that their bug report has been submitted.
                await button.reply({ content: 'Your bug report has been submitted.', ephemeral: true });
            } else if (button.customId === 'cancel') {
                // Reply to the user that their bug report has been cancelled.
                await button.reply({ content: 'Bug report cancelled.', ephemeral: true });
            }
        });

        collector.on('end', () => {
            // Remove the interaction reply after the collector ends (buttons become unresponsive).
            confirmResult.delete();
        });
    },
};
