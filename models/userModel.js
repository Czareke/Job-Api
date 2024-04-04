const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  // username is prompted
  userName: {
    type: String,
    required: [true, 'Enter a valid username'],
    minlength: 3,
    maxlength: 15,
  },
  //   email validators
  email: {
    type: String,
    required: [true, 'Enter a valid E-mail'],
    unique: true,
    // email validAtors
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  password: {
    type: String,
    required: [true, 'Enter Valid Password With Uppercase and Lowercase'],
    // Using match for regex validation. The message is provided for when the match fails.
    match: [
      /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and be at least 8 characters long.',
    ],
    select: false,
    minlength: 8,
    maxlength: 15,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm Password'],

    validator: function (el) {
      return el === this.password;
    },
    message: 'password does not match',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'hr'],
    default: 'user',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();

  // Hash password with a cost factor of 12 (higher = more secure, but slower)
  this.password = await bcrypt.hash(this.password, 12);

  // Remove confirmPassword field (optional security measure)
  this.passwordConfirm = undefined;

  next();
});
userSchema.pre('save', function (next) {
  // Only update timestamp if password is modified or creating new user
  if (!this.isModified('password') || this.isNew) return next();

  // Set passwordChangedAt to current time minus 1 second (ensures JWT is issued before update)
  this.passwordChangedAt = Date.now() - 1000;

  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // Compare provided password with hashed password using bcrypt
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // Log timestamps for debugging
    console.log(this.passwordChangedAt, JWTTimestamp);
    // Check if JWT timestamp is before password change
    return JWTTimestamp < changedTimestamp;
  }
  // Return false if no passwordChangedAt
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  // Generate a random 32-byte hex string as reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the reset token for secure storage
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // Log original and hashed tokens for debugging (optional)
  console.log({ resetToken }, this.passwordResetToken);

  // Set token expiration time to 10 minutes from now
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return the original (non-hashed) reset token
  return resetToken;
  userSchema.pre(/^/, function (Next) {
    // print current query
    this.find({ active: { $ne: false } });
    next();
  });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
