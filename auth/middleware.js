const { toData } = require('./jwt')

const User = require('../user/model')

function auth(req, res, next) {
  const { authorization } = req.headers
  const auth = authorization && authorization.split(" ");
  if (auth && auth[0] === "Bearer" && auth[1]) {
    try {
      const data = toData(auth[1])
      // TODO: REMOVE LOG!!
      console.log(data)
      User.findByPk(data.userId)
        .then(user => {
          if (!user) return next("User does not exist.")
          req.user = user
          next()
        })
        .catch(next)
    } catch (error) {
      res.status(400).send({
        message: `Error ${error.name}: ${error.message}`
      })
    }
  } else {
    res.status(401).send({
      message: "Please log in."
    })
  }
}

module.exports = auth