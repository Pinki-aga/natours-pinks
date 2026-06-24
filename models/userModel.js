const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name']
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid Email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Enter Confirm password'],
    validate: {
      // This works only on save or create but not update
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match.'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return; // ✅ just return, no next()

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  // ✅ async function resolving = Mongoose continues automatically
});

userSchema.pre('save', async function() {
  // ✅ This one is NOT async, so next() works fine here
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre(/^find/, function() {
  this.where({ active: { $ne: false } });
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function(jwtTimeStamp) {
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt, jwtTimeStamp);
    const changedPasswordTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // True means password is changed after token issued
    return jwtTimeStamp < changedPasswordTime;
  }
  // false means password is not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  //encrypt the resetToken tp save in DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
