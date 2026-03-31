const User = require('../model/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const multer = require('multer')
const sharp = require('sharp')
const { Readable } = require('stream')
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
exports.uploadProfilePhoto = upload.single('profilePhoto')

exports.uploadToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) return next()

  const bufferStream = Readable.from(req.file.buffer)

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'profilePhotos' },
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
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize({
      width: 250,
      height: 250,
      fit: sharp.fit.outside,
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer()

  next()
})

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]
    }
  })
  return newObj
}
// admin functionalities
exports.getAllUser = catchAsync(async (req, res) => {
  const users = await User.find().select('-__v')
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  })
})

exports.getUser = catchAsync(async (req, res, next) => {
  const user = req.user
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = req.user
  await User.findOneAndDelete(user)

  res.status(200).json({
    status: 'success',
    data: null,
  })
})

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError(400, 'This route is not for updating password.'))
  }
  const user = req.user
  if (req.body.name) {
    user.name = req.body.name
  }

  if (req.file && req.file.cloudinaryUrl) {
    user.profilePhoto = req.file.cloudinaryUrl
  }

  await user.save({ validateBeforeSave: false })
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  })
})
