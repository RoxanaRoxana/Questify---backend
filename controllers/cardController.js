const Card = require("../service/schemas/card");
const { cardSchema } = require("../helpers/joi");
const mongoose = require("mongoose");

const createCard = async (req, res, next) => {
  const { title, difficulty, category, date, time, type } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (!difficulty) {
    return res.status(400).json({ message: "Difficulty is required" });
  }

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  if (!type) {
    return res.status(400).json({ message: "Type is required" });
  }

  const { _id } = req.user;
  const { error } = cardSchema.validate({
    title,
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const cardWithTheSameTitle = await Card.findOne({ title: title });

  if (cardWithTheSameTitle) {
    return res.status(403).json({
      message: "Card's title must be unique",
    });
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

  if (!mongoose.isValidObjectId(cardId)) {
    return res.status(400).json({ message: "Invalid cardId" });
  }

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

  if (!mongoose.isValidObjectId(cardId)) {
    return res.status(400).json({ message: "Invalid cardId" });
  }

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

  if (!mongoose.isValidObjectId(cardId)) {
    return res.status(400).json({ message: "Invalid cardId" });
  }

  const cardToUpdate = await Card.findOne({ _id: cardId }).lean();

  if (cardToUpdate.isCompleted === true) {
    return res.status(409).json({ message: "Card has already been completed" });
  }

  try {
    const result = await Card.findByIdAndUpdate(cardId, { isCompleted: true });
    if (!result) {
      res.status(404).json({ message: "Card not found!" });
    } else {
      const updatedCard = await Card.findById({ _id: cardId }).lean();
      res.status(200).json({
        message: "Card status was changed to 'completed'",
        editedCard: updatedCard,
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
