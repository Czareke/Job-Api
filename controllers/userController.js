const AppError = require('../utils/appError');
const User = require('../models/userModel');
const jobApi = require('../models/jobModel');
const catchAsync = require('../utils/catchAsync');
// To get All Users
exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  });
});
// To Get 1 User
exports.getOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No User Found That Matches This Id', 400));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// To create User
exports.createUser = async (req, res) => {
  res.send('User Created');
};
// Update a User
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    //validators from DB are Ran
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('No User Found By Id', 400));
  }
  res.status(200).json({
    status: 'success',
  });
});
// Delete A user
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('No User Found By Id', 400));
  }
  res.status(200).json({
    status: 'success',
    data: null,
    message: 'User has been deleted',
  });
});
