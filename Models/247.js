const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  is247Enabled: {
    type: Boolean,
    required: true,
  },
  lastVoiceChannelId: {
    type: String,
    default: null,
  },
  checkInterval: {
    type: Number,
    default: null,
  },
});

module.exports = mongoose.model('Settings', settingsSchema);
