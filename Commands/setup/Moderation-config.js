const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require(`discord.js`);
const banCommand = require('../../Schemas/commandBan');
const muteCommand = require('../../Schemas/commandMute');
const stealCommand = require('../../Schemas/commandSteal');
const clearCommand = require('../../Schemas/commandClear');
const unbanCommand = require('../../Schemas/commandUnban');
const unmuteCommand = require('../../Schemas/commandUnmute');
 
 
module.exports = {
    category: "Managing",
    data: new SlashCommandBuilder()
    .setName('modconfig')
    .setDescription('Configure all of the moderation commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
 
        if (!interaction.guild) return await interaction.reply({ content: "This command is only usable in the server!", ephemeral: true });
 
        const membermissing = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('You have to have the `Administrator Permission` to be able to interact with this button.')
 
        const updatedBanData = await banCommand.findOne({ Guild: interaction.guild.id });
        const updatedMuteData = await muteCommand.findOne({ Guild: interaction.guild.id });
        const updatedStealData = await stealCommand.findOne({ Guild: interaction.guild.id });
        const updatedClearData = await clearCommand.findOne({ Guild: interaction.guild.id });
        const updatedUnbanData = await unbanCommand.findOne({ Guild: interaction.guild.id });
        const updatedUnmuteData = await unmuteCommand.findOne({ Guild: interaction.guild.id });
        
        let ban = "";
        if (!updatedBanData || !updatedBanData.enabled) ban = "🔴";
        else ban = "🟢";
 
        let mute = "";
        if (!updatedMuteData || !updatedMuteData.enabled) mute = "🔴";
        else mute = "🟢";
        
        let steal = "";
        if (!updatedStealData || !updatedStealData.enabled) steal = "🔴";
        else steal = "🟢";
        
        let clear = "";
        if (!updatedClearData || !updatedClearData.enabled) clear = "🔴";
        else clear = "🟢";
        
        let unban = "";
        if (!updatedUnbanData || !updatedUnbanData.enabled) unban = "🔴";
        else unban = "🟢";
        
        let unmute = "";
        if (!updatedUnmuteData || !updatedUnmuteData.enabled) unmute = "🔴";
        else unmute = "🟢";
        
 
        const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(`banbutton`)
            .setLabel(`🛠️ Ban`)
            .setStyle(ButtonStyle.Primary),
 
            new ButtonBuilder()
            .setCustomId(`mutebutton`)
            .setLabel(`🔇 Mute`)
            .setStyle(ButtonStyle.Primary),
 
            new ButtonBuilder()
            .setCustomId(`stealbutton`)
            .setLabel(`💰 Steal`)
            .setStyle(ButtonStyle.Primary),
        )
 
        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(`clearbutton`)
            .setLabel(`🗑️ Clear`)
            .setStyle(ButtonStyle.Primary),
            
            new ButtonBuilder()
            .setCustomId(`unbanbutton`)
            .setLabel(`🎉 Unban`)
            .setStyle(ButtonStyle.Primary),
            
            new ButtonBuilder()
            .setCustomId(`unmutebutton`)
            .setLabel(`🔊 Unmute`)
            .setStyle(ButtonStyle.Primary),
        )
 
        const reload = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(`reloadbutton`)
            .setLabel(`\uD83D\uDD03 Reload Page`)
            .setStyle(ButtonStyle.Danger),
        )
 
        const configEmbed = new EmbedBuilder()
        .setColor('DarkGrey')
        .setTitle('Configure Moderation')
        .setDescription(`Use the buttons below to enable or disable each command.`)
        .addFields(
            { name: 'Note', value: 'Only members with administrator permissions will be able to interact with these buttons.' },
            { name: 'Commands', value: `- ${ban} Ban\n- ${mute} Mute\n- ${steal} Steal\n- ${clear} Clear\n- ${unban} Unban\n- ${unmute} Unmute` }
        );
    
 
        const message = await interaction.reply({ embeds: [configEmbed], components: [buttons, button, reload] });
 
        const collector = await message.createMessageComponentCollector();
 
        collector.on('collect', async i => {
            
            if (i.customId === 'banbutton') {
                if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({
                    embeds: [membermissing],
                    ephemeral: true
                })
                let banData = await banCommand.findOne({ Guild: i.guild.id });
                if (!banData) {
                  banData = await banCommand.create({ Guild: i.guild.id, enabled: true });
                } else {
                  banData.enabled = !banData.enabled;
                  await banData.save();
                }
          
                const updatedBanData = await banCommand.findOne({ Guild: i.guild.id });
                const updatedMuteData = await muteCommand.findOne({ Guild: i.guild.id });
                const updatedStealData = await stealCommand.findOne({ Guild: i.guild.id });
                const updatedClearData = await clearCommand.findOne({ Guild: i.guild.id });
                const updatedUnbanData = await unbanCommand.findOne({ Guild: i.guild.id });
                const updatedUnmuteData = await unmuteCommand.findOne({ Guild: i.guild.id });
          
                let ban = "";
                if (!updatedBanData || !updatedBanData.enabled) ban = "🔴";
                else ban = "🟢";
          
                let mute = "";
                if (!updatedMuteData || !updatedMuteData.enabled) mute = "🔴";
                else mute = "🟢";
          
                let steal = "";
                if (!updatedStealData || !updatedStealData.enabled) steal = "🔴";
                else steal = "🟢";
          
                let clear = "";
                if (!updatedClearData || !updatedClearData.enabled) clear = "🔴";
                else clear = "🟢";
          
                let unban = "";
                if (!updatedUnbanData || !updatedUnbanData.enabled) unban = "🔴";
                else unban = "🟢";
          
                let unmute = "";
                if (!updatedUnmuteData || !updatedUnmuteData.enabled) unmute = "🔴";
                else unmute = "🟢";
          
        const configEmbed = new EmbedBuilder()
        .setColor('DarkGrey')
        .setTitle('Configure Moderation')
        .setDescription(`Use the buttons below to enable or disable each command.`)
        .addFields(
            { name: 'Note', value: 'Only members with administrator permissions will be able to interact with these buttons.' },
            { name: 'Commands', value: `- ${ban} Ban\n- ${mute} Mute\n- ${steal} Steal\n- ${clear} Clear\n- ${unban} Unban\n- ${unmute} Unmute` }
        );
          
                await message.edit({ embeds: [configEmbed]});
          
                if (banData.enabled) {
                  const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`You successfully turned **on** the Ban command.`);
                  await i.reply({ embeds: [embed], ephemeral: true });
                  
                } else {
                  const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`You successfully turned **off** the Ban command.`);
                  await i.reply({ embeds: [embed], ephemeral: true });
          
                }
              }
 
              if (i.customId === 'mutebutton') {
                if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({
                    embeds: [membermissing],
                    ephemeral: true
                })
                let banData = await muteCommand.findOne({ Guild: i.guild.id });
                if (!banData) {
                  banData = await muteCommand.create({ Guild: i.guild.id, enabled: true });
                } else {
                  banData.enabled = !banData.enabled;
                  await banData.save();
                }
          
          
                const updatedBanData = await banCommand.findOne({ Guild: i.guild.id });
                const updatedMuteData = await muteCommand.findOne({ Guild: i.guild.id });
                const updatedStealData = await stealCommand.findOne({ Guild: i.guild.id });
                const updatedClearData = await clearCommand.findOne({ Guild: i.guild.id });
                const updatedUnbanData = await unbanCommand.findOne({ Guild: i.guild.id });
                const updatedUnmuteData = await unmuteCommand.findOne({ Guild: i.guild.id });
          
                let ban = "";
                if (!updatedBanData || !updatedBanData.enabled) ban = "🔴";
                else ban = "🟢";
          
                let mute = "";
                if (!updatedMuteData || !updatedMuteData.enabled) mute = "🔴";
                else mute = "🟢";
          
                let steal = "";
                if (!updatedStealData || !updatedStealData.enabled) steal = "🔴";
                else steal = "🟢";
          
                let clear = "";
                if (!updatedClearData || !updatedClearData.enabled) clear = "🔴";
                else clear = "🟢";
          
                let unban = "";
                if (!updatedUnbanData || !updatedUnbanData.enabled) unban = "🔴";
                else unban = "🟢";
          
                let unmute = "";
                if (!updatedUnmuteData || !updatedUnmuteData.enabled) unmute = "🔴";
                else unmute = "🟢";
          
        const configEmbed = new EmbedBuilder()
        .setColor('DarkGrey')
        .setTitle('Configure Moderation')
        .setDescription(`Use the buttons below to enable or disable each command.`)
        .addFields(
            { name: 'Note', value: 'Only members with administrator permissions will be able to interact with these buttons.' },
            { name: 'Commands', value: `- ${ban} Ban\n- ${mute} Mute\n- ${steal} Steal\n- ${clear} Clear\n- ${unban} Unban\n- ${unmute} Unmute` }
        );
          
                await message.edit({ embeds: [configEmbed]});
          
                if (banData.enabled) {
                  const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`You successfully turned **on** the Mute command.`);
                  await i.reply({ embeds: [embed], ephemeral: true });
                  
                } else {
                  const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`You successfully turned **off** the Mute command.`);
                  await i.reply({ embeds: [embed], ephemeral: true });
          
                }
            
          }
 
          if (i.customId === 'stealbutton') {
            if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({
                embeds: [membermissing],
                ephemeral: true
            })
            let banData = await stealCommand.findOne({ Guild: i.guild.id });
            if (!banData) {
              banData = await stealCommand.create({ Guild: i.guild.id, enabled: true });
            } else {
              banData.enabled = !banData.enabled;
              await banData.save();
            }
      
      
            const updatedBanData = await banCommand.findOne({ Guild: i.guild.id });
            const updatedMuteData = await muteCommand.findOne({ Guild: i.guild.id });
            const updatedStealData = await stealCommand.findOne({ Guild: i.guild.id });
            const updatedClearData = await clearCommand.findOne({ Guild: i.guild.id });
            const updatedUnbanData = await unbanCommand.findOne({ Guild: i.guild.id });
            const updatedUnmuteData = await unmuteCommand.findOne({ Guild: i.guild.id });
      
            let ban = "";
            if (!updatedBanData || !updatedBanData.enabled) ban = "🔴";
            else ban = "🟢";
      
            let mute = "";
            if (!updatedMuteData || !updatedMuteData.enabled) mute = "🔴";
            else mute = "🟢";
      
            let steal = "";
            if (!updatedStealData || !updatedStealData.enabled) steal = "🔴";
            else steal = "🟢";
      
            let clear = "";
            if (!updatedClearData || !updatedClearData.enabled) clear = "🔴";
            else clear = "🟢";
      
            let unban = "";
            if (!updatedUnbanData || !updatedUnbanData.enabled) unban = "🔴";
            else unban = "🟢";
      
            let unmute = "";
            if (!updatedUnmuteData || !updatedUnmuteData.enabled) unmute = "🔴";
            else unmute = "🟢";
      
            const configEmbed = new EmbedBuilder()
            .setColor('DarkGrey')
            .setTitle('Configure Moderation')
            .setDescription(`Use the buttons below to enable or disable each command.`)
            .addFields(
                { name: 'Note', value: 'Only members with administrator permissions will be able to interact with these buttons.' },
                { name: 'Commands', value: `- ${ban} Ban\n- ${mute} Mute\n- ${steal} Steal\n- ${clear} Clear\n- ${unban} Unban\n- ${unmute} Unmute` }
            );
      
            await message.edit({ embeds: [configEmbed]});
      
            if (banData.enabled) {
              const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`You successfully turned **on** the Steal command.`);
              await i.reply({ embeds: [embed], ephemeral: true });
              
            } else {
              const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`You successfully turned **off** the Steal command.`);
              await i.reply({ embeds: [embed], ephemeral: true });
      
            }
        } 
 
        if (i.customId === 'clearbutton') {
            if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({
                embeds: [membermissing],
                ephemeral: true
            })
            let banData = await clearCommand.findOne({ Guild: i.guild.id });
            if (!banData) {
              banData = await clearCommand.create({ Guild: i.guild.id, enabled: true });
            } else {
              banData.enabled = !banData.enabled;
              await banData.save();
            }
      
      
            const updatedBanData = await banCommand.findOne({ Guild: i.guild.id });
            const updatedMuteData = await muteCommand.findOne({ Guild: i.guild.id });
            const updatedStealData = await stealCommand.findOne({ Guild: i.guild.id });
            const updatedClearData = await clearCommand.findOne({ Guild: i.guild.id });
            const updatedUnbanData = await unbanCommand.findOne({ Guild: i.guild.id });
            const updatedUnmuteData = await unmuteCommand.findOne({ Guild: i.guild.id });
      
            let ban = "";
            if (!updatedBanData || !updatedBanData.enabled) ban = "🔴";
            else ban = "🟢";
      
            let mute = "";
            if (!updatedMuteData || !updatedMuteData.enabled) mute = "🔴";
            else mute = "🟢";
      
            let steal = "";
            if (!updatedStealData || !updatedStealData.enabled) steal = "🔴";
            else steal = "🟢";
      
            let clear = "";
            if (!updatedClearData || !updatedClearData.enabled) clear = "🔴";
            else clear = "🟢";
      
            let unban = "";
            if (!updatedUnbanData || !updatedUnbanData.enabled) unban = "🔴";
            else unban = "🟢";
      
            let unmute = "";
            if (!updatedUnmuteData || !updatedUnmuteData.enabled) unmute = "🔴";
            else unmute = "🟢";
      
            const configEmbed = new EmbedBuilder()
            .setColor('DarkGrey')
            .setTitle('Configure Moderation')
            .setDescription(`Use the buttons below to enable or disable each command.`)
            .addFields(
                { name: 'Note', value: 'Only members with administrator permissions will be able to interact with these buttons.' },
                { name: 'Commands', value: `- ${ban} Ban\n- ${mute} Mute\n- ${steal} Steal\n- ${clear} Clear\n- ${unban} Unban\n- ${unmute} Unmute` }
            );
      
            await message.edit({ embeds: [configEmbed]});
      
            if (banData.enabled) {
              const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`You successfully turned **on** the Clear command.`);
              await i.reply({ embeds: [embed], ephemeral: true });
              
            } else {
              const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`You successfully turned **off** the Clear command.`);
              await i.reply({ embeds: [embed], ephemeral: true });
      
            }
        } 
 
        if (i.customId === 'unbanbutton') {
            if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({
                embeds: [membermissing],
                ephemeral: true
            })
            let banData = await unbanCommand.findOne({ Guild: i.guild.id });
            if (!banData) {
              banData = await unbanCommand.create({ Guild: i.guild.id, enabled: true });
            } else {
              banData.enabled = !banData.enabled;
              await banData.save();
            }
      
      
            const updatedBanData = await banCommand.findOne({ Guild: i.guild.id });
            const updatedMuteData = await muteCommand.findOne({ Guild: i.guild.id });
            const updatedStealData = await stealCommand.findOne({ Guild: i.guild.id });
            const updatedClearData = await clearCommand.findOne({ Guild: i.guild.id });
            const updatedUnbanData = await unbanCommand.findOne({ Guild: i.guild.id });
            const updatedUnmuteData = await unmuteCommand.findOne({ Guild: i.guild.id });
      
            let ban = "";
            if (!updatedBanData || !updatedBanData.enabled) ban = "🔴";
            else ban = "🟢";
      
            let mute = "";
            if (!updatedMuteData || !updatedMuteData.enabled) mute = "🔴";
            else mute = "🟢";
      
            let steal = "";
            if (!updatedStealData || !updatedStealData.enabled) steal = "🔴";
            else steal = "🟢";
      
            let clear = "";
            if (!updatedClearData || !updatedClearData.enabled) clear = "🔴";
            else clear = "🟢";
      
            let unban = "";
            if (!updatedUnbanData || !updatedUnbanData.enabled) unban = "🔴";
            else unban = "🟢";
      
            let unmute = "";
            if (!updatedUnmuteData || !updatedUnmuteData.enabled) unmute = "🔴";
            else unmute = "🟢";
      
            const configEmbed = new EmbedBuilder()
            .setColor('DarkGrey')
            .setTitle('Configure Moderation')
            .setDescription(`Use the buttons below to enable or disable each command.`)
            .addFields(
                { name: 'Note', value: 'Only members with administrator permissions will be able to interact with these buttons.' },
                { name: 'Commands', value: `- ${ban} Ban\n- ${mute} Mute\n- ${steal} Steal\n- ${clear} Clear\n- ${unban} Unban\n- ${unmute} Unmute` }
            );
      
            await message.edit({ embeds: [configEmbed]});
      
            if (banData.enabled) {
              const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`You successfully turned **on** the Unban command.`);
              await i.reply({ embeds: [embed], ephemeral: true });
              
            } else {
              const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`You successfully turned **off** the Unban command.`);
              await i.reply({ embeds: [embed], ephemeral: true });
      
            }
        } 
 
        if (i.customId === 'unmutebutton') {
            if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({
                embeds: [membermissing],
                ephemeral: true
            })
            let banData = await unmuteCommand.findOne({ Guild: i.guild.id });
            if (!banData) {
              banData = await unmuteCommand.create({ Guild: i.guild.id, enabled: true });
            } else {
              banData.enabled = !banData.enabled;
              await banData.save();
            }
      
      
            const updatedBanData = await banCommand.findOne({ Guild: i.guild.id });
            const updatedMuteData = await muteCommand.findOne({ Guild: i.guild.id });
            const updatedStealData = await stealCommand.findOne({ Guild: i.guild.id });
            const updatedClearData = await clearCommand.findOne({ Guild: i.guild.id });
            const updatedUnbanData = await unbanCommand.findOne({ Guild: i.guild.id });
            const updatedUnmuteData = await unmuteCommand.findOne({ Guild: i.guild.id });
      
            let ban = "";
            if (!updatedBanData || !updatedBanData.enabled) ban = "🔴";
            else ban = "🟢";
      
            let mute = "";
            if (!updatedMuteData || !updatedMuteData.enabled) mute = "🔴";
            else mute = "🟢";
      
            let steal = "";
            if (!updatedStealData || !updatedStealData.enabled) steal = "🔴";
            else steal = "🟢";
      
            let clear = "";
            if (!updatedClearData || !updatedClearData.enabled) clear = "🔴";
            else clear = "🟢";
      
            let unban = "";
            if (!updatedUnbanData || !updatedUnbanData.enabled) unban = "🔴";
            else unban = "🟢";
      
            let unmute = "";
            if (!updatedUnmuteData || !updatedUnmuteData.enabled) unmute = "🔴";
            else unmute = "🟢";
      
            const configEmbed = new EmbedBuilder()
            .setColor('DarkGrey')
            .setTitle('Configure Moderation')
            .setDescription(`Use the buttons below to enable or disable each command.`)
            .addFields(
                { name: 'Note', value: 'Only members with administrator permissions will be able to interact with these buttons.' },
                { name: 'Commands', value: `- ${ban} Ban\n- ${mute} Mute\n- ${steal} Steal\n- ${clear} Clear\n- ${unban} Unban\n- ${unmute} Unmute` }
            );
      
            await message.edit({ embeds: [configEmbed]});
      
            if (banData.enabled) {
              const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`You successfully turned **on** the Unmute command.`);
              await i.reply({ embeds: [embed], ephemeral: true });
              
            } else {
              const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`You successfully turned **off** the Unmute command.`);
              await i.reply({ embeds: [embed], ephemeral: true });
      
            }
        } 
 
        if (i.customId === 'reloadbutton') {
            if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({
                embeds: [membermissing],
                ephemeral: true
            })
      
            const updatedBanData = await banCommand.findOne({ Guild: i.guild.id });
            const updatedMuteData = await muteCommand.findOne({ Guild: i.guild.id });
            const updatedStealData = await stealCommand.findOne({ Guild: i.guild.id });
            const updatedClearData = await clearCommand.findOne({ Guild: i.guild.id });
            const updatedUnbanData = await unbanCommand.findOne({ Guild: i.guild.id });
            const updatedUnmuteData = await unmuteCommand.findOne({ Guild: i.guild.id });
      
            let ban = "";
            if (!updatedBanData || !updatedBanData.enabled) ban = "🔴";
            else ban = "🟢";
      
            let mute = "";
            if (!updatedMuteData || !updatedMuteData.enabled) mute = "🔴";
            else mute = "🟢";
      
            let steal = "";
            if (!updatedStealData || !updatedStealData.enabled) steal = "🔴";
            else steal = "🟢";
      
            let clear = "";
            if (!updatedClearData || !updatedClearData.enabled) clear = "🔴";
            else clear = "🟢";
      
            let unban = "";
            if (!updatedUnbanData || !updatedUnbanData.enabled) unban = "🔴";
            else unban = "🟢";
      
            let unmute = "";
            if (!updatedUnmuteData || !updatedUnmuteData.enabled) unmute = "🔴";
            else unmute = "🟢";
      
            const configEmbed = new EmbedBuilder()
            .setColor('DarkGrey')
            .setTitle('Configure Moderation')
            .setDescription(`Use the buttons below to enable or disable each command.`)
            .addFields(
                { name: 'Note', value: 'Only members with administrator permissions will be able to interact with these buttons.' },
                { name: 'Commands', value: `- ${ban} Ban\n- ${mute} Mute\n- ${steal} Steal\n- ${clear} Clear\n- ${unban} Unban\n- ${unmute} Unmute` }
            );
      
            await message.edit({ embeds: [configEmbed]});
 
            const reloadEmbed = new EmbedBuilder()
              .setColor('Green')
              .setTitle('Configuration Reloaded')
              .setDescription(`You successfully reloaded all commands to update the display.`)
 
            await i.reply({ embeds: [reloadEmbed], ephemeral: true })
          }
        })
 
 
    }
}