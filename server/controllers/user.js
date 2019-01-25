const express = require('express');
const bcrypt = require('bcrypt-nodejs');

const User = require('../models/user');

const router = express.Router();

router.post('/register', async (req, res) => {
  const userObj = {
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
  };
  if (typeof userObj.name !== 'string' || userObj.name === '') {
    return res.status(422).json({
      error: true,
      content: 'Name of the user should be a non-empty string',
    });
  }
  if (typeof userObj.username !== 'string' || userObj.username === '') {
    return res.status(422).json({
      error: true,
      content: 'Username should be a non-empty string',
    });
  }
  if (typeof userObj.password !== 'string' || userObj.password === '') {
    return res.status(422).json({
      error: true,
      content: 'Password should be a non-empty string',
    });
  }
  const exists = await User.checkExistence(userObj.username);
  if (exists) {
    return res.status(409).json({
      error: true,
      content: `Username ${userObj.username} already exists`,
    });
  }
  if (exists === undefined) {
    return res.status(500).json({
      error: true,
      content: 'Error checking uniqueness of username',
    });
  }
  userObj.password = bcrypt.hashSync(userObj.password);
  try {
    await User.create(userObj);
    return res.status(200).json({
      error: false,
      content: `User '${userObj.username}' successfully created`,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      content: err.message,
    });
  }
});

module.exports = router;
