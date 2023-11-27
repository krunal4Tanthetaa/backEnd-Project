const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha , 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficilty is either: easy , medium , difficult',
      },
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10 ) / 10
    },
    ratingQuntity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // THIS ONLY POINTS TO CURRENT DOC ON NEW DOCUMENT CREATION
          return val < this.price; // 100 < 200
        },
        message: 'Discount price ({VALUE}) should bE below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// tourSchema.index({price: 1});
tourSchema.index({price: 1 , ratingsAverage: -1});
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });


tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews' , {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});


//DOCUMENT MIDDLEWARE : RUN BEFORE .SAVE() AND .CREATE()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// const x = 0
// tourSchema.pre('save' , function (next) {
//   this.CurrentGroupSize = x++;
//   next();
// })

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save' , function(next) {
//     console.log(this);
//     next();
// })

// tourSchema.post('save' , function(doc , next){
//   console.log("------------", doc);
//   next();
// })

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  //console.log('--------------------------------');
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/ , function(next) {
   this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
})

///AGGREGATION MIDDLEWARE

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this);
//   next();
// });


tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds !`);
  // console.log(docs);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;