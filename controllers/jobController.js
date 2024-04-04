const jobApi = require('../models/jobModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
exports.getAllJobs = catchAsync(async (req, res, next) => {
  const jobs = await jobApi.find(); //waits to bring out all the jobs from the db
  res.status(200).json({
    //res to user
    status: 'success',
    results: jobs.length,
    data: {
      jobs,
    },
  });
});
exports.getOneJob = catchAsync(async (req, res, next) => {
  // not sure what is being used to find Job,if its either comp or position
  //   ask light why i didn't do so in wiki for creating user
  const jobs = await jobApi.findById({ title: req.params.id.title });
  if (!jobs) {
    return next(AppError('No Job that matches this position found', 400));
  }
  res.status(200).json({
    status: 'success',
    data: {
      jobs,
    },
  });
});
exports.createJob = catchAsync(async (req, res, next) => {
  // not sure of this due to it being commented in lights code
  const { companyName, position, status } = req.body;
  //   if (!companyName || !position || !status) {
  //     return next(new AppError('Missing required fields', 400));
  //   }
  const newJob = await jobApi.create({ companyName, position, status });
  res.status(201).json({
    status: 'success',
    data: {
      jobs: newJob,
    },
  });
});
exports.updateJob = catchAsync(async (req, res, next) => {
  // update job prev created by Hr and admin
  const jobs = await jobApi.findByIdAndUpdate(req.params.id, res.body, {
    new: true,
    runValidators: true, //validators ran
  });
  if (!jobs) {
    return next(new AppError('No Job id Matches', 400));
  }
  res.status(200).json({
    status: 'success',
  });
});
exports.deleteJob = catchAsync(async (req, res, next) => {
  // Delete jobs,Only admin so it should be res
  const jobs = await jobApi.findByIdAndDelete(req.params.id, res.body, {
    new: true,
    runValidators: true,
  });
  if (!jobs) {
    return next(new AppError('No Job That Matches this Id', 400));
  }
  res.status(200).json({
    status: 'success',
    data: null,
    message: 'Job Deleted ',
  });
});
