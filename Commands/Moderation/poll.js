const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  premiumOnly: false,
  moderatorOnly: true,
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll and send it to a certain channel.")
    .setDMPermission(false)
    .addStringOption(option =>
      option.setName("description")
        .setDescription("Describe the poll.")
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Where do you want to send the poll to?")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
    ),
  async execute(interaction) {
    const { options, channel } = interaction;

    const pChannel = options.getChannel("channel") || channel;
    const description = options.getString("description");

    const embed = new EmbedBuilder()
      .setColor("#235ee7")
      .setTitle("New Poll")
      .setDescription(description)
      .setTimestamp();

    try {
      const m = await pChannel.send({ embeds: [embed] });
      pChannel.send("<@&1032785824686817295>");
      await m.react("✅");
      await m.react("❌");
      await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`✅ | Poll sent to ${channel}!`).setColor("Green")], ephemeral: true });
    } catch (err) {
      console.log(err);
    }
  }
}