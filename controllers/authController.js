const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt
    });

    const token = signToken(newUser._id);
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
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
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token
    });
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

    console.log('decoded...', decoded);

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
