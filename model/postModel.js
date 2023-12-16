const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  location: { type: String, required: [true, 'location is required'] },
  date: { type: String, required: [true, 'date is required'] },
  image: { type: String, required: [true, 'image is required'] },
  caption: { type: String, default: 'No caption' },
  liked: { type: Boolean, default: false },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
