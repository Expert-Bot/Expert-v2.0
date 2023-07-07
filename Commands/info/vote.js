const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Topgg = require('@top-gg/sdk');
const topgg = new Topgg.Api("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMjM4MTA3MTUyNTA4NjAxMDUiLCJib3QiOnRydWUsImlhdCI6MTY4MTc1MDkzMX0.3g5F0TagAYRmeOtJNEh2aCa_pxxIXt2KGTNP3jYTh9w");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Check if you have voted for the bot on top.gg'),
  async execute(interaction) {
    try {
      const hasVoted = await topgg.hasVoted(interaction.user.id);
      const Voted = new EmbedBuilder()
        .setTitle("Voted")
        .setDescription("*You have been voted me in [Top.gg](https://top.gg/), Thanks for voting me*")
        .setFooter({ text: "Expert | Check Vote" })

      const btn_voted = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Voted")
          .setEmoji("😀")
          .setURL("https://top.gg")
          .setDisabled(true)
          .setStyle(ButtonStyle.Link)
      )

      const Not_Voted = new EmbedBuilder()
        .setTitle("Not Voted")
        .setDescription("> *You have to vote me in [Top.gg](https://top.gg)*. \n> By Voting me you can unlock few commands and it will help me to get support from you.")
        .setFooter({ text: "UniBot | Check Vote" })

      const btn_no_voted = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Vote")
          .setEmoji("😡")
          .setDisabled(false)
          .setURL("https://top.gg/bot/1023810715250860105/vote")
          .setStyle(ButtonStyle.Link)
      )

      const btn_support = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Support Server")
          .setEmoji("🫡")
          .setDisabled(false)
          .setURL("https://top.gg/bot/1023810715250860105/vote")
          .setStyle(ButtonStyle.Link)
      )

      if (hasVoted) {
        interaction.reply({ embeds: [Voted], components: [btn_voted] });
      } else {
        interaction.reply({ embeds: [Not_Voted], components: [btn_no_voted] });
      }
    } catch (error) {
      console.error(error);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription("*An error occurred while checking your vote status.* \n **Report this error in my support server**")
            .setFooter({ text: "Expert | Error Occured" })

        ],
        components: [btn_support],

        ephemeral: true,
      });
    }
  }
};