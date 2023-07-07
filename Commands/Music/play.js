const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, ButtonStyle } = require('discord.js');
const client = require('../../index');

module.exports = {
  premiumOnly: false,
  voteRequired: false,
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song.')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Provide the name or URL for the song.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const { options, member, guild, channel } = interaction;

    const query = options.getString('query');
    const voiceChannel = member.voice.channel;

    const embed = new EmbedBuilder();

    if (!voiceChannel) {
      embed.setColor('#ff0000').setDescription('You must be in a voice channel to execute music commands.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!member.voice.channelId == guild.members.me.voice.channelId) {
      embed.setColor('#ff0000').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}>`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      client.distube.play(voiceChannel, query, { textChannel: channel, member: member });

      const pauseButton = new ButtonBuilder()
        .setCustomId('pause')
        .setLabel('Pause')
        .setStyle(ButtonStyle.Secondary);

      const skipButton = new ButtonBuilder()
        .setCustomId('skip')
        .setLabel('Skip')
        .setStyle(ButtonStyle.Danger);

const resumeButton = new ButtonBuilder()
  .setCustomId('resume')
  .setLabel('Resume')
  .setStyle(ButtonStyle.Success);


      const stopButton = new ButtonBuilder()
        .setCustomId('stop')
        .setLabel('Stop')
        .setStyle(ButtonStyle.Danger);

      const loopButton = new ButtonBuilder()
        .setCustomId('loop')
        .setLabel('Loop')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder()
        .addComponents(pauseButton, skipButton, resumeButton, stopButton, loopButton);

      embed.setColor('#00ff00').setDescription('<a:DP_amatcha_musicjam94:1091031672813793363> You can control the music with buttons. Or you can use commands to skip, loop, shuffle songs, etc. Use /report-bug if you encounter any bugs or issues.');

      const message = await interaction.reply({ embeds: [embed], components: [row] });

      // Add a listener for button interactions
      const filter = (i) => ['pause', 'skip', 'resume', 'stop', 'loop'].includes(i.customId) && i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({ filter, time: 1500000 });

      collector.on('collect', async (i) => {
        if (i.customId === 'pause') {
          client.distube.pause(guild);
          embed.setDescription('⏸ Music paused.');
          await i.update({ embeds: [embed] });
        } else if (i.customId === 'skip') {
          client.distube.skip(guild);
          embed.setDescription('⏭️ Song skipped.');
          await i.update({ embeds: [embed] });
        } else if (i.customId === 'resume') {
  		client.distube.resume(guild);
  		embed.setDescription('▶️ Music resumed.');
  		await i.update({ embeds: [embed] });
        } else if (i.customId === 'stop') {
          client.distube.stop(guild);
          embed.setDescription('⏹️ Music stopped.');
          await i.update({ embeds: [embed] });
        } else if (i.customId === 'loop') {
          const toggle = client.distube.toggleAutoplay(guild);
          embed.setDescription(`🔁 Loop ${toggle ? 'enabled' : 'disabled'}.`);
          await i.update({ embeds: [embed] });
        }
      });

      collector.on('end', () => {
        // Remove the buttons after the collector expires
        message.edit({ components: [] });
      });
    } catch (err) {
      console.log(err);

      embed.setColor('#ff0000').setDescription('⛔ | Something went wrong...');

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};