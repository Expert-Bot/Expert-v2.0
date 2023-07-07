const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
    Events,
    EmbedBuilder,
    permissions,
    voiceschemas,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    commands
} = require("discord.js");
const Discord = ('discord.js')
const { DisTube } = require("distube");
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { handleLogs } = require('./Handlers/handleLogs');
const { handler } = require('./Handlers/handler');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const logs = require('discord-logs');
const Topgg = require('@top-gg/sdk');
const axios = require('axios');
const readdirSync = require('fs');
const banschema = require('./Schemas/ban.js')

const topggAPI = new Topgg.Api('Stats For Top.gg');
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const { loadModals } = require("./Handlers/modalHandler");
const { loadButtons } = require("./Handlers/buttonHandler");
const { LoadErrorHandler } = require("./Handlers/ErrorHandler");
const { loadComponents } = require('./Handlers/ComponentsHandler');
const { OpenAIApi, Configuration } = require("openai");
const { CaptchaGenerator } = require('captcha-canvas');

const client = new Client({
  intents: [Object.keys(GatewayIntentBits)],
  partials: [Object.keys(Partials)],
});
///logs roles//



//end//
setInterval(async () => {
 
    const bans = await banschema.find();
    if(!bans) return;
    else {
        bans.forEach(async ban => {
 
            if (ban.Time > Date.now()) return;
 
            let server = await client.guilds.cache.get(ban.Guild);
            if (!server) {
                console.log('no server')
                return await banschema.deleteMany({
                    Guild: server.id
                });
 
            }
 
            await server.bans.fetch().then(async bans => {
 
                if (bans.size === 0) {
                    console.log('bans were 0')
 
                    return await banschema.deleteMany({
                        Guild: server.id
                    });
 
 
 
                } else {
 
                    let user = client.users.cache.get(ban.User)
                    if (!user) {
                        console.log('no user found')
                        return await banschema.deleteMany({
                            User: ban.User,
                            Guild: server.id
                        });
                    }
 
                    await server.bans.remove(ban.User).catch(err => {
                        console.log('couldnt unban')
                        return;
                    })
 
                    await banschema.deleteMany({
                        User: ban.User,
                        Guild: server.id
                    });
 
                }
            })
        })
    }
 
}, 30000);
//chaannel status logs//
const channelId = 'Chat bot channel id';
//limei //
client.setMaxListeners(10000);
//end//
client.on('ready', () => {
  const channel = client.channels.cache.get(channelId);

  // Send a status message when the bot comes online
  channel.send('<a:check_yes:1082727401513046016> Expert is now online!');

  // Event handler for bot restarts
  const handleRestart = () => {
    channel.send('Expert has restarted!');
  };

  // Event handler for bot going offline
  const handleOffline = () => {
    channel.send('Expert is now offline!');
  };

  // Detect if the process is being restarted
  process.on('SIGINT', () => {
    handleRestart();
    process.exit();
  });

  process.on('SIGTERM', () => {
    handleRestart();
    process.exit();
  });

  // Detect if the bot loses its connection to Discord
  client.on('disconnect', () => {
    handleOffline();
    process.exit();
  });
});
//end///
//chat gpt//
const config = new Configuration({
    apiKey: 'chat gpt api for channel'
})

const openai = new OpenAIApi(config)
const BOT_CHANNEL = "your channel id"
const PAST_MESSAGES = 5
//247//
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'enable_247') {
    // Enable 24/7 logic
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: 'You must be in a voice channel to enable 24/7 mode.',
        ephemeral: true,
      });
    }

    // Join the voice channel and enable 24/7 mode
    // Your code here

    await interaction.reply({
      content: '24/7 mode has been enabled!',
      ephemeral: true,
    });
  }

  if (interaction.customId === 'disable_247') {
    // Disable 24/7 logic
    // Disconnect from the voice channel and disable 24/7 mode
    // Your code here

    await interaction.reply({
      content: '24/7 mode has been disabled!',
      ephemeral: true,
    });
  }
});

//end//
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return
    if (message.channel.id !== BOT_CHANNEL) return

    message.channel.sendTyping()

    let messages = Array.from(await message.channel.messages.fetch({
        limit: PAST_MESSAGES,
        before: message.id
    }))
    messages = messages.map(m=>m[1])
    messages.unshift(message)

    let users = [...new Set([...messages.map(m=> m.author.username), client.user.username])]

    let lastUser = users.pop()

    let prompt = `The following is a conversation between ${users.join(", ")}, and ${lastUser}. \n\n`

    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i]
        prompt += `${m.author.username}: ${m.content}\n`
    }
    prompt += `${client.user.username}:`
    console.log("prompt:")

    const response = await openai.createCompletion({
        prompt,
        model: "text-davinci-003",
        max_tokens: 500,
        stop: ["\n"]
    })

    const ResponseMessagesTable = {
        Response: response.data.choices[0].text
    }
    console.table(ResponseMessagesTable)
    await message.reply(response.data.choices[0].text)
});
//verify systemm start//


const capschema = require('./Schemas/verify');
const verifyusers = require('./Schemas/verifyusers');
 
client.on(Events.InteractionCreate, async interaction => {
 
    if (interaction.guild === null) return;
 
    const verifydata = await capschema.findOne({ Guild: interaction.guild.id });
    const verifyusersdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
 
    if (interaction.customId === 'verify') {
 
        if (!verifydata) return await interaction.reply({ content: `The **verification system** has been disabled in this server!`, ephemeral: true});
 
        if (verifydata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: 'You have **already** been verified!', ephemeral: true})
        else {
 
            let letter = ['0','1','2','3','4','5','6','7','8','9','a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','I','j','J','f','F','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','w','W','x','X','y','Y','z','Z',]
            let result = Math.floor(Math.random() * letter.length);
            let result2 = Math.floor(Math.random() * letter.length);
            let result3 = Math.floor(Math.random() * letter.length);
            let result4 = Math.floor(Math.random() * letter.length);
            let result5 = Math.floor(Math.random() * letter.length);
 
            const cap = letter[result] + letter[result2] + letter[result3] + letter[result4] + letter[result5];
            console.log(cap)
 
            const captcha = new CaptchaGenerator()
            .setDimension(150, 450)
            .setCaptcha({ text: `${cap}`, size: 60, color: "red"})
            .setDecoy({ opacity: 0.5 })
            .setTrace({ color: "red" })
 
            const buffer = captcha.generateSync();
 
            const verifyattachment = new AttachmentBuilder(buffer, { name: `captcha.png`});
 
            const verifyembed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: `✅ Verification Proccess`})
            .setFooter({ text: `✅ Verification Captcha`})
            .setTimestamp()
            .setImage('attachment://captcha.png')
            .setThumbnail('https://images-ext-2.discordapp.net/external/onEO9D9OUhbAlUwHEufMANlozh8GfT2cJAAbyfMF0kE/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/1023810715250860105/388e4d2421ca6223424895dce4003e2c.png?width=656&height=656')
            .setTitle('> Verification Step: Captcha')
            .addFields({ name: `• Verify`, value: '> Please use the button bellow to \n> submit your captcha!'})
 
            const verifybutton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('✅ Enter Captcha')
                .setStyle(ButtonStyle.Success)
                .setCustomId('captchaenter')
            )
 
            const vermodal = new ModalBuilder()
            .setTitle('Verification')
            .setCustomId('vermodal')
 
            const answer = new TextInputBuilder()
            .setCustomId('answer')
            .setRequired(true)
            .setLabel('• Please sumbit your Captcha code')
            .setPlaceholder('Your captcha code')
            .setStyle(TextInputStyle.Short)
 
            const vermodalrow = new ActionRowBuilder().addComponents(answer);
            vermodal.addComponents(vermodalrow);
 
            const vermsg = await interaction.reply({ embeds: [verifyembed], components: [verifybutton], ephemeral: true, files: [verifyattachment] });
 
            const vercollector = vermsg.createMessageComponentCollector();
 
            vercollector.on('collect', async i => {
 
                if (i.customId === 'captchaenter') {
                    i.showModal(vermodal);
                }
 
            })
 
            if (verifyusersdata) {
 
                await verifyusers.deleteMany({
                    Guild: interaction.guild.id,
                    User: interaction.user.id
                })
 
                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })
 
            } else {
 
                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })
 
            }
        } 
    }
});
 
client.on(Events.InteractionCreate, async interaction => {
 
    if (!interaction.isModalSubmit()) return;
 
    if (interaction.customId === 'vermodal') {
 
        const userverdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        const verificationdata = await capschema.findOne({ Guild: interaction.guild.id });
 
        if (verificationdata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: `You have **already** verified within this server!`, ephemeral: true});
 
        const modalanswer = interaction.fields.getTextInputValue('answer');
        if (modalanswer === userverdata.Key) {
 
            const verrole = await interaction.guild.roles.cache.get(verificationdata.Role);
 
            try {
                await interaction.member.roles.add(verrole);
            } catch (err) {
                return await interaction.reply({ content: `There was an **issue** giving you the **<@&${verificationdata.Role}>** role, try again later!`, ephemeral: true})
            }
 
            await interaction.reply({ content: 'You have been **verified!**', ephemeral: true});
            await capschema.updateOne({ Guild: interaction.guild.id }, { $push: { Verified: interaction.user.id }});
 
        } else {
            await interaction.reply({ content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`, ephemeral: true})
        }
    }
});
//verify system end//


//top.gg stats//
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  postBotStats();
});

async function postBotStats() {
  try {
    await topggAPI.postStats({
      serverCount: client.guilds.cache.size,
      shardId: client.shard?.ids[0] || 0, // If sharding, use the first shard ID
      shardCount: client.shard?.count || 1, // If sharding, use the total shard count
    });
    console.log('Successfully posted bot stats to top.gg');
  } catch (error) {
    console.error('Failed to post bot stats to top.gg:', error);
  }
};
//end//
//boton//
//noprefix//
// Load the no-prefix commands
client.noprefixcommands = new Collection();
const noprefixCommandFiles = fs.readdirSync('./noprefixcommands').filter(file => file.endsWith('.js'));
for (const file of noprefixCommandFiles) {
  const command = require(`./noprefixcommands/${file}`);
  client.noprefixcommands.set(command.name, command);
}
// ... Rest of your code ...

// Message event handler
client.on('messageCreate', async (message) => {
  // Ignore messages from bots and non-text channels
  if (message.author.bot || !message.guild) return;

  // Check if the message content matches any of the no-prefix command names
  const commandName = message.content.toLowerCase();
  if (client.noprefixcommands.has(commandName)) {
    const command = client.noprefixcommands.get(commandName);
    try {
      // Execute the command
      command.execute(client, message);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while executing the command.');
    }
  }
});
//end
///leveling-system//
const levelSchema = require('./Schemas/level');
const levelschema = require('./Schemas/levelsetup');

client.on(Events.MessageCreate, async (message, err) => {

    const { guild, author } = message;
    if (message.guild === null) return;
    const leveldata = await levelschema.findOne({ Guild: message.guild.id });

    if (!leveldata || leveldata.Disabled === 'disabled') return;
    let multiplier = 1;
    
    multiplier = Math.floor(leveldata.Multi);
    

    if (!guild || author.bot) return;

    levelSchema.findOne({ Guild: guild.id, User: author.id}, async (err, data) => {

        if (err) throw err;

        if (!data) {
            levelSchema.create({
                Guild: guild.id,
                User: author.id,
                XP: 0,
                Level: 0
            })
        }
    })

    const channel = message.channel;

    const give = 1;

    const data = await levelSchema.findOne({ Guild: guild.id, User: author.id});

    if (!data) return;

    const requiredXP = data.Level * data.Level * 20 + 20;

    if (data.XP + give >= requiredXP) {

        data.XP += give;
        data.Level += 1;
        await data.save();
        
        if (!channel) return;

        const levelembed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle(`> ${author.username} has Leveled Up!`)
        .setFooter({ text: `⬆ ${author.username} Leveled Up`})
        .setTimestamp()
        .setThumbnail('https://images-ext-2.discordapp.net/external/onEO9D9OUhbAlUwHEufMANlozh8GfT2cJAAbyfMF0kE/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/1023810715250860105/388e4d2421ca6223424895dce4003e2c.png?width=656&height=656')
        .addFields({ name: `• New Level Unlocked 🎉`, value: `> ${author.username} is now level **${data.Level}**!`})
        .setAuthor({ name: `⬆ Level Playground`})

        await message.channel.send({ embeds: [levelembed] }).catch(err => console.log('Error sending level up message!'));
    } else {

        if(message.member.roles.cache.find(r => r.id === leveldata.Role)) {
            data.XP += give * multiplier;
        } data.XP += give;
        data.save();
    }
})
//guess//
client.on(Events.MessageCreate, async (message) => {

 

if(message.author.bot) return;

 

const Schema = require('./Schemas/guess');

 

const data = await Schema.findOne({channelId: message.channel.id});

 

if(!data) return;

 

if(data) {

 

if(message.content === `${data.number}`) {

    message.react(`✅`);

    message.reply(`Wow! That was the right number! 🥳`);

    message.pin();

 

    await data.delete();

    message.channel.send(`Successfully delted number, use \`/guess enable\` to get a new number!`)

} 

 

 

if(message.content !== `${data.number}`) return message.react(`❌`)

 

}

 

});
//error logs//
const errorChannel = '1101154384492113930';

client.on('error', (error) => {
  console.error('An error occurred:', error);
  try {
    const channel = client.channels.cache.get(errorChannel);
    channel.send(`An error occurred: \`\`\`${error}\`\`\``);
  } catch (error) {
    console.error('Failed to send error message:', error);
  }
});
//224/7 handler//
client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.member.id === client.user.id && !newState.channelId) {
    const guildId = oldState.guild.id;
    const musicData = {}; // Replace with your actual music data storage object
    const dataOptions = musicData[guildId] || { enable: false, channel: null };

    if (dataOptions.enable && dataOptions.channel === oldState.channelId) {
      try {
        joinVoiceChannel({
          channelId: oldState.channelId,
          guildId: guildId,
          adapterCreator: oldState.guild.voiceAdapterCreator,
        });
      } catch (error) {
        console.error('Error rejoining voice channel:', error);
      }
    }
  }
});
//server joined//
client.on('guildCreate', async (guild) => {
    const channel = await client.channels.cache.get('guild join channel id');
    const name = guild.name;
    const memberCount = guild.memberCount;
    const owner = guild.ownerId;

    const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("New server joined")
        .addFields({ name: 'Server Name', value: `> ${name}` })
        .addFields({ name: 'Server Member Count', value: `> ${memberCount}` })
        .addFields({ name: 'Server Owner', value: `> ${owner}` })
        .addFields({ name: 'Server Age', value: `> <t:${Math.floor(guild.createdTimestamp / 1000)}:R>` })
        .setTimestamp();
    
    await channel.send({ embeds: [embed] });
});
///guild leave//
client.on('guildDelete', async (guild) => {
    const channel = await client.channels.cache.get('GUild del kogs channel id');
    const name = guild.name;
    const memberCount = guild.memberCount;
    const owner = guild.ownerId;

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Server left")
        .addFields({ name: 'Server Name', value: `> ${name}` })
        .addFields({ name: 'Server Member Count', value: `> ${memberCount}` })
        .addFields({ name: 'Server Owner', value: `> ${owner}` })
        .setTimestamp();
    
    await channel.send({ embeds: [embed] });
});


//commands logs//
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.inGuild()) return;
    if (!interaction.isCommand()) return;
    const channel = await client.channels.cache.get('commands logs channel id where you get the commands logs ');
    const server = interaction.guild.name;
    const user = interaction.user.username;
    const userID = interaction.user.id;

const embed = new EmbedBuilder()
.setColor("Green")
.setTitle('🌐 chat command used')
.addFields({ name: 'server name', value: `${server}`})
.addFields({ name: 'chat command', value: `${interaction}`})
.addFields({ name: 'Command user', value: `${user} / ${userID}`})
.setTimestamp()
.setFooter({ text: 'chat command used' }); // pass an object with a `text` property

    await channel.send({ embeds: [embed] });
});
//nodejs-events
process.on("unhandledRejection", e => {
  console.log(e)
})
process.on("uncaughtException", e => {
  console.log(e)
})
process.on("uncaughtExceptionMonitor", e => {
  console.log(e)
})
//
client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnFinish: false,// you can change this to your needs
  emitAddSongWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin()]
});
client.config = require("./config.json");
logs(client, {
  debug: true,
});
client.giveawayConfig = require("./config.js");
client.commands = new Collection();
client.subCommands = new Collection(); //sub commands
client.modals = new Collection();
client.buttons = new Collection();
client.errors = new Collection();
client.voiceGenerator = new Collection();

['giveawaysEventsHandler', 'giveawaysManager'].forEach((x) => {
  require(`./Utils/${x}`)(client);
})

module.exports = client;

client.login(client.config.token).then(() => {
  loadEvents(client);
  loadCommands(client);
  handleLogs(client);

});
