const User = require('../model/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const multer = require('multer')
// const sharp = require('sharp')
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'profilePhotos')
  },

  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1]
    cb(null, `user-${req.user.id}-${Date.now()}.${extension}`)
  },
})

// const multerStorage = multer.diskStorage()

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

exports.resizeImage = (req, res, next) => {
  if (!req.file) {
    return next()
  }
}

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
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new AppError(404, 'No user found with given id'))
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id)

  res.status(200).json({
    status: 'success',
    data: null,
  })
})

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError(400, 'This route is not for updating password.'))
  }

  const filteredBody = filterObj(req.body, 'name', 'email', 'username', 'posts')
  if (req.file) {
    filteredBody.profilePhoto = req.file.filename
  }
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})
