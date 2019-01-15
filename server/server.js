const bodyParser = require('body-parser');

const express = require('express');
const mongoose = require('mongoose');

require('./env.js')();

const app = express();

app.use(bodyParser.json({ strict: true }));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Connected to mongodb');
});

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Listening on port: ${process.env.PORT}`);
});
