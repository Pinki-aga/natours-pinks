const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

const filterFields = (obj, ...allowedField) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedField.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.getAllUsers = async (req, res, next) => {
  try {
    const user = await User.find();
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = (req, res) => {
  res.status(200).json({
    status: 'error',
    message: 'Route is not found'
  });
};
exports.updateMe = async (req, res, next) => {
  try {
    // 1) show error when user sends password or confirmPassword
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for Password change', 400));
    }
    //Filter the fields for unwanted data like role allowed fields are only [name, email]
    const filteredObj = filterFields(req.body, 'name', 'email');

    //2) update the current user details
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'Success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    //2) update the current user active state to false
    await User.findByIdAndUpdate(req.user.id, {
      active: false
    });

    res.status(204).json({
      status: 'Success'
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'error',
    message: 'Route is not found'
  });
};
exports.updateUser = (req, res) => {
  res.status(200).json({
    status: 'error',
    message: 'Route is not found'
  });
};
exports.deleteUser = (req, res) => {
  res.status(200).json({
    status: 'error',
    message: 'Route is not found'
  });
};
