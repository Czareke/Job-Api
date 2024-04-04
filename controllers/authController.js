const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
// creating user
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  const token = signToken(newUser._id);
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

  // checking if password and mail exist
  if (!email || !password) {
    return next(new AppError('Please provide a valid Email or password'));
  }

  // check is both are correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or Password'));
  }

  // if all is cleared token is sent to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  // token is gotten and checked
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  if (!token) {
    return next(
      new AppError('You are not logged in,Kindly proceed to do so', 401)
    );
  }
  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('User Token does not exist', 400));
  }
  // check if user has changed password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User changed password After Token was issued,Proceed to Log in Again',
        401
      )
    );
  }
  // if user passed all Authorization,grant access to protected routes
  req.user = freshUser;
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles hr,admin,user
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have Permission to perform this actions', 403)
      );
      next();
    }
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // check db for matching Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('there is no Email that matches this in the database',404)
    );
  }
  // generates random reset token
  const resetToken = user.createPasswordResetToken();
  try {
    await user.save({ validateBeforeSave: false });
    // email is sent to user here
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/user/resetPassword/${resetToken}`;
    const message = `Forgot password??SUbmit a patch request with your new password and passwordConfirm
  to :${resetURL}.\n if you did'nt forget your password kindly ignore this message`;
    console.log(message);
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token is here(only valid for 10 mins) ',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token has been sent to the email above',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an Error sending Email'));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // user token is gotten and hashed
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,//get user based hashed token
    passwordResetExpires: { $gt: Date.now() },//ensures token hasn't expired
  });

  // if token has or not expired
  if(!user){
    return next(new AppError('Token Has Expired',404))
  }
  // update user with password
  user.password=req.body.password
  user.passwordConfirm=req.body.passwordConfirm
  user.passwordResetToken = undefined;//clears rest token after use
  user.passwordResetExpires = undefined;//clears reset after expiration

  //new password is updated
  await user.save()
  //generate new jwt and send res
  const token =signToken(user._id)

  res.status(200).json({
    status:'success',
    token,
  })
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get the user with password field
  const user = await User.findById(req.user.id).select("+password"); // Include password field

  // 2. Check if current password matches
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Invalid current password", 401));
  }

  // 3. Update password with new information
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save(); // Save updated user information

  // 4. Generate new JWT and send success response
  const token = signToken(user._id); // Generate a new JWT for the user

  res.status(200).json({
    status: "success",
    token,
  });
});


