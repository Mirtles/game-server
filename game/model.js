const Sequelize = require('sequelize')
const db = require('../db')

const Game = db.define(
  'game',
  {
    name: { type: Sequelize.STRING },
    round: { type: Sequelize.INTEGER },
  }
)

module.exports = Game


