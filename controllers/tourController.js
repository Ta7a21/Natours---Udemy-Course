//const fs = require('fs');
const Tour = require('./../models/tourModel');
//const APIFeatures = require('./../utils/apifeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./../controllers/handleController');
// const tours = JSON.parse(
//   // converts it to JavaScript object (array of objects)
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// Can be called route handlers, here we send the response

//Middleware function specific to id parameter, instead of using the same code multiple times in id controllers

//For local use

// exports.checkID = (req, res, next, val) => {
//   //req.params.id is a string by default, multiplying it by 1 changes it to int
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({ //return is used instead of send to send another response
//       status: 'fail',
//       message: 'Failed',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'bad request',
//     });
//   }
//   next();
// };

//This middleware is prefilling the query's object
exports.topfive = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,price,summary,duration';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
  //try {
  const stats = await Tour.aggregate([
    //We can use one operator multiple times
    {
      //Select
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //Group by
        _id: { $toUpper: '$difficulty' },
        //Aggregate functions
        numTours: { $sum: 1 }, //Works when adding all documents
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        minPrice: -1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  //try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //one document for each element in array
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' }, //Add to an array
      },
    },
    {
      $addFields: { month: '$_id' }, //Can be like aliasing
    },
    {
      $project: {
        //Relational algebra
        _id: 0,
      },
    },
    {
      $sort: { numToursStarts: -1 },
    },
    {
      $limit: 1,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});
