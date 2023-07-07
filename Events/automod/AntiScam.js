const {
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const automod = require("../../Schemas/automod");
const AntiScam = require("../../Systems/ScamLinks.json");
const UserAM = require("../../Schemas/userAutomod");
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
    if (requireDB.AntiScam == false) return;

    const scamlinks = AntiScam.known_links;

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription(
        `:warning: | <@${message.author.id}> has sent a harmful link.`
      );
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
    for (let i in scamlinks) {
      if (message.content.toLowerCase().includes(scamlinks[i].toLowerCase())) {
        try {
          await message.delete();
        } catch (err) {
          return;
        }

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
              const time = ms(requireDB.Timeout);
              await message.member.timeout(time);
              logChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor(0x2f3136)
                    .setDescription(
                      `<@${message.author.id}> has been timed out for sending scam links\n`
                    ),
                ],
              });
              break;
            case 6:
              if (!message.member) return;
              logChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor(0x2f3136)
                    .setDescription(
                      `<@${message.author.id}> has been kicked for sending scam links`
                    ),
                ],
              });
              message.member.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor(0x2f3136)
                    .setDescription(
                      `You have been kicked from ${message.guild.name} for sending scam links`
                    ),
                ],
              });
              await message.member
                .kick({ reason: "Sending Scam Links" })
                .then(async () => {
                  await UserAM.findOneAndDelete({
                    Guild: guild,
                    User: message.author.id,
                  });
                });
              break;
            case 8:
              if (!message.member) return;
              message.channel.send(
                `<@${message.author.id}> this is your last warning to stop sending scam links\nNext time there won't be a warning`
              );
              break;
            case 10:
              if (!message.member) return;
              logChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor(0x2f3136)
                    .setDescription(
                      `<@${message.author.id}> has been banned for sending scam links`
                    ),
                ],
              });
              message.member.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor(0x2f3136)
                    .setDescription(
                      `You have been banned from ${message.guild.name} for sending scam links`
                    ),
                ],
              });
              await message.member
                .ban({ reason: "Sending Scam Links" })
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

        const msg = await message.channel.send({ embeds: [embed] });

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Kick")
            .setEmoji("⚒️")
            .setCustomId("kick")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setLabel("Ban")
            .setEmoji("🔨")
            .setCustomId("ban")
            .setStyle(ButtonStyle.Danger)
        );
        setTimeout(async () => {
          await msg.delete();
        }, 5000);
        const text = await logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x2f3136)
              .setDescription(
                `<@${message.author.id}> has sent a harmful link.\n\`\`\`${message.content}\`\`\``
              ),
          ],
          components: [buttons],
        });
        const col = text.createMessageComponentCollector();
        col.on("collect", async (m) => {
          switch (m.customId) {
            case "kick":
              if (!m.member.permissions.has(PermissionFlagsBits.KickMembers))
                return m.reply({
                  content: "You don't have permission to kick",
                  ephemeral: true,
                });
              if (!message.member) {
                return m.reply({
                  content: "This user doesn't exist",
                  ephemeral: true,
                });
              }
              const embed = new EmbedBuilder()
                .setTitle("Kicked")
                .setDescription(
                  `You have been kicked from \`${message.guild.name}\` for sending scam links`
                )
                .setColor(0x2f3136);

              m.reply({
                content: `Kicked ${message.author.tag}`,
                ephemeral: true,
              });
              message.member
                .send({
                  embeds: [embed],
                })
                .then(() => {
                  message.member.kick({ reason: "Sending scam links" });
                });
              break;
            case "ban":
              if (!m.member.permissions.has(PermissionFlagsBits.KickMembers))
                return m.reply({
                  content: "You don't have permission to ban",
                  ephemeral: true,
                });
              const embedss = new EmbedBuilder()
                .setTitle("Kicked")
                .setDescription(
                  `You have been banned from \`${message.guild.name}\` for sending scam links`
                )
                .setColor(0x2f3136);
              if (!message.member) {
                return m.reply({
                  content: "This user doesn't exist",
                  ephemeral: true,
                });
              }
              m.reply({
                content: `Banned ${message.author.tag}`,
                ephemeral: true,
              });
              message.member
                .send({
                  embeds: [embedss],
                })
                .then(() => {
                  message.member.ban({ reason: "Sending scam links" });
                });
              break;
          }
        });
      }
    }
  },
};