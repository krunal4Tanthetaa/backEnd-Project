const express = require('express');

const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();


router.use(authController.protect);

router.get('/checkout-session/:tourId' , bookingController.checkTourAvaileble , bookingController.getCheckoutSession)

router.use(authController.restrictTo('admin' , 'lead-guide'));

router
   .route('/')
   .get(authController.protect, bookingController.getAllBookings)
   .post( bookingController.createBooking);

router
  .route('/:id')
  .get( bookingController.getBookings)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);


module.exports = router;