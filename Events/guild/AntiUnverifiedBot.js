const { UserFlags, EmbedBuilder } = require("discord.js");
const automod = require("../../Schemas/automod");

module.exports = {
  name: "guildMemberAdd",
  once: false,

  async execute(member) {
    if(!member.user.bot) return;
    const automoder = await automod.findOne({ guildId: member.guild.id });
    if (!automoder) return;
    if (automoder.AntiUnverifiedBot == false) return;
    const channel = await member.guild.channels.cache.get(automoder.LogChannel);
    if (!channel) return;
    const embed = new EmbedBuilder()
      .setTitle("Bot Kicked")
      .setDescription(
        `${member.user.tag} was kicked from the server for being unverified`
      )
      .setColor("DarkGreen");

    if (!member.user.flags.has(UserFlags.VerifiedBot)) {
      channel.send({ embeds: [embed] });
      member.kick("No Unverified Bots Allowed");
    } else return;
  },
};