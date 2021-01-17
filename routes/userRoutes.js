const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const { use } = require('./reviewRoutes');
const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotpass').post(authController.forgotpass);
router.route('/resetpass/:token').patch(authController.resetpass);

router.use(authController.protect);
//All next routers will be protected

router.route('/updatepass').patch(authController.updatePassword);
router.route('/me').get(userController.getMe, userController.getUser);
router.route('/updateMe').patch(userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
