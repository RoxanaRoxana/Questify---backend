const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Card = require("../service/schemas/card");
const { cardSchema, editedCardSchema } = require("../helpers/joi");
const mongoose = require("mongoose");

const createCard = async (req, res, next) => {
  const { title, difficulty, category, date, time, type } = req.body;
  const { _id } = req.user;
  const { error } = cardSchema.validate({
    title,
    difficulty,
    category,
    date,
    time,
    type,
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

  const cardInDb = await Card.findById(cardId);

  if (!cardInDb) {
    return res
      .status(400)
      .json({ message: "No card with given Id in database!" });
  }

  const cardsOwner = cardInDb.owner.toString();

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_ACCESS);

  const userId = decoded.id;

  if (cardsOwner !== userId) {
    return res.status(403).json({ message: "You are not the card's owner!" });
  }

  const { title, difficulty, category, date, time, type } = req.body;

  if (!title && !difficulty && !category && !date && !time && !type) {
    return res.status(400).json({
      message:
        "Nothing to change! Please provide at least one element that you want to change",
    });
  }

  if (
    cardInDb.title === title &&
    cardInDb.difficulty === difficulty &&
    cardInDb.category === category &&
    cardInDb.date === date &&
    cardInDb.time === time &&
    cardInDb.type === type
  ) {
    return res.status(400).json({
      message: "Provided elements are the same! Nothing was changed!",
    });
  }

  const { error } = editedCardSchema.validate({
    title,
    difficulty,
    category,
    date,
    time,
    type,
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    await Card.findByIdAndUpdate(cardId, {
      title,
      difficulty,
      category,
      date,
      time,
      type,
    });
    const result = await Card.findById(cardId);
    res.status(200).json({ editedCard: result });
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
