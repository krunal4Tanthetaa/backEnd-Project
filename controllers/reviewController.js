//const catchAsync = require("../utils/catchAsync");
const Review = require('./../models/reviewModel');
const Booking = require('../models/bookingModel.js');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError').default;

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.checkUser = catchAsync(async (req, res, next) => {
  const CurrentUser = req.body.user;
  const CurrentTour = req.body.tour;
  console.log('user', CurrentUser);
  const booking = await Booking.find({ user: CurrentUser, tour: CurrentTour });

  if (booking.length === 0) {
    return next(new AppError('Do Not Get review Because you are not booking this tour !', 401));
  }

  next();
});

exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.DeleteReview = factory.deleteOne(Review);
exports.UpdateReview = factory.updateOne(Review);
