const mongoose = require('mongoose');
const slugify = require('slugify');

//creating schema and model with mongoose

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      trim: true,
      minlength: [10, 'A Tour Name must have more or equal than 10 characters'],
      maxlength: [40, 'A Tour Name must have less or equal than 40 characters']
      //validate: [validator.isAlpha, 'Tour Name should contain only alphabates'] // validator library for string validator and sanitizers
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have maxGroupSize']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating Average must be greater or equal than 1.0'],
      max: [5, 'Rating Average must be less or equal than 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 4.5
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          //this only points to current doc on New Document creation
          console.log('val < this.price...', val, this.price);
          return val < this.price; // return true if no error and false if error occured
        },
        message: 'Discount Price ({VALUE}) must be less than regular Price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String
    },
    images: {
      type: [String]
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: {
      type: [String]
    },
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

tourSchema.virtual('dureationWeeks').get(function() {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE IN MANGOOSE runs before .save and create

tourSchema.pre('save', function() {
  //Here this refres to current document processed
  this.slug = slugify(this.name, { lower: true });
});

// tourSchema.pre('save', function(next) {
//   console.log('saving doc');
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE runs befor find and many others check mongoose docs

// tourSchema.pre('find', function() {
tourSchema.pre(/^find/, function() {
  //Here this points to current query
  // to run for all the command starts with find like findById, findandupdate
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });
});

tourSchema.post(/^find/, function(docs) {
  // to run for all the command starts with find like findById, findandupdate
  console.log(`Query took ${Date.now() - this.start} millisecons`);
  // console.log('docs..', docs);
});

//Create model out of schema defined
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
