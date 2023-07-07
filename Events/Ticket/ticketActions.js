 const { ButtonInteraction, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
 const { createTranscript } = require("discord-html-transcripts");
 const TicketSetup = require("../../Models/TicketSetup");
 const ticketSchema = require("../../Models/Ticket");

 module.exports = {
     name: "interactionCreate",

     async execute(interaction) {
         const { guild, member, customId, channel } = interaction;
         const { ManageChannels, SendMessages } = PermissionFlagsBits;

         if (!interaction.isButton()) return;

         if (!["close", "lock", "unlock"].includes(customId)) return;

         const docs = await TicketSetup.findOne({ GuildID: guild.id });

         if (!docs) return;

         if (!guild.members.me.permissions.has((r) => r.id === docs.Handlers))
             return interaction.reply({ content: "I don't have permissions for this.", ephemeral: true });

         const embed = new EmbedBuilder().setColor("Aqua");

         ticketSchema.findOne({ ChannelID: channel.id }, async (err, data) => {
             if (err) throw err;
             if (!data) return;

             const fetchedMember = await guild.members.cache.get(data.MembersID);

             switch (customId) {
                 case "close":
                     if (data.closed == true)
                         return interaction.reply({ content: "Ticket is already getting deleted...", ephemeral: true });

                     const transcript = await createTranscript(channel, {
                         limit: -1,
                         returnBuffer: false,
                         fileName: `${member.user.username}-ticket${data.Type}-${data.TicketID}.html`,
                     });

                     await ticketSchema.updateOne({ ChannelID: channel.id }, { Closed: true });

                     const transcriptEmbed = new EmbedBuilder()
                         .setTitle(`Transcript Type: ${data.Type}\nId: ${data.TicketID}`)
                         .setFooter({ text: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true }) })
                         .setTimestamp();

                     const transcriptProcesss = new EmbedBuilder()
                         .setTitle('Saving transcript...')
                         .setDescription("Ticket will be closed in 10 seconds, enable DM's for the ticket transcript.")
                         .setColor("Red")
                         .setFooter({ text: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true }) })
                         .setTimestamp();

                     const res = await guild.channels.cache.get(docs.Transcripts).send({
                         embeds: [transcriptEmbed],
                         files: [transcript],
                     });

                     await channel.delete();

                     break;

                 case "lock":
                     if (!member.permissions.has(ManageChannels))
                         return interaction.reply({ content: "You don't have permissions for that.", ephemeral: true });

                     if (data.Locked == true)
                         return interaction.reply({ content: "Ticket is already set to locked.", ephemeral: true });

                     await ticketSchema.updateOne({ ChannelID: channel.id }, { Locked: true });
                     embed.setDescription("Ticket was locked succesfully 🔒");

                     data.MembersID.forEach((m) => {
                         channel.permissionOverwrites.edit(m, { SendMessages: false });
                     });

                     return interaction.reply({ embeds: [embed] });

                 case "unlock":
                     if (!member.permissions.has(ManageChannels))
                         return interaction.reply({ content: "You don't have permissions for that.", ephemeral: true });

                     if (data.Locked == false)
                         return interaction.reply({ content: "Ticket is already set to unlocked.", ephemeral: true });

                     await ticketSchema.updateOne({ ChannelID: channel.id }, { Locked: false });
                     embed.setDescription("Ticket was unlocked succesfully 🔓");

                     data.MembersID.forEach((m) => {
                         channel.permissionOverwrites.edit(m, { SendMessages: true });
                     });

                     return interaction.reply({ embeds: [embed] });

             }
         });
     }
 }