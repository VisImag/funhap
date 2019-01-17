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

module.exports = router;
