const { Router } = require("express");
const { toJWT, toData } = require("./jwt");
const bcrypt = require("bcryptjs");
const router = new Router();
const User = require("../user/model");

router.post("/login", (req, res, next) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.send({
      message: "Please supply a valid name and password"
    });
  }
  User.findOne({
    where: {
      name: req.body.name
    }
  })
    .then(user => {
      if (!user) {
        res.send({
          message: "User with that name does not exist"
        });
      }
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          jwt: toJWT({ userId: user.id }),
          id: user.id
        });
      } else {
        res.send({
          message: "Incorrect password"
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send({
        message: "Something went wrong"
      });
    });
});

module.exports = router;
