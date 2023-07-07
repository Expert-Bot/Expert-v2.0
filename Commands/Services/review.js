const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  premiumOnly: false,
  data: new SlashCommandBuilder()
    .setName("review")
    .setDescription("Leave a review in our reviews channel!")
    .setDMPermission(false)
    .addStringOption(option =>
      option.setName("stars")
        .setDescription("Amount of stars.")
        .addChoices(
          { name: "⭐", value: "⭐" },
          { name: "⭐⭐", value: "⭐⭐" },
          { name: "⭐⭐⭐", value: "⭐⭐⭐" },
          { name: "⭐⭐⭐⭐", value: "⭐⭐⭐⭐" },
          { name: "⭐⭐⭐⭐⭐", value: "⭐⭐⭐⭐⭐" }
        )
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("description")
        .setDescription("Description of your review.")
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName("developer")
        .setDescription("Who helped you on your project?")
        .setRequired(false)
    ),
  async execute(interaction) {
    const { options, member } = interaction;

    const stars = options.getString("stars");
    const description = options.getString("description");
    const developer = options.getUser("developer") || "None provided";

    const channel = member.guild.channels.cache.get("1097145327192129576");
    const customer = member.roles.cache.has("1091147283036373062");

    const embed = new EmbedBuilder();

    if (!customer) {
      embed.setColor("Red")
        .setTimestamp()
        .setDescription("You are not a registered customer.")
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    embed
      .addFields(
        { name: "Developer", value: `${developer}_ _`, inline: true },
        { name: "Stars", value: `${stars}`, inline: true },
        { name: "Review", value: `${description}\n` },
      )
      .setColor(0x235ee7)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    channel.send({ embeds: [embed] });

    embed.setDescription(`You review was succesfully sent in ${channel}!\n\n**Preview:** `).setColor(0x235ee7);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}