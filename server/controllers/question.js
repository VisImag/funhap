const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const express = require('express');

const Question = require('../models/question');
const { Queue } = require('../utils');

const router = express.Router();

const questionObjectValidation = (obj, update = false) => {
  if (!(update && obj.statement === undefined)
    && (typeof obj.statement !== 'string' || obj.statement === '')) {
    return {
      error: true,
      content: 'Question statement should be a non-empty string',
    };
  }
  if (!(update && obj.type === undefined) && obj.type.toUpperCase() !== 'SINGLE_CORRECT'
    && obj.type.toUpperCase() !== 'MULTIPLE_CORRECT') {
    return {
      error: true,
      content: 'Question type should either be `SINGLE_CORRECT` or `MULTI_CORRECT`',
    };
  }
  if (!(update && obj.options === undefined)
    && (!(obj.options instanceof Array) || obj.options.length === 0)) {
    return {
      error: true,
      content: 'Question options should be a non-empty array',
    };
  }
  if (!(update && obj.correct_options === undefined)
    && (!(obj.correct_options instanceof Array) || obj.correct_options.length === 0)) {
    return {
      error: true,
      content: 'Question correct options should be a non-empty array',
    };
  }
  if (obj.options !== undefined && obj.correct_options !== undefined
    && obj.options.length < obj.correct_options.length) {
    return {
      error: true,
      content: 'Question options should be equal or more than correct options',
    };
  }
  return false;
};

router.post('/add', async (req, res) => {
  let num;
  try {
    num = await Question.getNum();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      content: 'Error fetching previous questions',
    });
  }
  const queObj = {
    number: num + 1,
    statement: req.body.statement,
    type: (req.body.type || 'SINGLE_CORRECT').toUpperCase(),
    options: req.body.options,
    correct_options: req.body.correct_options,
  };
  const validResult = questionObjectValidation(queObj);
  if (validResult) {
    return res.status(422).json(validResult);
  }
  try {
    const que = await Question.create(queObj);
    return res.status(201).json({
      error: false,
      content: `Question number ${que.number} added`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      content: `Error adding question ${queObj.number}`,
    });
  }
});

router.get('/fetch', async (req, res) => {
  const page = req.body.page || 1;
  const limit = req.body.limit || 10;
  try {
    const questions = await Question.find({}, { _id: 0, __v: 0 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    return res.status(200).json({
      error: false,
      content: { questions, page, limit },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      content: 'Error fetching questions',
    });
  }
});

router.get('/fetch/:queNum', async (req, res) => {
  try {
    const question = await Question.findOne({ number: req.params.queNum },
      { _id: 0, __v: 0 });
    if (question === null || question === undefined) {
      return res.status(404).json({
        error: true,
        content: `Question number ${req.params.queNum} does not exist`,
      });
    }
    return res.status(200).json({
      error: false,
      content: question,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      content: `Error fetching question number ${req.params.queNum}`,
    });
  }
});

router.put('/update/:queNum', async (req, res) => {
  try {
    const updateObj = {
      statement: req.body.statement,
      type: req.body.type,
      options: req.body.options,
      correct_options: req.body.correct_options,
    };
    Object.keys(updateObj).forEach(key => ((updateObj[key] === undefined)
      ? delete updateObj[key] : ''));
    if (Object.keys(updateObj).length === 0) {
      return res.status(409).json({
        error: true,
        content: 'Nothing to update',
      });
    }
    const validResult = questionObjectValidation(updateObj, true);
    if (validResult) {
      return res.status(422).json(validResult);
    }
    const result = await Question.updateOne({ number: req.params.queNum },
      { $set: updateObj }).exec();
    if (result.n === 0) {
      return res.status(404).json({
        error: true,
        content: `Question number ${req.params.queNum} does not exist`,
      });
    }
    return res.status(200).json({
      error: false,
      content: `Question number ${req.params.queNum} updated`,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      content: `Server was unable to handle question number ${req.params.queNum} update`,
    });
  }
});

router.post('/add/batch', async (req, res) => {
  const tmpFile = req.files.datafile;
  if (tmpFile === undefined) {
    return res.status(400).json({
      error: true,
      content: 'JSON datafile is absent',
    });
  }
  const extName = path.extname(tmpFile.path);
  if (extName !== '.json') {
    return res.status(415).json({
      error: true,
      content: `Expected JSON file got ${extName.slice(1).toUpperCase()}`,
    });
  }
  const readFile = promisify(fs.readFile);
  try {
    const data = await readFile(tmpFile.path, { encoding: 'utf8' });
    const { questions } = JSON.parse(data);
    if (questions === undefined) {
      return res.status(400).json({
        error: true,
        content: 'JSON file does not contain questions array',
      });
    }
    const statusObj = {};
    const queue = new Queue(questions.length);
    queue.on('completed', () => res.status(200).json({
      error: false,
      content: statusObj,
    }));
    for (let i = 0; i < questions.length; i += 1) {
      queue.push(async () => {
        try {
          await Question.create(questions[i]);
          statusObj[`Question ${questions[i].number}`] = {
            error: false,
            content: 'Added successfully',
          };
          queue.next();
        } catch (err) {
          statusObj[`Question ${questions[i].number}`] = {
            error: true,
            content: err.message,
          };
          queue.next();
        }
      });
    }
    return null;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(422).json({
        error: true,
        content: err.message,
      });
    }
    return res.status(500).json({
      error: true,
      content: 'Unexpected error occured, Maybe there is an error reading uploaded file',
    });
  }
});

module.exports = router;
