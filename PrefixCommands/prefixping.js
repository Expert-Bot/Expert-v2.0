module.exports = {
  name: 'preifxping',
  description: 'Ping!',
  execute(message, args) {
    message.channel.send('Pong!');
  },
};
