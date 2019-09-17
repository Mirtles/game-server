const { Router } = require("express");
const { toJWT, toData } = require("./jwt");
const bcrypt = require("bcryptjs");
const router = new Router();
const User = require("../user/model");

router.post("/login", (req, res, next) => {
  const name = req.body.name;
  const password = req.body.password;
  console.log(name, password);
  if (!name || !password) {
    res.status(400).send({
      message: "Please supply a valid name and password"
    });
  } else {
    User.findOne({
      where: {
        name: req.body.name
      }
    })
      .then(user => {
        if (!user) {
          res.status(400).send({
            message: "User with that name does not exist"
          });
        }
        if (bcrypt.compareSync(req.body.password, user.password)) {
          res.send({
            jwt: toJWT({ userId: user.id })
          });
        } else {
          res.status(400).send({
            message: "Password was incorrect"
          });
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send({
          message: "Something went wrong"
        });
      });
  }
});

module.exports = router;
