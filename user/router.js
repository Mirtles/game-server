const express = require('express')
const { Router } = express

const User = require('./model')

const router = new Router();

router.post(
  '/user', (req, res, next) => {
    const { name, password } = req.body;
    User.create({ name, password, score: 0, choice: null })
      .then(user => res.json(user))
      .catch(next)
  }
)

module.exports = router;