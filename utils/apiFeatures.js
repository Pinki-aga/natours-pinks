//REFACTORING

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A) FILTERING
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    //1B) ADVANCED Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    console.log('queryStr...', queryStr);

    // {difficulty: 'easy', duration: {$gte: 5}}
    //{ difficulty: 'easy', duration: {gte: 5}}

    //EXECUTE QUERY
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); // when sorting with multiple fields/keys
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Default sort by createdAt descending order
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // fields = name,duration,difficulty
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); // name duration difficulty
    } else {
      this.query = this.query.select('-__v'); // else exclude __v field from response
    }
    return this;
  }

  paginate() {
    //Page 2 and limit 10 then we need to get data from 21-30 so need to skip 20 records beofre that
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
