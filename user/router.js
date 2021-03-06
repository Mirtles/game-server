const express = require("express");
const { Router } = express;
const bcrypt = require("bcryptjs");

const User = require("./model");

function factory(update) {
  const router = new Router();

  router.post("/user", async (req, res, next) => {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.send({ body: "Oops! Enter name and password!" });
    }

    const users = await User.findAll();
    const usernames = users.map(user => user.dataValues.name);

    if (usernames.find(username => username === name)) {
      return res.send({ body: "That username is already taken." });
    }

    const user = {
      name,
      password: bcrypt.hashSync(password, 10),
      score: 0,
      choice: null
    };

    const newUser = await User.create(user);
    await update();

    return res.send(newUser);
  });
  return router;
}

module.exports = factory;
