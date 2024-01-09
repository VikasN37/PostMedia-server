const Post = require('../model/postModel')
const APIfeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../model/userModel')

const multer = require('multer')
const sharp = require('sharp')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]
    }
  })
  return newObj
}

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError(400, 'Not an image, Upload only images !'))
  }
}
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})
exports.uploadPhoto = upload.single('image')

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next()
  }
  req.file.filename = `post-${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize({
      width: 500,
      height: 600,
      fit: sharp.fit.contain,
    })
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`postPhotos/${req.file.filename}`)

  next()
})

// exports.getAllPosts = catchAsync(async (req, res) => {
//   const features = new APIfeatures(Post.find(), req.query).sort()
//   const posts = await features.query
//   res.status(200).json({
//     status: 'success',
//     data: {
//       posts,
//     },
//   })
// })

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
    image: req.file.filename,
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
  const filteredBody = filterObj(req.body, 'location', 'caption', 'liked')

  const post = await Post.findByIdAndUpdate(req.params.id, filteredBody, {
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
