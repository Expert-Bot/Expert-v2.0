const {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const {
  Connect4,
  RockPaperScissors,
  TicTacToe,
} = require('discord-gamecord');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("games-multiplayer")
    .setDescription("Play a multi-player minigame within Discord.")
    .addStringOption(option =>
      option.setName("game")
        .setDescription("*Choose a game to play.")
        .setRequired(true)
        .addChoices(
          { name: "Connect-4", value: "connect4" },
          { name: "Rock-Paper-Scissors", value: "rps" },
          { name: "Tic-Tac-Toe", value: "tictactoe" },
        )
    )
    .addUserOption(option =>
      option.setName("user")
        .setDescription('*Choose your opponent for the game.')
        .setRequired(true)
    )
    .setDMPermission(false),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const game = interaction.options.getString("game");
    const user = interaction.options.getUser("user");

    if (!user) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("0x2f3136")
            .setDescription(":warning: | The target specified has most likely left the server.")
        ],
        ephemeral: true
      })
    }

    if (user.bot) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#2f3136")
            .setDescription(":warning: | You are not allowed to play with or against a bot.")
        ],
        ephemeral: true
      })
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#2f3136")
            .setDescription(":warning: | You cannot play a multi-player game with yourself.")
        ],
        ephemeral: true
      })
    }

    switch (game) {
      case "connect4": {
        const Game = new Connect4({
          message: interaction,
          slash_command: true,
          opponent: interaction.options.getUser('user'),
          embed: {
            title: 'Connect4 Game',
            statusTitle: 'Status',
            color: '#2f3136'
          },
          emojis: {
            board: '⚪',
            player1: '🔴',
            player2: '🟡'
          },
          mentionUser: true,
          timeoutTime: 60000,
          buttonStyle: 'PRIMARY',
          turnMessage: '{emoji} | Its turn of player **{player}**.',
          winMessage: '{emoji} | **{player}** won the Connect4 Game.',
          tieMessage: 'The Game tied! No one won the Game!',
          timeoutMessage: 'The Game went unfinished! No one won the Game!',
          playerOnlyMessage: 'Only {player} and {opponent} can use these buttons.'
        });

        Game.startGame();
        Game.on('gameOver', result => {
          console.log(result);  // =>  { result... }
        });
      }
        break;
      case "rps": {
        const Game = new RockPaperScissors({
          message: interaction,
          slash_command: true,
          opponent: interaction.options.getUser('user'),
          embed: {
            title: 'Rock Paper Scissors',
            color: '#2f3136',
            description: 'Press a button below to make a choice.'
          },
          buttons: {
            rock: 'Rock',
            paper: 'Paper',
            scissors: 'Scissors'
          },
          emojis: {
            rock: '🌑',
            paper: '📰',
            scissors: '✂️'
          },
          mentionUser: true,
          timeoutTime: 60000,
          buttonStyle: 'PRIMARY',
          pickMessage: 'You choose {emoji}.',
          winMessage: '**{player}** won the Game! Congratulations!',
          tieMessage: 'The Game tied! No one won the Game!',
          timeoutMessage: 'The Game went unfinished! No one won the Game!',
          playerOnlyMessage: 'Only {player} and {opponent} can use these buttons.'
        });

        Game.startGame();
        Game.on('gameOver', result => {
          console.log(result);  // =>  { result... }
        });
      }
        break;
      case "tictactoe": {
        const Game = new TicTacToe({
          message: interaction,
          slash_command: true,
          opponent: interaction.options.getUser('user'),
          embed: {
            title: 'Tic Tac Toe',
            color: '#2f3136',
            statusTitle: 'Status',
            overTitle: 'Game Over'
          },
          emojis: {
            xButton: '❌',
            oButton: '🔵',
            blankButton: '➖'
          },
          mentionUser: true,
          timeoutTime: 60000,
          xButtonStyle: 'DANGER',
          oButtonStyle: 'PRIMARY',
          turnMessage: '{emoji} | Its turn of player **{player}**.',
          winMessage: '{emoji} | **{player}** won the TicTacToe Game.',
          tieMessage: 'The Game tied! No one won the Game!',
          timeoutMessage: 'The Game went unfinished! No one won the Game!',
          playerOnlyMessage: 'Only {player} and {opponent} can use these buttons.'
        });

        Game.startGame();
        Game.on('gameOver', result => {
          console.log(result);  // =>  { result... }
        })
      }
        break;
    }
  }
}