const Post = require('../model/postModel');
const APIfeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllPosts = catchAsync(async (req, res) => {
  const features = new APIfeatures(Post.find(), req.query).sort();
  const posts = await features.query;
  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError(404, 'No post found with given id'));
  }
  res.status(200).json({
    status: 'success',
    data: {
      posts: post,
    },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create({
    location: req.body.location,
    date: req.body.date,
    image: req.body.image,
    caption: req.body.caption,
    liked: req.body.liked,
  });
  res.status(200).json({
    status: 'success',
    data: {
      post: newPost,
    },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    return next(new AppError(404, 'No post found with given id'));
  }
  res.status(200).json({
    status: 'success',
    data: {
      posts: post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    return next(new AppError(404, 'No post found with given id'));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
