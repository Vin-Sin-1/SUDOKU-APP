const messages = {
  row: [
    "Row down! One less headache! 😎",
    "That row never saw you coming! 💥",
    "Row-mantic! 🌹",
    "Line 'em up, knock 'em down! 🎳",
    "Row row row your way to victory! 🚣",
    "Slick! That row is done! ⚡",
    "Another one bites the dust! 🎸",
    "Row? More like WOW! 🤩",
  ],
  col: [
    "Columbo would be proud! 🕵️",
    "Column conquered! 🏛️",
    "Top to bottom, clean sweep! 🧹",
    "Vertical victory! ⬆️",
    "Standing tall! 🗼",
    "From top to bottom — done! 💪",
    "That column had no chance! 😤",
  ],
  box: [
    "Box office hit! 🎬",
    "Think outside the box? Nah, just fill it! 📦",
    "Boxed and delivered! 📫",
    "That 3x3 didn't stand a chance! 💥",
    "Square deal! ⬛",
    "Box checked! 🎁",
    "3x3? More like 3x-EASY! 😂",
    "Crushing it, box by box! 🔥",
  ],
  win: [
    "You absolute legend! 👑",
    "Einstein just called. He's impressed! 🧠",
    "Are you even human?! 🤖",
    "Your brain just did a backflip! 🤸",
    "Sudoku master has entered the chat! 🏆",
    "That puzzle didn't stand a chance! 💥",
    "Pure genius. We're not worthy! 🙌",
    "Did you even break a sweat?! 😤",
    "The numbers feared you today! 😈",
    "Certified galaxy brain! 🌌",
  ],
};

export function getRandomMessage(type) {
  const pool = messages[type] || messages.row;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default messages;
