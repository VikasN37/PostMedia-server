const Post = require('../model/postModel')
const APIfeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../model/userModel')
const { Readable } = require('stream')

const multer = require('multer')
const sharp = require('sharp')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: 'dbxn0bwcn',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

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

// Middleware to upload to Cloudinary
exports.uploadToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) return next() // Skip if no file

  const bufferStream = Readable.from(req.file.buffer)

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'postPhotos' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    bufferStream.pipe(uploadStream)
  })

  req.file.cloudinaryUrl = result.secure_url // Attach Cloudinary URL to req.file
  next()
})

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next()
  }

  req.file.filename = `post-${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize({
      width: 600,
      height: 650,
      fit: sharp.fit.fill,
    })
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toBuffer()

  next()
})

exports.getPosts = catchAsync(async (req, res, next) => {
  let { posts } = req.user

  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  })
})

exports.createPost = catchAsync(async (req, res, next) => {
  const user = req.user

  const filteredBody = {
    location: req.body.location,
    caption: req.body.caption,
  }

  if (req.file && req.file.cloudinaryUrl) {
    filteredBody.image = req.file.cloudinaryUrl
  }

  const newPost = await Post.create(filteredBody)
  user.posts.unshift(newPost)
  user.totalPosts = user.totalPosts + 1
  await user.save({ validateBeforeSave: false })

  res.status(201).json({
    status: 'success',
    data: {
      post: newPost,
    },
  })
})

exports.updatePost = catchAsync(async (req, res, next) => {
  const user = req.user
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!post) {
    return next(new AppError(404, 'No post found with given id'))
  }
  if (req.body.liked === false) {
    user.likedPosts = user.likedPosts - 1
  } else if (req.body.liked === true) {
    user.likedPosts = user.likedPosts + 1
  }

  await user.save({ validateBeforeSave: false })
  res.status(200).json({
    status: 'success',
    data: {
      // posts: post,
    },
  })
})

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id)
  if (!post) {
    return next(new AppError(404, 'No post found with given id'))
  }
  const user = req.user

  if (post.liked === true) {
    user.likedPosts = user.likedPosts - 1
  }
  const updatedPosts = user.posts.filter(
    (el) => el._id.toString() !== post._id.toString()
  )

  user.posts = updatedPosts
  user.totalPosts = user.totalPosts - 1

  await user.save({ validateBeforeSave: false })
  res.status(204).json({
    status: 'success',
    data: null,
  })
})
