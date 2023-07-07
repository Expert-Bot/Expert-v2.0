const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yosoundboard')
    .setDescription('Play a sound ')
    .addStringOption(option =>
      option.setName('sound')
        .setDescription('Your choice')
        .setRequired(true)
        .addChoices({ name: 'Bruh', value: 'Bruh' },

          { name: 'BTS', value: 'BTS' }, { name: 'sukisuki', value: 'sukisuki' },
          { name: 'awShit', value: 'awShit' },
          { name: 'uwu', value: 'uwu' }, { name: 'SummertimeNyan', value: 'SummertimeNyan' })
    ),
  async execute(interaction) {
    const sound = interaction.options.getString('sound');
    let audioURL;

    if (sound === 'Bruh') {
      audioURL = 'https://www.myinstants.com/media/sounds/movie_1_C2K5NH0.mp3';
    } else if (sound === 'BTS') {
      audioURL = 'https://www.myinstants.com/media/sounds/jessicakpopper.mp3';
    } else if (sound === 'SummertimeNyan') {

      audioURL = 'https://www.myinstants.com/media/sounds/summer-time-anime-love_q5du5Qo.mp3';

    } else if (sound === 'uwu') {

      audioURL = 'https://www.myinstants.com/media/sounds/sussy-uwu.mp3';

    } else if (sound === 'awShit') {

      audioURL = 'https://www.myinstants.com/media/sounds/gta-san-andreas-ah-shit-here-we-go-again.mp3';

    } else if (sound === 'sukisuki') {

      audioURL = 'https://www.myinstants.com/media/sounds/1080p-kaguya-sama-wk-03_trim1-online-audio-converter.mp3';

    }


    if (!interaction.member.voice.channel) {
      await interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
      return;
    }

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const audioPlayer = createAudioPlayer();

    connection.subscribe(audioPlayer);

    const audioResource = createAudioResource(audioURL);

    audioPlayer.play(audioResource);

    const embedMessage = new EmbedBuilder()

      .setColor('Green')
      .setImage('https://cdn.dribbble.com/users/1614722/screenshots/4419914/soundboard_animatie__zwart_.gif')

      .setTitle('Playing Sound')

      .setDescription(`Playing sound: ${sound}`)

      .setTimestamp();

    const message = await interaction.reply({ embeds: [embedMessage], fetchReply: true, ephemeral: true });

    audioPlayer.on('stateChange', (oldState, newState) => {

      if (newState.status === 'idle') {

        connection.destroy();

        embedMessage.setImage('https://i.imgur.com/ETWgRqs.png').setDescription(`Finished playing sound: ${sound}`);

        interaction.editReply({ embeds: [embedMessage], ephemeral: true });

      }

    });

    audioPlayer.on('error', error => {

      console.error(error);

      connection.destroy();

      embedMessage.setDescription(`Error playing sound: ${sound}`);

      message.edit({ embeds: [embedMessage] });

    });

  },

};

