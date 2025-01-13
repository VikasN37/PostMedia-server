/* eslint-disable prefer-destructuring */
/* eslint-disable arrow-body-style */
const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Email = require('../utils/email')
const mongoose = require('mongoose')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  })
}

const createSendToken = async (statusCode, id, res) => {
  const token = generateToken(id)

  const jwtHashToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findByIdAndUpdate(id, {
    verificationToken: jwtHashToken,
  })
  res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      user,
    },
  })
}

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
    confirmPassword: req.body.confirmPassword,
  })

  await new Email(newUser).sendWelcome()

  createSendToken(201, newUser.id, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError(400, 'Please provide id and password !'))
  }

  const user = await User.findOne({ email }).select('+password')
  const correct = user && (await user.correctPassword(password, user.password))

  if (!user || !correct) {
    return next(new AppError(401, 'Incorrect Email or Password'))
  }

  createSendToken(200, user._id, res)
})

exports.protect = catchAsync(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    next(new AppError(401, 'You are not logged in. Please login to continue'))
  }
  const jwtHashToken = crypto.createHash('sha256').update(token).digest('hex')
  // validation of token

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  )
  const currUser = await User.findOne({
    _id: decodedToken.id,
    verificationToken: jwtHashToken,
  })

  if (!currUser) {
    return next(
      new AppError(
        401,
        'The user of this token no longer exists.Login in again'
      )
    )
  }
  if (currUser.changedPasswordAfter(token.iat)) {
    return next(
      new AppError(401, 'Recently password change detected. Please login again')
    )
  }
  req.user = currUser
  next()
})

exports.logout = catchAsync(async (req, res, next) => {
  const currUser = req.user
  currUser.verificationToken = undefined
  await currUser.save({ validateBeforeSave: false })

  res.status(204).json({
    status: 'success',
  })
})

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError(404, 'No user found with the given email'))
  }

  // generate random token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`

    await new Email(user, resetURL).sendPasswordReset()
    res.status(200).json({
      status: 'success',
      message: 'Token successfully sent to email',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    return next(
      new AppError(
        500,
        'Unable to send an email at this moment. Please try again later.'
      )
    )
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    return next(new AppError(400, 'Token invalid or expired. Please try again'))
  }
  // changing user's properties
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  user.passwordResetExpires = undefined
  await user.save()

  // updating passwordChangedProperty

  // sending login token
  createSendToken(200, user._id, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  const correct = await user.correctPassword(
    req.body.currentPassword,
    user.password
  )

  if (!correct) {
    return next(new AppError(401, 'Wrong password !'))
  }

  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  await user.save()

  createSendToken(201, user._id, res)
})
