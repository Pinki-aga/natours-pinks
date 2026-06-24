const express = require('express');
const morgan = require('morgan'); // Third Party middleware
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

const app = express();

app.use(helmet());
// to get the time at which request is made
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Third party middleware to print the details about http request and response
}

//Data Sanitization agains NoSql Query Injection (anyone can login given email as nosql query and knowing only password)
app.use(mongoSanitize());

//Data Sanitization against XSS attacks
app.use(xss());

// preventing parameter pollution [/api/v1/tours/sort = 'duration' & sort=''price] - gives error
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'dififculty',
      'price'
    ] // whitelist all the fields which can be duplicated and get the result based on parameter selection
  })
);

//Limit the requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many Requests from this IP, Please try again later after an hour'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' })); // creating a middleware to get the request details, cuz express doesn't allow to have request body

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
      404
    )
  ); // when we pass err in next() function is any middleware then express understands is that next middleware to execute is
  //global error handling middleware and skips all the next middlewares in the stack
});

//GLoabal error handling Middleware
app.use(globalErrorHandler);

module.exports = app;
