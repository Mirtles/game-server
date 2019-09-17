const Sequelize = require('sequelize')

const db = require('../db')
const User = require('../user/model')

const Game = db.define(
  'game',
  {
    name: { type: Sequelize.STRING },
    round: { type: Sequelize.INTEGER },
  }
)

Game.hasMany(User)
User.belongsTo(Game)

module.exports = Game


