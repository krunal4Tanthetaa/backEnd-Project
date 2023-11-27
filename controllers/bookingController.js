const stripe = require('stripe')(
  'sk_test_51NfbT3SECDZ6cxBjux7hw4gXZG7vEfyUgfV215UjNsYnPUqK4G3E5iB8BTP7R1F8MEfW5HLt5u6Ds6Esyvmx2RpU00JbCRf51D'
);
const Tour = require(`../models/tourModel`);
const Booking = require(`../models/bookingModel`);
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError').default;

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  //console.log("hiiii i am here ");

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${
      req.user.id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is only Temporary , beacause it's UNSECURE: EVEYONE CAN MAKE BOKINGS WITHOUT PAYING
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.checkTourAvaileble = catchAsync(async (req, res, next) => {
  const Id = req.params.tourId;

  const GetTour = await Tour.findById(Id);
  const booking = await Booking.find({ tour: Id });

  const GroupSize = GetTour.maxGroupSize;
  const bookingSize = booking.length;

  console.log(GroupSize);
  console.log(bookingSize);

  if (bookingSize >= GroupSize) {
    return next(new AppError('Group size is full do not booking this tour!', 500));
  }
  next();
});

exports.createBooking = factory.createOne(Booking);
exports.getBookings = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
