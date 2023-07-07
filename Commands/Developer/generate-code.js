const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { Code } = require("../../Models/codeSchema");

module.exports = {
  adminOnly: true,
  premiumOnly: false,
  data: new SlashCommandBuilder()
    .setName("generate-code")
    .setDescription("Only For Bot owner")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("length")
        .setDescription("The length of time the code should be valid for")
        .setRequired(true)
        .addChoices(
          {
            name: "1 day",
            value: "daily",
          },
          {
            name: "7 days",
            value: "weekly",
          },
          {
            name: "30 days",
            value: "monthly",
          },
          {
            name: "365 days",
            value: "yearly",
          }
        )
    ),

  async execute(interaction) {
    const codeLength = interaction.options.getString("length");
    const validLengths = ["daily", "weekly", "monthly", "yearly"];
    const codeType = validLengths.includes(codeLength) ? codeLength : "daily";

    const code = Math.random().toString(36).substring(2, 8);
    const newCode = new Code({
      code,
      length: codeType,
    });

    try {
      await newCode.save();
      const embed = new EmbedBuilder()
        .setTitle("Code Generated")
        .setDescription("Your code has been successfully generated.")
        .addFields(
          { name: "Code", value: `${code}`, inline: true },
          { name: "Length", value: `${codeType}`, inline: true }
        )
        .setColor("Green")
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setTitle("Code Generation Failed")
        .setDescription(
          "An error occurred while generating the code. Please try again later."
        )
        .setColor("Red");
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
