const Sequelize = require('sequelize')

const db = require('../db')

const User = db.define(
  'user',
  {
    name: { type: Sequelize.STRING, unique: true },
    password: Sequelize.STRING,
    score: Sequelize.INTEGER,
    current_choice: Sequelize.STRING,
  }
)

module.exports = User