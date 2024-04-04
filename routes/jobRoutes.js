const express = require('express');
const jobController = require('../controllers/jobController');
const authController = require('../controllers/authController');
const router = express.Router();

router
  .route('/job')
  .get(authController.protect, jobController.getAllJobs)
  .post(
    authController.protect,
    authController.restrictTo('hr'),
    jobController.createJob
  );

router
  .route('/job/:id')
  .get(authController.protect, jobController.getOneJob)
  .patch(
    authController.protect,
    authController.restrictTo('hr', 'admin'),
    jobController.updateJob
  )
  .delete(
    authController.protect,
    authController.restrictTo('hr', 'admin'),
    jobController.deleteJob
  );

module.exports = router;
