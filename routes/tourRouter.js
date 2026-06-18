const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopFive
} = tourController;

//router.param('id', tourController.checkId);
//Aliasing the Routes to get top 5 cheap tours

router.route('/top-5-cheap').get(aliasTopFive, getAllTours);

router
  .route('/')
  .get(getAllTours)
  .post(createTour);
router
  .route('/:id')
  .patch(updateTour)
  .get(getTour)
  .delete(deleteTour);

module.exports = router;
