const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();


router.use('/:tourId/reviews' , reviewRouter);


router
  .route('/top-5-cheap')
  .get(
    tourController.aliasTopTours,
    tourController.getAllTour
    );

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect ,
    authController.restrictTo('admin' , 'lead-guide' , 'guide') ,
    tourController.getMonthlyPlan);


router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin)
// tours-distance?distance=233&center=-40,45&unit=mi
// tour-distancwe/233/center/-40,45/unit/mi



router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);



router
  .route('/')
  .get(tourController.getAllTour)
  .post(
    authController.protect ,
    authController.restrictTo('admin' , 'lead-guide') ,
    tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect ,
    authController.restrictTo('admin' , 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.UpdateTour, )
  .delete(
    authController.protect ,
    authController.restrictTo('admin' , 'lead-guide' ) ,
    tourController.DeleteTour);

router
  .route('/:id/bookings')
  .get(tourController.ThisTourBooking)


  module.exports = router;