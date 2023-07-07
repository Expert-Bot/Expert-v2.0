const {
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const messageCounts = new Map();
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
        const logChannel = client.channels.cache.get(requireDB.LogChannel); // Move logChannel declaration here
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
    if (!requireDB) return;
    if (requireDB.AntiSpam === false) return;

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription(`:warning: | <@${message.author.id}> is spamming`);
    const logChannel = client.channels.cache.get(requireDB.LogChannel); // Move logChannel declaration here

    // Define the number of messages a user can send in a given time interval
    const maxMessageCount = 5;
    const intervalSeconds = 10;
    // Get the message count for the user and increment it
    let messageCount = messageCounts.get(message.author.id) || 0;
    messageCount++;
    messageCounts.set(message.author.id, messageCount);

    // If the user has sent too many messages in a short time, warn and mute them
    if (messageCount > maxMessageCount) {
      try {
        await message.delete();
      } catch (err) {
        return;
      }
      // Remove the message count for users who haven't sent any messages in a while
      setTimeout(() => {
        messageCounts.delete(message.author.id);
      }, intervalSeconds * 1000);

      if (!UserData) {
        const newData = new UserAM({
          Guild: guild.id,
          User: message.author.id,
          InfractionPoints: 1,
        });
        newData.save();
      } else {
        console.log(UserData.InfractionPoints);
        switch (UserData.InfractionPoints) {
          case 3:
            if (!message.member) return;
            const time = requireDB.Timeout && ms(requireDB.Timeout); // Fix: Check if requireDB.Timeout exists before using ms()
            await message.member.timeout(time);
            logChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(0x2f3136)
                  .setDescription(
                    `<@${message.author.id}> has been timed out for spamming\n`
                  ),
              ],
            });
            break;
          case 8:
            if (!message.member) return;
            logChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(0x2f3136)
                  .setDescription(
                    `<@${message.author.id}> has been kicked for spamming`
                  ),
              ],
            });
            message.member.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(0x2f3136)
                  .setDescription(
                    `You have been kicked from ${message.guild.name} for spamming`
                  ),
              ],
            });
            await message.member.kick({ reason: "Spamming" }).then(async () => {
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

      const msg = await message.channel.send({ embeds: [embed] });
      setTimeout(async () => {
        await msg.delete();
      }, 5000);
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Timeout")
          .setEmoji("⚒️")
          .setCustomId("timeout")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("Kick")
          .setEmoji("🔨")
          .setCustomId("kick")
          .setStyle(ButtonStyle.Danger)
      );

      const text = await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2f3136)
            .setDescription(
              `<@${message.author.id}> is spamming.\n\`\`\`${message.content}\`\`\``
            ),
        ],
        components: [buttons],
      });

      const col = await text.createMessageComponentCollector();
      col.on("collect", async (m) => {
        const ms = require("ms");
        switch (m.customId) {
          case "timeout":
            if (!m.member.permissions.has(PermissionFlagsBits.ModerateMembers))
              return m.reply({
                content: "You don't have permission to timeout",
                ephemeral: true,
              });

            const embed = new EmbedBuilder()
              .setTitle("Timeout")
              .setDescription(
                `You have received a timeout from \`${message.guild.name}\` for spamming`
              )
              .setColor(0x2f3136);

            if (!message.member) {
              return m.reply({
                content: "This user doesn't exist",
                ephemeral: true,
              });
            }
            m.reply({
              content: `Timed out ${message.author.tag}`,
              ephemeral: true,
            });
            message.member
              .send({
                embeds: [embed],
              })
              .then(() => {
                const time = ms("10m");
                message.member.timeout(time);
              });
            break;
          case "kick":
            if (!m.member.permissions.has(PermissionFlagsBits.KickMembers))
              return m.reply({
                content: "You don't have permission to kick",
                ephemeral: true,
              });
            const embedss = new EmbedBuilder()
              .setTitle("Kicked")
              .setDescription(
                `You have been kicked from \`${message.guild.name}\` is spamming`
              )
              .setColor("0x2f3136");
            if (!message.member) {
              return m.reply({
                content: "This user doesn't exist",
                ephemeral: true,
              });
            }
            m.reply({
              content: `Kicked ${message.author.tag}`,
              ephemeral: true,
            });
            message.member
              .send({
                embeds: [embedss],
              })
              .then(() => {
                message.member.kick({ reason: "is spamming" });
              });
            break;
        }
      });
    }
  },
};
