const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    Client,
    EmbedBuilder,
  } = require("discord.js");
  module.exports = {
    premiumOnly: false,
    data: new SlashCommandBuilder()
      .setName("kick")
      .setDescription("Kick the member from the server.")
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembersMembers)
      .setDMPermission(false)
      .addUserOption((options) =>
        options
          .setName("target")
          .setDescription("Select the target Member")
          .setRequired(true)
      )
      .addAttachmentOption((options) =>
        options
          .setName("evidence")
          .setDescription("Attach a edivence")
          .setRequired(true)
      )
      .addStringOption((options) =>
        options
          .setName("dm")
          .setDescription("Do you want to dm the user")
          .addChoices(
            { name: "No", value: "False" },
            { name: "Yes", value: "True" }
          )
          .setRequired(true)
      )
      .addStringOption((options) =>
        options
          .setName("reason")
          .setDescription("Provide a reason to kick the member ")
          .setMaxLength(512)
      ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
      const { options, guild, member } = interaction;
      const target = options.getMember("target");
      const reason = options.getString("reason") || "Non Specified.";
      const evidence = options.getAttachment("evidence");
      const dm = options.getString("dm");
      const errorArray = [];
      const errorsEmbed = new EmbedBuilder()
        .setAuthor({ name: "Could not kick this member due to" })
        .setColor("Red");
      if (!target)
        return interaction.reply({
          embeds: [errorsEmbed.setDescription("`Could not find that target`")],
          ephemeral: true,
        });
      if (target.id == interaction.user.id)
        return interaction.reply({
          embeds: [errorsEmbed.setDescription("`You cannot kick yourself`")],
          ephemeral: true,
        });
      if (target.id == client.user.id)
        return interaction.reply({
          embeds: [errorsEmbed.setDescription("`You cannot kick me`")],
          ephemeral: true,
        });
      if (target.id == interaction.guild.ownerId)
        return interaction.reply({
          embeds: [errorsEmbed.setDescription("`You cannot kick the owner`")],
          ephemeral: true,
        });
      if (!target.manageable || !target.moderatable)
        errorArray.push("`Selected target is not a moderatable by this bot.`");
  
      if (member.roles.highest.position < target.roles.highest.position)
        errorArray.push("`Selected target has higer role than yours.`");
  
      if (errorArray.length)
        return interaction.reply({
          embeds: [errorsEmbed.setDescription(errorArray.join("\n"))],
          ephemeral: true,
        });
      await interaction.deferReply();
      switch (dm) {
        case "False":
        case "True":
          const embed1 = new EmbedBuilder()
            .setTitle("Kicked")
            .setDescription(
              `You have been kicked from **${guild.name}** for **Reason:** \`${reason}\`, See the evidence above`
            )
            .setColor(0xb9127a);
          await target.send({ embeds: [embed1], files: [evidence] });
      }
      await interaction.guild.members.kick(target);
      const successEmbed = new EmbedBuilder()
        .setAuthor({ name: "Kick Issues", iconURL: guild.iconURL() })
        .setTitle("Kick Reports")
        .setColor("0xb9127a")
        .setDescription(
          [
            `*${target}* was issued a kick by **${member}**`,
            `**Reason:** ${reason}`,
            `\nDmed: ${dm}`,
          ].join("\n")
        );
  
      interaction.editReply({
        ephemeral: false,
        files: [evidence],
        embeds: [successEmbed],
      });
    },
  };