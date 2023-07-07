const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { OpenAIApi, Configuration } = require('openai');

const config = new Configuration({
  apiKey: 'Your Api-key',
});

const openai = new OpenAIApi(config);
const PAST_MESSAGES = 5;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat-gpt')
    .setDescription('Chat with the GPT-3.5 language model')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Enter your message')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: PAST_MESSAGES });
    const messageArray = Array.from(messages.values()).reverse();
    messageArray.push(interaction);

    const users = [
      ...new Set([
        ...messageArray.map((m) => m.author?.username || 'Unknown User'),
        interaction.client.user.username,
      ]),
    ];
    const lastUser = users.pop();

    let prompt = `The following is a conversation between ${users.join(', ')} and ${lastUser}.\n\n`;
    for (let i = messageArray.length - 1; i >= 0; i--) {
      const m = messageArray[i];
      const username = m.author?.username || 'Unknown User';
      prompt += `${username}: ${m.content}\n`;
    }
    prompt += `${interaction.client.user.username}:`;

    try {
      const response = await openai.createCompletion({
        prompt,
        model: 'text-davinci-003',
        max_tokens: 500,
        stop: ['\n'],
      });

      const userMessage = interaction.options.getString('message');
      const isQuestion = userMessage && userMessage.endsWith('?');

      let title = isQuestion ? 'Question' : 'Response';
      let color = isQuestion ? 0x3b7cff : 0xd248c5;

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(response.data.choices[0].text);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('An error occurred while processing your request.');
    }
  },
};
