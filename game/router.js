const express = require("express");
const { Router } = express;

const Game = require("./model");

function factory(update) {
  const router = new Router();

  async function onGame(req, res) {
    const { name } = req.body;
    const game = await Game.create({ name, round: 0 });
    await update();

    return res.send(game);
  }
  router.post("/game", onGame);

  return router;
}
module.exports = factory;
