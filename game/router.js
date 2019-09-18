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
    await update();
  });

  router.put("/choose/:choice", async (req, res, next) => {
    const { authorization } = req.headers;
    const auth = authorization.split(" ");
    const data = toData(auth[1]);

    const user = await User.findByPk(data.userId);

    const game = await Game.findByPk(user.gameId);
    const { choice } = req.params;

    await user.update({ current_choice: choice });

    const usersInGame = await User.findAll({ where: { gameId: game.id } });
    const chosen = usersInGame.every(user => user.current_choice);

    if (chosen) {
      const winnerAndLoser = checkWinner(usersInGame);

      if (!winnerAndLoser) {
        usersInGame.map(
          async user => await user.update({ isRoundWinner: false })
        );
      } else {
        const { winner, loser } = winnerAndLoser;
        await winner.update({ score: winner.score + 1, isRoundWinner: true });
        await loser.update({ isRoundWinner: false });
      }
    }
    res.send({ news: "Updated score" });
  });

  router.put("/round", async (req, res, next) => {
    const { authorization } = req.headers;
    const auth = authorization.split(" ");
    const data = toData(auth[1]);

    const user = await User.findByPk(data.userId);
    const game = await Game.findByPk(user.gameId);
    const usersInGame = await User.findAll({ where: { gameId: game.id } });

    usersInGame.map(async user => await user.update({ choice: null }));
    await game.update({ round: game.round + 1 });
    await user.update({ isRoundWinner: null });

    if (user.score === 5) {
      res.send({ stopGame: "You won" });
    }

    await update();
  });
  return router;
}

function checkWinner(users) {
  const userOne = users[0];
  const userTwo = users[1];
  const choiceOne = userOne.current_choice;
  const choiceTwo = userTwo.current_choice;

  const userOneWinner = {
    winner: userOne,
    loser: userTwo
  };

  const userTwoWinner = {
    winner: userTwo,
    loser: userOne
  };

  if (choiceOne === choiceTwo) {
    return null;
  }
  if (choiceOne === "rock") {
    if (choiceTwo === "paper") {
      return userTwoWinner;
    } else {
      return userOneWinner;
    }
  }
  if (choiceOne === "paper") {
    if (choiceTwo === "scissors") {
      return userTwoWinner;
    } else {
      return userOneWinner;
    }
  }
  if (choiceTwo === "rock") {
    return userTwoWinner;
  } else {
    return userOneWinner;
  }
}

module.exports = factory;
