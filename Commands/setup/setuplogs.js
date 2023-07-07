const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType}= require('discord.js');
const logSchema = require("../../Models/Logs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup-logs")
        .setDescription("Setup you logs channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addChannelOption(option => 
            option.setName("channel").setDescription("Select the channel").setRequired(false)),
        
        async execute(interaction) {
            const {channel, guildId, options} = interaction;
            const logChannel = options.getChannel("channel") || channel;

            const embed = new EmbedBuilder()
            
            logSchema.findOneAndDelete({Guild: guildId}, async (err, data) =>{
                if (!data) {
                    await logSchema.create({
                        Guild: guildId,
                        Channel: logChannel.id,
                    })
                
                embed.setDescription("Data was successfully sent to database")
                .setColor('Red')
                .setTimestamp()
                } else if (data) {
                    logSchema.deleteOne({Guild: guildId});
                    await logSchema.create({
                        Guild: guildId,
                        Channel: logChannel.id
                    })

                    embed.setDescription("Old data was successfully replaced with new data.").setColor("Blue").setTimestamp()
                }

                if (err) {
                    embed.setColor("Red").setDescription("Something went wrong...").setTimestamp()
                }

                return interaction.reply({embeds: [embed], ephemeral: true});
            })
        }
}