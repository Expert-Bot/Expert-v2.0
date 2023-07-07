const { Permissions, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: {
    name: 'ban',
    description: 'Bans a user from the server without a command prefix',
    defaultPermission: false,
    options: [
      {
        name: 'user',
        description: 'The user to ban',
        type: 'USER',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    // Check if the user has the necessary permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.BAN_MEMBERS)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    // Get the user to ban
    const userToBan = interaction.options.getUser('user');

    // Check if the user is valid
    if (!userToBan) {
      return interaction.reply({ content: 'Please provide a valid user to ban.', ephemeral: true });
    }

    // Get the member object of the user to ban
    const memberToBan = interaction.guild.members.cache.get(userToBan.id);

    // Check if the member is valid
    if (!memberToBan) {
      return interaction.reply({ content: 'The mentioned user is not a member of this server.', ephemeral: true });
    }

    // Check if the member can be banned
    if (!memberToBan.bannable) {
      return interaction.reply({ content: 'I cannot ban this user.', ephemeral: true });
    }

    // Ban the member without a command prefix
    try {
      await memberToBan.ban({ reason: 'No prefix ban command.' });
      return interaction.reply({ content: `${userToBan.tag} has been banned.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'There was an error while trying to ban this user.', ephemeral: true });
    }
  },
};
