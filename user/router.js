const express = require("express");
const { Router } = express;
const bcrypt = require("bcryptjs");

const User = require("./model");

const router = new Router();

router.post("/user", (req, res, next) => {
  const { name, password } = req.body;
  if (!name || !password) {
    res.send("Missing data");
  } else {
    const user = {
      name,
      password: bcrypt.hashSync(password, 10),
      score: 0,
      choice: null
    };

    User.create(user)
      .then(user => res.json(user))
      .catch(next);
  }
});

module.exports = router;
