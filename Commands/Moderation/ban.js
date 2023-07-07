const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
//const fetch = require('node-fetch');
const ms = require('ms');
const bans = require('../../Schemas/ban.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans specified user.')
    .addUserOption(option => option.setName('user').setDescription('Specify the user you want to ban.').setRequired(true))
    .addStringOption(option => option.setName('time').setDescription(`Specified amount of time will be the ban's time. Leave empty for a permanent ban.`))
    .addStringOption(option => option.setName('reason').setDescription('Reason as to why you want to ban specified user.').setRequired(false)),
  async execute(interaction, client) {

    const users = interaction.options.getUser('user');
    const ID = users.id;
    const banUser = client.users.cache.get(ID);
    const banmember = interaction.options.getMember('user');
    const optiontime = interaction.options.getString('time');

    let time = '';
    if (!optiontime) {
      time = 'notime';
    } else {
      time = ms(optiontime);
    }

    if (!interaction.member.permissions.has(PermissionsBitField.BAN_MEMBERS)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true });
    if (interaction.member.id === ID) return await interaction.reply({ content: 'You **cannot** use the hammer on yourself, silly goose..', ephemeral: true });
    if (!banmember) return await interaction.reply({ content: `That user **does not** exist within your server.`, ephemeral: true });

    let reason = interaction.options.getString('reason');
    if (!reason) reason = 'No reason provided :(';

    const dmembed = new EmbedBuilder()
      .setColor('Red')
      .setTitle(`> You were banned from "${interaction.guild.name}"`)
      .addFields({ name: '• Server', value: `> ${interaction.guild.name}`, inline: true })
      .addFields({ name: '• Reason', value: `> ${reason}`, inline: true })
      .setTimestamp()
      .setThumbnail('https://cdn.discordapp.com/attachments/1080219392337522718/1081267701302972476/largered.png');

    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle(`> User was banished!`)
      .addFields({ name: '• User', value: `> ${banUser.tag}`, inline: true })
      .addFields({ name: '• Reason', value: `> ${reason}`, inline: true })
      .setThumbnail('https://media.discordapp.net/attachments/1101154365391245333/1123180041933692978/6e5ab6b75ffb66a3db552ac15c659812-modified.png')
      .setTimestamp();

    if (time !== 'notime') {
      embed.addFields({ name: '• Time', value: `> <t:${Math.floor(Date.now() / 1000 + time / 1000)}:R>` });
      dmembed.addFields({ name: '• Time', value: `> <t:${Math.floor(Date.now() / 1000 + time / 1000)}:R>` });
    }

    try {
      await interaction.guild.bans.create(banUser.id, { reason });
    } catch {
      return interaction.reply({ content: `**Couldn't** ban this member! Check my **role position** and try again.`, ephemeral: true });
    }

    await banUser.send({ embeds: [dmembed] }).catch();
    await interaction.reply({ embeds: [embed] });

    if (time === 'notime') return;
    else {
      const settime = Date.now() + time;
      await bans.create({
        Guild: interaction.guild.id,
        User: banUser.id,
        Time: settime
      });
    }
  }
};
