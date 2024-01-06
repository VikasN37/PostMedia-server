const Post = require('../model/postModel')
const APIfeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../model/userModel')

exports.getAllPosts = catchAsync(async (req, res) => {
  const features = new APIfeatures(Post.find(), req.query).sort()
  const posts = await features.query
  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  })
})

exports.getPosts = catchAsync(async (req, res, next) => {
  const { posts } = req.user
  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  })
})

exports.createPost = catchAsync(async (req, res, next) => {
  const user = req.user
  const newPost = await Post.create({
    location: req.body.location,
    date: req.body.date,
    image: req.body.image,
    caption: req.body.caption,
    liked: req.body.liked,
  })
  user.posts.unshift(newPost)
  await user.save({ validateBeforeSave: false })

  res.status(201).json({
    status: 'success',
    data: {
      post: newPost,
    },
  })
})

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!post) {
    return next(new AppError(404, 'No post found with given id'))
  }
  res.status(200).json({
    status: 'success',
    data: {
      posts: post,
    },
  })
})

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id)
  if (!post) {
    return next(new AppError(404, 'No post found with given id'))
  }
  const user = req.user

  const updatedPosts = user.posts.filter(
    (el) => el._id.toString() !== post._id.toString()
  )

  user.posts = updatedPosts

  await user.save({ validateBeforeSave: false })
  res.status(204).json({
    status: 'success',
    data: null,
  })
})
