const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, 'location is required'],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now(),
    required: [true, 'date is required'],
  },
  image: { type: String, required: [true, 'image is required'] },
  caption: { type: String, default: 'No caption', trim: true },
  liked: { type: Boolean, default: false },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
