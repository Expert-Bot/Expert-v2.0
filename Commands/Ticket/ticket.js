const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ticketSchema = require("../../Models/Ticket");

module.exports = {
  premiumOnly: false,
    moderatorOnly: false,
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Execute several ticket actions.")
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand.setName("add")
                .setDescription("Add the members in the ticket.")
                .addUserOption(option =>
                    option.setName("member")
                        .setDescription("Select a member from the discord server to perform the action on.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("remove")
                .setDescription("Remove the members in the ticket.")
                .addUserOption(option =>
                    option.setName("member")
                        .setDescription("Select a member from the discord server to perform the action on.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("lock")
                .setDescription("Prevent people from talking in the ticket.")
        )
        .addSubcommand(subcommand =>
            subcommand.setName("unlock")
                .setDescription("Disable the ticket lock.")
        ),

    async execute(interaction) {
        const { guildId, options, channel } = interaction;

        const sub = options.getSubcommand();
        const member = options.getUser("member");

        const embed = new EmbedBuilder()

        switch (sub) {
            case "add":
                ticketSchema.findOne({ GuildID: guildId, ChannelID: channel.id }, async (err, data) => {
                    if (err) throw err;
                    if (!data)
                        return interaction.reply({ embeds: [embed.setColor("Red").setDescription("Something went wrong. Try again later.")], ephemeral: true });

                    if (data.MembersID.includes(member.id))
                        return interaction.reply({ embeds: [embed.setColor("Red").setDescription("Something went wrong. Try again later.")], ephemeral: true });

                    data.MembersID.push(member.id);

                    channel.permissionOverwrites.edit(member.id, {
                        SendMessages: true,
                        ViewChannel: true,
                        ReadMessageHistory: true
                    });

                    interaction.reply({ embeds: [embed.setColor("Green").setDescription(`${member} has been added to the ticket.`)] });

                    data.save();
                });
                break;
            case "remove":
                ticketSchema.findOne({ GuildID: guildId, ChannelID: channel.id }, async (err, data) => {
                    if (err) throw err;
                    if (!data)
                        return interaction.reply({ embeds: [embed.setColor("Red").setDescription("Something went wrong. Try again later.")], ephemeral: true });

                    if (!data.MembersID.includes(member.id))
                        return interaction.reply({ embeds: [embed.setColor("Red").setDescription("Something went wrong. Try again later.")], ephemeral: true });

                    data.MembersID.remove(member.id);

                    channel.permissionOverwrites.edit(member.id, {
                        SendMessages: false,
                        ViewChannel: false,
                        ReadMessageHistory: false
                    });

                    interaction.reply({ embeds: [embed.setColor("Green").setDescription(`${member} has been removed from the ticket.`)] });

                    data.save();
                });
                break;
            case "lock":
                ticketSchema.findOne({ GuildID: guildId, ChannelID: channel.id }, async (err, data) => {
                    if (data.Locked == true)
                        return interaction.reply({ content: "Ticket is already set to locked.", ephemeral: true });

                    await ticketSchema.updateOne({ ChannelID: channel.id }, { Locked: true });
                    embed.setDescription("🔒 | Ticket was locked succesfully.").setColor("#235ee7").setTimestamp();

                    data.MembersID.forEach((m) => {
                        channel.permissionOverwrites.edit(m, { SendMessages: false });
                    });

                    interaction.reply({ embeds: [embed] });
                });
                break;
            case "unlock":
                ticketSchema.findOne({ GuildID: guildId, ChannelID: channel.id }, async (err, data) => {
                    if (data.Locked == false)
                        return interaction.reply({ content: "Ticket is already set to unlocked.", ephemeral: true });

                    await ticketSchema.updateOne({ ChannelID: channel.id }, { Locked: false });
                    embed.setDescription("🔓 | Ticket was unlocked succesfully").setColor("#235ee7").setTimestamp();

                    data.MembersID.forEach((m) => {
                        channel.permissionOverwrites.edit(m, { SendMessages: true });
                    });

                    interaction.reply({ embeds: [embed] });
                });
                break;
        }
    }
}