const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('imageai')
    .setDescription('Generate art in your dreams!')
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('Your prompt to generate the art')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const prompt = interaction.options.getString('prompt');
    const Replicate = require('replicate');

    const replicate = new Replicate({
      auth: config.apiKey, // Use the correct parameter name 'auth'
    });

    const output = await replicate.run(
      'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      {
        input: {
          prompt: prompt,
        },
      }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Download')
        .setStyle(ButtonStyle.Link)
        .setURL(output[0]), // Extract the first URL from the output array
      new ButtonBuilder()
        .setLabel('Support Us')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.patreon.com/Drago353/membership')
    );

    const embed = new EmbedBuilder()
      .setTitle('Your Prompt')
      .setDescription(prompt)
      .setColor('#2f3136')
      .setImage(output[0]); // Set the image URL as the first URL from the output array

    // Download the image and attach it as a file
    const imageResponse = await axios.get(output[0], {
      responseType: 'arraybuffer',
    });

    await interaction.editReply({ embeds: [embed], files: [imageResponse.data], components: [row] });
  },
};
