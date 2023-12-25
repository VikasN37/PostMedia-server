class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort;
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-date');
    }
    this.query.select('-__v');
    return this;
  }
}

module.exports = APIfeatures;
