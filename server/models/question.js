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

module.exports = mongoose.model('question', blueprint);
