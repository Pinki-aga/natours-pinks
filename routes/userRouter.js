const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

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
