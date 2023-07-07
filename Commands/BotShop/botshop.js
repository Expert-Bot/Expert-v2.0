const {
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  premiumOnly: false,
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName("botshop")
    .setDescription("Open a botshop in your server"),

  async execute(interaction) {
    const channel = await interaction.guild.channels.cache.get(
      "1101154371238121592"
    );
    if (!channel) return;
    interaction.reply({ content: "Opened Botshop for everyone", ephemeral: true })
    const embed = new EmbedBuilder()
      .setTitle("🛒 BotShop")
      .setDescription("➡️ **You want to Order a BOT or a Service? --> Go ahead and select the type:muscle:**\n\n:question:**How to order a bot**\n*To order a bot click on the menu below to see all the types of bot click one to create the order*\n\n:question:**What are the prices**\n*Prices are dependent on your country currency and bot type we also accept nitro 1 month*\n\n`What are you waiting for order one now 😏`")
    let rowmenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("menu2")
        .setPlaceholder("Help Menu")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions([
          {
            label: "Moderation Bot",
            value: "option1",
            description:
              "5$ 1month | 60$ 1year",
          },
          {
            label: "Fun and Nsfw Bot",
            value: "option2",
            description: "1$ 1month | 12$ 1year",
          },
          {
            label: "Chatbot",
            value: "option3",
            description: "3$ 1month | 36$ 1year",
          },
        ])
    );
    const link = `https://top.gg/bot/1023810715250860105`;
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setURL(link)
        .setLabel("vote")
        .setStyle(ButtonStyle.Link)
    );
    const MESSAGE = await channel.send({
      embeds: [embed],
      components: [rowmenu, buttons],
      ephemeral: false,
    });
  },
};
