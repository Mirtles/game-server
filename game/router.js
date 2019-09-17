const express = require("express");
const { Router } = express;

const Game = require("./model");
const User = require("../user/model");
const authMiddleware = require("../auth/middleware");
const { toData } = require("../auth/jwt");

function factory(update) {
  const router = new Router();

  async function onGame(req, res) {
    const { name } = req.body;
    const game = await Game.create({ name, round: 0 });
    await update();

    return res.send(game);
  }
  router.post("/game", authMiddleware, onGame);

  router.put("/join/:gameId", authMiddleware, async (req, res, next) => {
    const { gameId } = req.params;
    const game = await Game.findByPk(gameId);

    const { authorization } = req.headers;
    const auth = authorization.split(" ");

    const data = toData(auth[1]);

    if (game.round === 0) {
      const user = await User.findByPk(data.userId);

      await user.update({ gameId, score: 0 });
    }

    const usersInGame = await User.findAll({ where: { gameId: gameId } });
    if (usersInGame.length === 2) {
      await game.update({ round: 1 });
    }
  });
  return router;
}
module.exports = factory;
