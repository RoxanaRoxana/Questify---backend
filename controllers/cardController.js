const Card = require("../service/schemas/card");
const { cardSchema } = require("../helpers/joi");

const createCard = async (req, res, next) => {
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

const editCard = async (req, res, next) => {
  const { cardId } = req.params;
  const newCardData = req.body;
  try {
    const result = await Card.findOneAndUpdate(
      { _id: cardId },
      { $set: newCardData },
      {
        new: true,
        runValidators: true,
        strict: "throw",
      }
    );
    if (!result) {
      res.status(404).json({ message: "Card not found!" });
    } else {
      res.status(200).json({ editedCard: result });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const deleteCard = async (req, res, next) => {
  const { cardId } = req.params;

  const card = await Card.findOne({ _id: cardId });

  if (!card) {
    return res.status(404).json({
      message: "No card with given Id in database",
    });
  }

  try {
    await Card.deleteOne({ _id: cardId });
    res.status(204).json();
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const getAllUsersCards = async (req, res, next) => {
  const { _id } = req.user;
  try {
    const results = await Card.find({ owner: _id }).lean();
    res.status(200).json({ cards: results });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const updateCardCompletion = async (req, res, next) => {
  const { cardId } = req.params;
  const { isCompleted } = req.body;
  try {
    const result = await Card.findByIdAndUpdate(cardId, { isCompleted });
    if (!result) {
      res.status(404).json({ message: "Card not found!" });
    } else {
      res.status(200).json({
        message: `Card status was changed to ${isCompleted}`,
        editedCard: result,
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

module.exports = {
  createCard,
  editCard,
  deleteCard,
  getAllUsersCards,
  updateCardCompletion,
};
