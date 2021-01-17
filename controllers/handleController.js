const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const APIFeatures = require('./../utils/apifeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new appError(`No data found with that ID`, 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
    // } catch (err) {
    //   res.status(400).json({
    //     status: 'fail',
    //     message: err,
    //   });
    // }
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //returns the updated tour
      runValidators: true, //check the validators again from the schema on the updated tour
    });

    if (!doc) {
      return next(new appError(`No data found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    // } catch (err) {
    //   res.status(400).json({
    //     status: 'fail',
    //     message: err,
    //   });
    // }
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //try {
    const newDoc = await Model.create(req.body); //.create returns a promise
    res.status(201).json({
      status: 'success',
      data: {
        newDoc,
      },
    });
    // } catch (err) {
    //   res.status(400).json({
    //     status: 'fail',
    //     message: err,
    //   });
    // }
    // Implementation without async await
    // const newTour = new Tour(req.body);
    // newTour
    //   .save()
    //   .then(() => {
    //     res.status(201).json({
    //       status: 'success',
    //       data: {
    //         newTour,
    //       },
    //     });
    //   })
    //   .catch((err) => {
    //     res.status(400).json({
    //       status: 'fail',
    //       message: err,
    //     });

    //Local implementation
    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newId }, req.body); //merges two objects
    // tours.push(newTour); //add element to the array
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours) /* { x: 5, y: 6 } --> "{"x":5,"y":6}" */,(err)=>{
    //     res.status(201).json({
    //           status: 'success',
    //           data: {
    //             tour: newTour
    //           }
    //     });
    // }
    // );
    //
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //try {
    const id = req.params.id * 1;
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query; //can be: .findOne({_id:req.params.id}) as we did on shell

    if (!doc) {
      //If the ID was valid, the output data will be null
      return next(new appError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    // } catch (err) {
    //   res.status(400).json({
    //     status: 'fail',
    //     message: err,
    //   });
    // }
    //Local implementation
    // const id = req.params.id * 1; //converts the string parameter to integer
    // const tour = tours.find((el) => el.id === id);
    //
    // if(id>tour.length || !tour){
    //   return res.status(404).json({
    //     status:'fail',
    //     message: 'Invalid'
    //   });
    // }

    // res.status(200).json({
    //   status: 'success',
    //   data: {
    //     tour,
    //   },
    // });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //try {
    //EXECUTE QUERY
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      //.find({duration: 5, difficulty: 'easy'})
      //.find().where('duration').equals("5")
      //find is like SELECT in SQL, returns an array of objects
      .filter()
      .sort()
      .limitFields()
      .pagination();

    //const docs = await features.query.explain();
    const docs = await features.query;
    console.log(docs);
    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: docs.length,
      data: {
        data: docs,
      },
    });
    // } catch (err) {
    //   res.status(400).json({
    //     status: 'fail',
    //     message: err,
    //   });
    // }
  });
