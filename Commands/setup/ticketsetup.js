const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const TicketSetup = require("../../Models/TicketSetup"); // since it's multi-guilded we won't be using the config anymore

module.exports = {
  premiumOnly: false,
  adminOnly: false,
  data: new SlashCommandBuilder()
    .setName("ticketsetup")
    .setDescription("Create a ticket message.")
    .setDMPermission(false)
    .addChannelOption(option =>
      option.setName("category")
        .setDescription("Select the parent of where the tickets should be created.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addChannelOption(option =>
      option.setName("transcripts")
        .setDescription("Select the channel where the transcripts should be sent.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption(option =>
      option.setName("handlers")
        .setDescription("Select the ticket handlers role.")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName("everyone")
        .setDescription("Select the @everyone role.")
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Select the channel where the tickets should be created.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
    ),
  async execute(interaction) {
    const { guild, options } = interaction;

    try {
      const channel = options.getChannel("channel") || interaction.channel;
      const category = options.getChannel("category");
      const transcripts = options.getChannel("transcripts");

      const handlers = options.getRole("handlers");
      const everyone = options.getRole("everyone");

      await TicketSetup.findOneAndUpdate(
        { GuildID: guild.id },
        {
          Channel: channel.id,
          Category: category.id,
          Transcripts: transcripts.id,
          Handlers: handlers.id,
          Everyone: everyone.id,
        },
        {
          new: true,
          upsert: true,
        }
      );

      const button = new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('ticketButton').setLabel('Make a ticket').setStyle(ButtonStyle.Primary).setEmoji('📩')
      );

      const embed = new EmbedBuilder()
        .setThumbnail("https://th.bing.com/th/id/R.40f1b6135db8cbaba4a6f39585991f58?rik=iHBMMeF2zVMiRg&riu=http%3a%2f%2fwww.htyweb.org%2fwp-content%2fuploads%2f2014%2f07%2ftickets-icon2.png&ehk=LBmEMYtDixNsEe1vFYMrNuBmTDdG4gFda9JrWkST1zQ%3d&risl=&pid=ImgRaw&r=0")
        .addFields({ name: "📬 Tickets\n", value: "If you click the button under this message a modal will pop up where you can create a ticket and chat with one of our staffmembers.\n\n**Note:** No coding support unless You Have Any Blacklisted Role" })
        .setFooter({ text: "Support", iconURL: "https://th.bing.com/th/id/R.40f1b6135db8cbaba4a6f39585991f58?rik=iHBMMeF2zVMiRg&riu=http%3a%2f%2fwww.htyweb.org%2fwp-content%2fuploads%2f2014%2f07%2ftickets-icon2.png&ehk=LBmEMYtDixNsEe1vFYMrNuBmTDdG4gFda9JrWkST1zQ%3d&risl=&pid=ImgRaw&r=0" })
        .setColor("#e83181");

      await guild.channels.cache.get(channel.id).send({
        embeds: ([embed]),
        components: [
          button
        ]
      });

      interaction.reply({ content: "Ticket message has been sent.", ephemeral: true });
    } catch (err) {
      console.log(err);
      const errEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription("Something went wrong...");

      return interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }
  }
}