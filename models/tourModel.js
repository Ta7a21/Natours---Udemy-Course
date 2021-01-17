//MVC architecture (Models - Views - Controllers)
//Models for business logic (keep most of the logic here)
//Controllers for application's logic (opposite of models)
//Views for GUI

// const User = require('./../models/userModel');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      //Validators
      required: [true, 'a tour must have a name'],
      maxlength: [40, 'A name must be less than or equal 40 characters'],
      minlength: [10, 'A name must be more than or equal 10 characters'],
      // validate: [validator.isAlpha, 'Error'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulties are either easy, medium, or difficult',
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5.0, 'A rating must be less than or equal 5.0'],
      min: [1.0, 'A rating must be more than or equal 1.0'],
      set: (val) => Math.round(val * 10) / 10, //4.666667--> 46.6666--->47---->4.7
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //we didnt use arrow fnc bec we need this.
          //runs for new documents only
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be less than price',
      },
    },
    summary: {
      type: String,
      trim: true, //remove white space from beginning and end
      required: [true, 'a tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'a tour must have an image cover'],
    },
    images: [String], //array of strings
    secretTour: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //Hide from output when a tour data is requested
    },
    startDates: [Date],
    startLocations: {
      //GeoJSON
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
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //guides:Array //Array of documents, we wil keep the IDs only (Referencing)
    guides: [
      {
        type: mongoose.Schema.ObjectId, //Mongo DB ID
        ref: 'User',
      },
    ],
  },
  //To make them appear in the output, but still they wont be saved into the database
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

//virtuals arent saved in the database (Derived attribute)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //this. refers to the current document
});
//we can use "this."" in regular functions only

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//Document middleware: Runs before .save and .create only
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//For embedding guides
// tourSchema.pre('save',function(next){
//   const guidePromises = this.guides.map(async id=> await User.findById(id)); //The map returns an array, forEach doesnt
//   this.guides = await Promises.all(guidePromises); //returns an array of promises
// });

//Post middlewares have access to the document
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query middleware
//tourSchema.pre('find', function (next) //For the .find method only
tourSchema.pre(/^find/, function (next) {
  //For all methods starting with find
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  //Showing documents using referencing
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// tourSchema.post(/^find/, function (doc, next) {
//   //For all methods starting with find
//   console.log(`time =${Date.now() - this.start}`);
//   next();
// });

//Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //unshift used to add in beginning of array, shift does the opps.
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
