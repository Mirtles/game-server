const express = require("express");
const Sse = require("json-sse");
const cors = require("cors");
const bodyParser = require("body-parser");

const Game = require("./game/model");
const User = require("./user/model");
const gameFactory = require("./game/router");
const userFactory = require("./user/router");
const loginRouter = require("./auth/router");

const JSONparser = bodyParser.json();
const stream = new Sse();
const app = express();
const corsMiddleware = cors();

app.use(corsMiddleware, JSONparser);

async function serialize() {
  const games = await Game.findAll({
    include: [User],
    order: [["id", "DESC"]]
  });
  const data = JSON.stringify(games);
  return data;
}
async function update() {
  const data = await serialize();
  stream.send(data);
}

async function onStream(req, res) {
  const data = await serialize();
  stream.updateInit(data);
  return stream.init(req, res);
}

app.get("/stream", onStream);

const gameRouter = gameFactory(update);
app.use(gameRouter);

const userRouter = userFactory(update);
app.use(userRouter);

app.use(loginRouter);

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`\nListening on port ${port}\n`));
