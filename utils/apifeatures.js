class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //Tour.find()
    this.queryString = queryString; //req.query
  }
  filter() {
    //Simple filtering
    const queryObj = { ...this.queryString }; //Normal declaration returns a reference
    const excluded = ['page', 'sort', 'limit', 'fields'];
    excluded.forEach((element) => delete queryObj[element]);

    //Advanced filtering

    let queryStr = JSON.stringify(queryObj);
    //we wrote in MongoDB shell:
    //{duration:{$gte=5}}
    queryStr = queryStr.replace(/\b(gt|gte|lte|lt)\b/g, (match) => `$${match}`); // \b means th

    this.query = this.query.find(JSON.parse(queryStr)); //.find returns a query which has many methods we can use like .sort and .where

    //const tours = await Tour.find(req.query); //req.query returns an object

    //Another version
    // const tours = await Tour.find().where('duration').equals(5);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(/,/g, ' '); //We can also use .split(',').join(' ')
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('name');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replace(/,/g, ' '); //We can also use .split(',').join(' ')
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //System field, mongo uses it internally
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
