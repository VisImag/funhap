const mongoose = require('mongoose');

const { Schema } = mongoose;

const blueprint = new Schema({
  username: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  password: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  score: {
    type: mongoose.Schema.Types.Number,
    default: 0,
  },
  time: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
  },
});

module.exports = mongoose.model('user', blueprint);
