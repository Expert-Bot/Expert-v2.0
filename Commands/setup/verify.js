const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const capschema = require('../../Schemas/verify');
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('verify')
    .setDMPermission(false)
    .setDescription('Configure your verification system using captcha.')
    .addSubcommand(command => command.setName('setup').setDescription('Sets up the verification system for you.').addRoleOption(option => option.setName('role').setDescription('Specified role will be given to users who are verified.').setRequired(true)).addChannelOption(option => option.setName('channel').setDescription('Specified channel will be your verify channel').setRequired(true).addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)).addStringOption(option => option.setName('content').setDescription('Specified message will be included in the verification embed.').setRequired(false).setMinLength(1).setMaxLength(1000)))
    .addSubcommand(command => command.setName('disable').setDescription('Disables your verification system.')),
    async execute(interaction, client) {
 
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.user.id !== '619944734776885276') return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
 
        const data = await capschema.findOne({ Guild: interaction.guild.id });
        const sub = interaction.options.getSubcommand();
 
        switch (sub) {
            case 'setup':
 
            const role = await interaction.options.getRole('role');
            const channel = await interaction.options.getChannel('channel');
            const message = await interaction.options.getString('content') || 'Click the button bellow to verify!';
 
            if (data) return await interaction.reply({ content: `You **already** have a verification system **set up**! \n> Do **/verify disable** to undo.`, ephemeral: true});
            else {
 
                await capschema.create({
                    Guild: interaction.guild.id,
                    Role: role.id,
                    Channel: channel.id,
                    Message: 'empty',
                    Verified: []
                })
 
                const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel('✅ Verify')
                    .setStyle(ButtonStyle.Success)
                )
 
                const verify = new EmbedBuilder()
                .setColor('Green')
                .setThumbnail('https://images-ext-2.discordapp.net/external/onEO9D9OUhbAlUwHEufMANlozh8GfT2cJAAbyfMF0kE/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/1023810715250860105/388e4d2421ca6223424895dce4003e2c.png?width=656&height=656')
                .setTimestamp()
                .setTitle('• Verification Message')
                .setAuthor({ name: `✅ Verification Proccess`})
                .setFooter({ text: `✅ Verification Prompt`})
                .setDescription(`> ${message}`)
 
                interaction.reply({ content: `Your **verification system** has been set up!`, ephemeral: true});
                const msg = await channel.send({ embeds: [verify], components: [buttons] });
 
                await capschema.updateOne({ Guild: interaction.guild.id }, { $set: { Message: msg.id }});
            }
 
            break;
            case 'disable':
 
            if (!data) return await interaction.reply({ content: `The **verification system** has not been **set up** yet, cannot delete **nothing**..`, ephemeral: true});
            else {
 
                await capschema.deleteMany({ Guild: interaction.guild.id });
                const deletemsg = await client.channels.cache.get(data.Channel).messages.fetch(data.Message);
                await deletemsg.delete();
 
                await interaction.reply({ content: `Your **verification system** has successfully been **disabled**!`, ephemeral: true});
 
            }
        }
    }
}