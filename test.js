function testLogic(choiceOne, choiceTwo) {
  if (choiceOne === choiceTwo) {
    return "draw"
  }
  if (choiceOne === "rock") {
    if (choiceTwo === "paper") {
      return "choiceTwo wins"
    } else {
      return "choiceOne wins"
    }
  }
  if (choiceOne === "paper") {
    if (choiceTwo === "scissors") {
      return "choiceTwo wins"
    } else {
      return "choiceOne wins"
    }
  }
  if (choiceTwo === "rock") {
    return "choiceTwo wins"
  } else {
    return "choiceOne wins"
  }
}

console.log(testLogic("scissors", "paper"))


