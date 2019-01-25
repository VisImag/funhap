const mongoose = require('mongoose');

const { Schema } = mongoose;

const blueprint = new Schema({
  name: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  username: {
    type: mongoose.Schema.Types.String,
    unique: true,
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

async function checkExistence(username) {
  try {
    const user = await this.findOne({ username });
    if (user === null || user === undefined) {
      return false;
    }
    return true;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

blueprint.statics.checkExistence = checkExistence;

module.exports = mongoose.model('user', blueprint);
