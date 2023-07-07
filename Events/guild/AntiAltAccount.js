const { Client, EmbedBuilder } = require("discord.js");
const ms = require("ms");
const automod = require("../../Schemas/automod");

module.exports = {
  name: "guildMemberAdd",
  /**
 * 

 * @param {Client} client 
 */
  async execute(member, client) {
    if (!member.guild) return;
    if (member.user.bot) return;

    const guild = member.guild;

    let requireDB = await automod.findOne({ Guild: guild.id });
    if (!requireDB) return;
    if (requireDB.AntiAltAccount === false) return;
    const timeSpan = ms("7 days");

    const k = new EmbedBuilder()
      .setTitle("__Kicked__")
      .setDescription("You were detected as an alt account")
      .setColor(0x2f3136)
      .setFooter({
        text: "If you are not an alt than your account must be older than 7 days",
      })
      .setThumbnail(member.displayAvatarURL({ dynamic: true }));
    const createdAt = new Date(member.user.createdAt).getTime();
    const difference = Date.now() - createdAt;
    if (difference < timeSpan) {
      member.send({ embeds: [k] }).then(() => {
        member.kick("Kicked because of a ALT account");
      });
    } else return;

    const logChannel = client.channels.cache.get(requireDB.LogChannel);

    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2f3136)
          .setDescription(
            `<@${member.user.tag}> has a account older than 7 days and now has been kicked.`
          ),
      ],
    });
  },
};