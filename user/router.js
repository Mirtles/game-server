const express = require("express");
const { Router } = express;
const bcrypt = require("bcryptjs");

const User = require("./model");

const router = new Router();

router.post("/user", async (req, res, next) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.send("Missing data");
  }

  const users = await User.findAll()
  const usernames = users.map(user => user.dataValues.name)

  if (usernames.find(username => username === name)) {
    return res.send("That username is already taken.")
  }

  if (name && password) {
    console.log(`\nRunning on..\n`)
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
})

module.exports = router;
