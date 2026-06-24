const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');

//MIDDLEWARE to get top 5 cheap tours aliasing route
exports.aliasTopFive = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,price,duration,difficulty';
  next(); // to move to the next middleware stack
};

//ROUTE HANDLERS

exports.getAllTours = async (req, res, next) => {
  try {
    console.log(req.query);

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sorting()
      .limitFields()
      .paginate();

    const tours = await features.query;

    //JSend Format to format the response data
    res.status(200).json({
      status: 'Success',
      requestedAt: req.requestTime,
      result: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createTour = async (req, res, next) => {
  try {
    // create ducument using mongoose 2 ways
    // Solution 1 using model directly and save
    // const newTour = new Tour({});
    // newTour.save().then();

    //SOultion 2 using create method
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    //console.log('Create Err..', err);
    next(err);
  }
};

exports.getTour = async (req, res, next) => {
  // const id = params.id * 1; // convert string id to integer;
  // const tour = tours.find(el => el.id === id); // return an array with tour matching the id, if not matched return undefined

  try {
    const tour = await Tour.findById(req.params.id); // Tour.findOne({_id: req.params.id}), findById is shorthand for this in mongoose
    //JSend Format to format the response data

    res.status(200).json({
      status: 'Success',
      data: {
        tour
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTour = async (req, res, next) => {
  // const { params } = req;
  // the logic of updating an objects property here
  try {
    const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true // To run all the validators while updating as well
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    console.log('error..', err);
    next(err);
  }
};

exports.deleteTour = async (req, res, next) => {
  // const { params } = req;
  // the logic of deleting a tour here and update the file/database
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      message: 'Selected Tour is deleted'
    });
  } catch (err) {
    next(err);
  }
};
