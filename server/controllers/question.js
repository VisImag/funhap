const express = require('express');

const Question = require('../models/question');

const router = express.Router();

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
  if (typeof queObj.statement !== 'string' || queObj.statement === '') {
    return res.status(422).json({
      error: true,
      content: 'Question statement should be a non-empty string',
    });
  }
  if (queObj.type !== 'SINGLE_CORRECT' && queObj.type !== 'MULTI_CORRECT') {
    return res.status(422).json({
      error: true,
      content: 'Question type should either be `SINGLE_CORRECT` or `MULTI_CORRECT`',
    });
  }
  if (!(queObj.options instanceof Array) || queObj.options.length === 0) {
    return res.status(422).json({
      error: true,
      content: 'Question options should be a non-empty array',
    });
  }
  if (!(queObj.correct_options instanceof Array) || queObj.correct_options.length === 0) {
    return res.status(422).json({
      error: true,
      content: 'Question correct options shoule be a non-empty array',
    });
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
      content: `Question number ${req.params.queNum} updates`,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      content: `Server was unable to handle question number ${req.params.queNum} update`,
    });
  }
});

module.exports = router;
