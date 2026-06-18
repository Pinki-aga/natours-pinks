const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

process.on('uncaughtException', err => {
  console.log(err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('DB Connection is successful!..'))
  .catch(err => {
    console.log('Connection error...', err);
  });

// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log('ERROR ', err);
//   });

//START the Server
const port = process.env.PORT || 3000;
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`APP running on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.message);
  server.close(() => {
    process.exit(1);
  });
});
