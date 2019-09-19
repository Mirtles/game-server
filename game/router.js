const express = require("express");
const { Router } = express;

const Game = require("./model");
const User = require("../user/model");
const authMiddleware = require("../auth/middleware");

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

    if (game.round === 0) {
      const user = req.user;

      await user.update({ gameId, score: 0 });
    }

    const usersInGame = await User.findAll({ where: { gameId: gameId } });
    if (usersInGame.length === 2) {
      await game.update({ round: 1 });
    }
    await update();

    res.send(usersInGame);
  });

  router.put("/choose/:choice", authMiddleware, async (req, res, next) => {
    const user = req.user;

    const game = await Game.findByPk(user.gameId);
    const { choice } = req.params;

    await user.update({ current_choice: choice });
    const usersInGame = await User.findAll({ where: { gameId: game.id } });
    const chosen = usersInGame.every(user => user.current_choice);

    if (chosen) {
      const winnerAndLoser = checkWinner(usersInGame);

      if (!winnerAndLoser) {
        const promises = usersInGame.map(async user =>
          user.update({ isRoundWinner: false })
        );
        await Promise.all(promises);
      } else {
        const { winner, loser } = winnerAndLoser;
        await winner.update({ score: winner.score + 1, isRoundWinner: true });
        await loser.update({ isRoundWinner: false });
      }
    }
    await update();
    res.send({ chosen });
  });

  router.put("/round", authMiddleware, async (req, res, next) => {
    const user = req.user;

    const game = await Game.findByPk(user.gameId);

    await user.update({ hasClickedNext: true });
    const usersInGame = await User.findAll({ where: { gameId: game.id } });

    const reset = usersInGame.every(user => {
      return user.hasClickedNext;
    });

    if (reset) {
      await game.update({ round: game.round + 1 });
      await User.update(
        {
          isRoundWinner: null,
          current_choice: null,
          hasClickedNext: false
        },
        {
          where: { gameId: game.id }
        }
      );
    }
    await update();
    res.send({ reset });
  });

  router.put("/reset", authMiddleware, async (req, res, next) => {
    const user = req.user;
    const game = await Game.findByPk(user.gameId);

    await user.update({ gameId: null });

    await User.update(
      {
        isRoundWinner: null,
        current_choice: null,
        hasClickedNext: false
        // gameId: null
      },
      {
        where: { gameId: game.id }
      }
    );

    await game.update({ round: 0 });

    await update();

    res.send({ reset: true });
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
