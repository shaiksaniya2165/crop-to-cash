const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userNameTE: String,
  village: { type: String, default: '' },
  villageTE: { type: String, default: '' },
  text: String,
  textEN: String,
  textTE: String,
  isAutoReply: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  village: String,
  title: String,
  titleEN: String,
  titleTE: String,
  content: String,
  contentEN: String,
  contentTE: String,
  category: { type: String, enum: ['pest', 'disease', 'weather', 'market', 'general'], default: 'general' },
  likes: { type: Number, default: 0 },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
