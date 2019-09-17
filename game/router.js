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

  router.put("/join/:gameId",
    // authMiddleware, 
    async (req, res, next) => {
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

  router.put("/choose/:choice", async (req, res, next) => {
    const { authorization } = req.headers;
    const auth = authorization.split(" ");
    const data = toData(auth[1]);

    const user = await User.findByPk(data.userId);

    const game = await Game.findByPk(user.gameId);
    const { choice } = req.params;

    await user.update({ current_choice: choice });

    const usersInGame = await User.findAll({ where: { gameId: game.id } })
    const chosen = usersInGame.every(user => user.current_choice)

    function checkWinner(users) {
      const userOne = users[0]
      const userTwo = users[1]
      const choiceOne = userOne.current_choice
      const choiceTwo = userTwo.current_choice

      if (choiceOne === choiceTwo) {
        return null
      }
      if (choiceOne === "rock") {
        if (choiceTwo === "paper") {
          return userTwo
        } else {
          return userOne
        }
      }
      if (choiceOne === "paper") {
        if (choiceTwo === "scissors") {
          return userTwo
        } else {
          return userOne
        }
      }
      if (choiceTwo === "rock") {
        return userTwo
      } else {
        return userOne
      }
    }

    if (chosen) {
      const winner = checkWinner(usersInGame)
      console.log(winner)
      if (!winner) {
        // send response
      } else {
        await winner.update({ score: winner.score + 1 })
      }
      // update game round
    }
  })

  return router;
}

module.exports = factory;
