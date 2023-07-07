const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

const outcomes = ["tails", "heads", "tails", "heads"]
const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin"),

  async execute(interactin) {
    embed = new EmbedBuilder()
      .setTitle("Coinflip")
      .setColor("Random")
      .setDescription(`Ok, you flipped | du hast...  **${outcome}** gewürfelt!`,)
    return interactin.reply({
      embeds: [embed]
    }
    )
  }
}