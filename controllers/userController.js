const User = require(`./../models/userModel`);
const Booking = require('../models/bookingModel');
const multer = require('multer');
const sharp = require('sharp');
const APIFeatures = require(`../utils/apiFeature`);
const AppError = require('../utils/appError').default;
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination : (req , file, cb) => {
//     cb(null , 'public/img/users' );
//   },
//   filename: (req , file , cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null , `user-${req.user.id} - ${Date.now()}.${ext} `)
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image ! please upload images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id} - ${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quility: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates.', 400));
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidator: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not defined! Please usev signUp instead',
  });
};

exports.ThisUserBookings = catchAsync(async (req, res, next) => {
  const dataId = req.params.id;
  const bookings = await Booking.find({ user: dataId });

  ////console.log("kkkkkkkkkk" , Bookings);
  if (bookings.length === 0) {
    return next(new AppError('No, Bookings on this user', 404));
  }

  res.status(200).json({
    status: 'success',
    TotalTour: bookings.length,
    bookings,
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUser = factory.getAll(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);