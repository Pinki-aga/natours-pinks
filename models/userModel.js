const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

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
  passwordChangedAt: Date
});

userSchema.pre('save', async function() {
  // this works only when password is actually modiefied
  // Asyns and await because it is blocking code and to make it asynchromous we use aysnc and await
  if (!this.isModified) return;

  //Hash the passowrd at the cost of 12 (CPU computation to make it strong pwd)
  this.password = await bcrypt.hash(this.password, 12);
  //after encrypting delete the confirmPassword
  this.passwordConfirm = undefined;
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
    // const passwordChangedAt = parseInt(this.passwordChangedAt.getTime() / 1000)
  }
  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
