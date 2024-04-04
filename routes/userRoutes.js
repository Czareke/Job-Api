const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);//ask light
router.use(authController.protect);
router
  .route('/user')
  .get(userController.getAllUser)
  .post(userController.createUser);
  router.use(authController.restrictTo("admin"));
router
  .route('/user/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
