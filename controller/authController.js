/* eslint-disable arrow-body-style */
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
    confirmPassword: req.body.confirmPassword,
  });

  const token = generateToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(400, 'Please provide id and password !'));
  }

  const user = await User.findOne({ email }).select('+password');
  const correct = user && (await user.correctPassword(password, user.password));

  if (!user || !correct) {
    return next(new AppError(401, 'Incorrect Email or Password'));
  }
  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
