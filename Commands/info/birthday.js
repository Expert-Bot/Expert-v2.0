const { SlashCommandBuilder } = require('discord.js');
const Birthday = require('../../Models/birthdayschema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Store and delete birthdays of members')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add your birthday')
        .addIntegerOption((option) =>
          option.setName('day').setDescription('Your birthday day').setRequired(true),
        )
        .addIntegerOption((option) =>
          option.setName('month').setDescription('Your birthday month').setRequired(true),
        )
          .addIntegerOption((option) =>
          option.setName('year').setDescription('Your birthyear').setRequired(true),
        ),
        
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Delete your birthday'),
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    }

    const { commandName } = interaction;

    if (commandName === 'birthday') {
      await interaction.deferReply({ ephemeral: true });

      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case 'add':
          const day = interaction.options.getInteger('day');
          const month = interaction.options.getInteger('month') - 1; // JavaScript months are 0-based
          const year = interaction.options.getInteger('year');
          const birthday = new Date(Date.UTC(year, month, day));
          const userId = interaction.user.id;

          try {
            await Birthday.findOneAndUpdate(
              { userId },
              { userId, birthday },
              { upsert: true, useFindAndModify: false },
            );

            return interaction.followUp({ content: 'Your birthday has been added!', ephemeral: true });
          } catch (err) {
            console.error(err);
            return interaction.followUp({
              content: 'There was an error adding your birthday.',
              ephemeral: true,
            });
          }

        case 'delete':
          try {
            const userId = interaction.user.id;

            await Birthday.findOneAndDelete({ userId });

            return interaction.followUp({ content: 'Your birthday has been deleted!', ephemeral: true });
          } catch (err) {
            console.error(err);
            return interaction.followUp({
              content: 'There was an error deleting your birthday.',
              ephemeral: true,
            });
          }

        default:
          return interaction.followUp({ content: 'Invalid subcommand!', ephemeral: true });
      }
    }
  },
};
