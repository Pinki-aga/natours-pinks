const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const {
  getAllUsers,
  getUser,
  updateUser,
  createUser,
  deleteUser
} = userController;
const router = express.Router();

//Auth User

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
// Users Routing
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);
router
  .route('/:id')
  .patch(updateUser)
  .get(getUser)
  .delete(deleteUser);

module.exports = router;
