/* eslint-disable func-names */
const mongoose = require('mongoose')
const crypto = require('crypto')
const validator = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password should have minimum 8 characters'],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Confirmation of password is required'],
      validate: {
        // eslint-disable-next-line func-names, object-shorthand
        validator: function (elm) {
          return elm === this.password
        },
      },
      message: 'Password do not match',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      unique: [true, 'Username should be unique'],
    },

    profilePhoto: {
      type: String,
      default:
        'https://i.pinimg.com/originals/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg',
    },

    passwordChangedAt: {
      type: Date,
      default: Date.now(),
    },
    passwordResetToken: { type: String },
    passwordResetExpires: Date,

    verificationToken: {
      type: String,
      select: false,
    },
    posts: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)

  this.confirmPassword = undefined
  next()
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next()

  this.passwordChangedAt = Date.now() - 1000
  next()
})

// populating every posts that uses find
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'posts',
    select: '-__v',
  })
  next()
})

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  const compareResult = await bcrypt.compare(candidatePassword, userPassword)
  return compareResult
}
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // checking if the password changed after assigning JWT
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changedTimestamp
  }
  return false
}
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}
const User = mongoose.model('User', userSchema)

module.exports = User
