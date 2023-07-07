const { Client, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const UserAM = require("../../Schemas/userAutomod");
const automod = require("../../Schemas/automod");
const ms = require("ms");

module.exports = {
  name: "messageCreate",
  /**
 * 

 * @param {Client} client 
 */
  async execute(message, client) {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (message.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return;
    const guild = message.guild;

    let requireDB = await automod.findOne({ Guild: guild.id });
    let UserData = await UserAM.findOne({
      Guild: guild.id,
      User: message.author.id,
    });
    if (!requireDB) return;
    if (requireDB.AntiPing === false) return;

    const logChannel = client.channels.cache.get(requireDB.LogChannel);
    if (!UserData) {
      const newData = new UserAM({
        Guild: guild.id,
        User: message.author.id,
        InfractionPoints: 0,
      });
      newData.save();
    } else {
      if (UserData.InfractionPoints > 10) {
        if (!message.member) return;
        message.member.ban({ reason: "Bypassing automod" });
        logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x2f3136)
              .setDescription(
                `<@${message.author.id}> has been banned for bypassing automod`
              ),
          ],
        });
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription(
        `:warning: | <@${message.author.id}> tried to ping everyone.`
      );
    if (message.content.includes("@everyone")) {
      try {
        await message.delete();
      } catch (err) {
        return;
      }

      const msg = await message.channel.send({ embeds: [embed] });

      setTimeout(async () => {
        await msg.delete();
      }, 5000);

      if (!UserData) {
        const newData = new UserAM({
          Guild: guild.id,
          User: message.author.id,
          InfractionPoints: 1,
        });
        newData.save();
      } else {
        switch (UserData.InfractionPoints) {
          case 3:
            if (!message.member) return;
            const time = ms(requireDB.Timeout);
            await message.member.timeout(time);
            logChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(0x2f3136)
                  .setDescription(
                    `<@${message.author.id}> has been timed out for pinging everyone`
                  ),
              ],
            });
            break;
          case 10:
            if (!message.member) return;
            logChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(0x2f3136)
                  .setDescription(
                    `<@${message.author.id}> has been kicked for pinging everyone`
                  ),
              ],
            });
            await message.member
              .kick({ reason: "Pinging everyone" })
              .then(async () => {
                await UserAM.findOneAndDelete({
                  Guild: guild,
                  User: message.author.id,
                });
              });
            break;
        }
        UserData.InfractionPoints += 1;
        UserData.save();
      }

      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2f3136)
            .setDescription(
              `<@${message.author.id}> has pinged everyone.\n\`\`\`${message.content}\`\`\``
            ),
        ],
      });
    }
  },
};