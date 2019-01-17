const mongoose = require('mongoose');

const { Schema } = mongoose;

const blueprint = new Schema({
  number: {
    type: mongoose.Schema.Types.Number,
    unique: true,
    required: true,
  },
  statement: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  type: {
    type: mongoose.Schema.Types.String,
    default: 'SINGLE_CORRECT', // Values: SINGLE_CORRECT, MULTI_CORRECT
  },
  options: {
    type: mongoose.Schema.Types.Array,
    required: true,
  },
  correct_options: {
    type: mongoose.Schema.Types.Array,
    required: true,
  },
});

function getNum() {
  return new Promise((resolve, reject) => {
    this.find({}, { number: 1 }).sort({ number: -1 }).limit(1).exec((err, data) => {
      if (err) {
        return reject(err);
      }
      if (data.length === 0) {
        return resolve(0);
      }
      return resolve(data[0].number);
    });
  });
}

blueprint.statics.getNum = getNum;

module.exports = mongoose.model('question', blueprint);
