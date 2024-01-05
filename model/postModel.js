const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  location: {
    type: String,
    default: 'No Location',
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  image: { type: String, required: [true, 'image is required'] },
  caption: { type: String, default: 'No caption', trim: true },
  liked: { type: Boolean, default: false },
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
