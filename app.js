const express = require('express');
const morgan = require('morgan'); // Third Party middleware
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

const app = express();

//MIDDLEWARES
// app.use((req, res, next) => {
//   console.log('Hello from middleware..');
//   next();
// });

// to get the time at which request is made
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(morgan('dev')); // Third party middleware to print the details about http request and response

app.use(express.json()); // creating a middleware to get the request details, cuz express doesn't allow to have request body

// app.get('/', (req, res) => {
// //res.status(200).send('Hello from the server side!');
// res.status(200).json({message: 'Hello from the server side!', app: 'natours'});
// })

// app.post('/', (req,res) => {
// res.send('Post anything to this URL')
// })
// read file at the top level code just to avoid event loop block and convert data in JSON array

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(400).json({
  //   status: 'fail',
  //   message: `Requested URL ${req.originalUrl} not found on this server`
  // });
  // const err = new Error(
  //   `Requested URL ${req.originalUrl} not found on this server`
  // );
  // err.statusCode = 404;
  // err.status = 'fail';
  next(
    new AppError(
      `Requested URL ${req.originalUrl} not found on this server`,
      '404'
    )
  ); // when we pass err in next() function is any middleware then express understands is that next middleware to execute is
  //global error handling middleware and skips all the next middlewares in the stack
});

//GLoabal error handling Middleware
app.use(globalErrorHandler);

module.exports = app;
