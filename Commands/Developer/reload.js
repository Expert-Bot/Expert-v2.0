const { SlashCommandBuilder, EmbedBuilder, Client } = require('discord.js')
const { loadCommands } = require('../../Handlers/commandHandler')
const { loadEvents } = require('../../Handlers/eventHandler')

module.exports = {
      adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reaload your commands or your events')
    .addSubcommand(subcommand =>
      subcommand.setName('events')
        .setDescription('Reaload your Events')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('commands')
        .setDescription('Reaload your commands')
    ),

  async execute(interaction, client) {
    const { user } = interaction

    // TU ID //
    if (user.id !== '903237169722834954') return interaction.reply({ embeds: [new EmbedBuilder().setColor('Random').setDescription('This command is only for the bot developer')], ephemeral: true })
    const sub = interaction.options.getSubcommand()
    const embed = new EmbedBuilder()
      .setTitle('Developer')
      .setColor('Blue')

    switch (sub) {
      case 'commands':
        loadCommands(client)
        interaction.reply({ embeds: [embed.setDescription('Commands Reloaded!')] })
        console.log(`${user} has Reloaded the commands`);
        break;
      case 'events':
        loadEvents(client)
        interaction.reply({ embeds: [embed.setDescription('Events Reloaded!')] })
        console.log(`${user} has Reloaded the events`);
        break;
    }
  }


};
