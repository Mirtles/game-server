const Sequelize = require("sequelize");

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgres://postgres:pass@localhost:5432/postgres";
const db = new Sequelize(databaseUrl);

db.sync({
  // force: true
})
  .then(() => console.log("Database connected"))

  .catch(console.error);

module.exports = db;