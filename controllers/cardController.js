const Card = require("../service/schemas/card");
const { cardSchema } = require("../helpers/joi");

const addCard = async (req, res, next) => {
  const { title, difficulty, category, date, time, type } = req.body;
  const { _id } = req.user;
  const { error } = cardSchema.validate({ title });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const result = await Card.create({
      title,
      difficulty,
      category,
      date,
      time,
      type,
      owner: _id,
    });
    res.status(201).json({ createdCard: result });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

module.exports = { addCard };
