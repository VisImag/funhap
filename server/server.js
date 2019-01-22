const bodyParser = require('body-parser');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multipart = require('connect-multiparty');

require('./env.js')();
const QuestionController = require('./controllers/question.js');

const app = express();

app.use(bodyParser.json({ strict: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multipart({ uploadDir: path.join(__dirname, './.tmp') }));

app.use('/question', QuestionController);

mongoose.Promise = global.Promise;
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
