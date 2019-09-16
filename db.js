const Sequelize = require('sequelize')

const databaseUrl = "postgres://postgres:pass@localhost:5432/postgres"
const db = new Sequelize(databaseUrl)

db.sync()
  .then((console.log(`\nDatabase connected!\n`)))
  .catch(console.error)

module.exports = db