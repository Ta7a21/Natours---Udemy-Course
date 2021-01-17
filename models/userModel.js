const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//const { model } = require('./tourModel');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please enter your email'],
    lowercase: true,
    validate: [validator.isEmail, 'Not a valid email'],
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
    },
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [8, 'Too weak'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords don't match",
    },
    select: false,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: { type: String },
  passwordResetExpire: { type: Date },
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); //So that we don't change it every time the user updates his profile

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  return next();
});

userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

userSchema.methods.correctPass = async function (candidatePass, Pass) {
  return await bcrypt.compare(candidatePass, Pass);
};

userSchema.methods.changedPass = function (tokenDate) {
  if (this.passwordChangedAt) {
    const passMod = parseInt(this.passwordChangedAt.getTime() / 1000, 10); //10 for decimal
    return passMod > tokenDate;
  }
  return false;
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //random token
  //console.log(resetToken);

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); //hashing random token, save in DB
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
