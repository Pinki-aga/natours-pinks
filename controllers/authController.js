const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('./../utils/appError');

const cookieOptions = {
  expires: new Date(
    Date.now() +
      parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000
  ),
  httpOnly: true
};

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  //secure to be sent only for production environment
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  //Remove password from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role
    });
    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //1)if email and passowrd exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    //2) if user exist and passowrd correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Either Email or password is not correct', 401));
    }
    //3) if everything is right then login and send token to the client
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

//To protect getAllTours route middleware function

exports.protect = async (req, res, next) => {
  try {
    let token;
    //1) getting token and check if token exist from authorization header
    //console.log(req.headers.authorization);
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to get access', 401)
      );
    }
    //2) validate the token from JWT algorithm
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) check if user still exist after token was issued
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belong to the token no longer exist issued!',
          401
        )
      );
    }
    //4) check if user changed pwd after token was issued
    const passwordChanged = currentUser.passwordChangedAfter(decoded.iat);
    if (passwordChanged) {
      return next(
        new AppError(
          'Password is changed by the user recently, Please login again',
          401
        )
      );
    }
    // If everything works fine then grant access to getAllTours
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have access to delete the tour', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) find user with given email address
    const user = await User.findOne({ email: req.body.email }).select(
      '+password'
    );

    if (!user) {
      return next(
        new AppError('User is not found with given email address', 404)
      );
    }
    //2) generate random reset token using crypto and save in data base
    const resetToken = user.createPasswordResetToken();
    console.log(resetToken);
    await user.save({ validateBeforeSave: false });
    //3) send it to the user via email
    // lecture number 137 refer
    next();
  } catch (err) {
    console.log('FULL ERROR:', err);
    next(err);
  }
};

exports.resetPassword = (req, res, next) => {};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) get user from collection
    console.log(req.user);
    const user = await User.findById(req.user.id).select('+password');
    //2) check if posted current Password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError('Your current password is not correct', 401));
    }
    //3) if so, then update the password field
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //4) log in user, send JWT token
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
