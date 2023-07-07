const {
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const automod = require("../../Schemas/automod");
const AntiSwear = require("../../Systems/BadWord.json");

module.exports = {
  name: "messageCreate",
  /**
 * 

 * @param {Client} client 
 */
  async execute(message, client) {
    if (!message.guild) return;
    if (message.author.bot) return;

    if (message.member.permissions.has(PermissionFlagsBits.Administrator))
      return;
    const guild = message.guild;

    let requireDB = await automod.findOne({ Guild: guild.id });
    if (!requireDB) return;
    if (requireDB.AntiSwear === false) return;

    const Swearlinks = AntiSwear.known_links;
    
    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription(
        `:warning: | <@${message.author.id}> has been warned for bad word usage.`
      );

    for (let i in Swearlinks) {
      if (message.content.toLowerCase().includes(Swearlinks[i].toLowerCase())) {
        try {
          await message.delete();
        } catch (err) {
          return;
        }

        const logChannel = client.channels.cache.get(requireDB.LogChannel);

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

        const msg = await message.channel.send({ embeds: [embed] });
        setTimeout(async () => {
          await msg.delete();
        }, 5000);
        const text = await logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x2f3136)
              .setDescription(
                `<@${message.author.id}> has been warned for bad word usage.\n\`\`\`${message.content}\`\`\``
              ),
          ],
          components: [buttons],
        });
        const col = text.createMessageComponentCollector();
        col.on("collect", async (m) => {
          const ms = require("ms");
          switch (m.customId) {
            case "timeout":
              if (
                !m.member.permissions.has(PermissionFlagsBits.ModerateMembers)
              )
                return m.reply({
                  content: "You don't have permission to timeout",
                  ephemeral: true,
                });
              const embed = new EmbedBuilder()
                .setTitle("Timeout")
                .setDescription(
                  `You have received a timeout from \`${message.guild.name}\` for sending scam links`
                )
                .setColor(0x2f3136);

              m.reply({
                content: `Timeout ${message.author.tag}`,
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
                  `You have been kicked from \`${message.guild.name}\` for sending scam links`
                )
                .setColor(0x2f3136);
              m.reply({
                embeds: `Kicked ${message.author.tag}`,
                ephemeral: true,
              });
              message.member
                .send({
                  embeds: [embedss],
                })
                .then(() => {
                  message.member.kick({ reason: "Sending scam links" });
                });
              break;
          }
        });
      }
    }
  },
};