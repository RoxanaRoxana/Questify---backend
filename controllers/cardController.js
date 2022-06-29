const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Card = require("../service/schemas/card");
const { cardSchema, editedCardSchema } = require("../helpers/joi");
const mongoose = require("mongoose");

// ##################################################### CREATE CARD #####################################################
const createCard = async (req, res, next) => {
  // assign values of requested body parameters to given constants - additional parameters will be ignored
  const { title, difficulty, category, date, time, type } = req.body;
  // request logged in user's id and assign it to "_id" constant
  const { _id } = req.user;
  // validate given parameters using joi and cardSchema - if any of given parameters doesn't meet
  // the requirements assign error message to "error" constant
  const { error } = cardSchema.validate({
    title,
    difficulty,
    category,
    date,
    time,
    type,
  });

  // if "error" constant exists return response with 400 status code (Bad Request) and error's message value as 'message'
  // (error is an object with 'message' field)
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // check if there is a card in database that has the same title as given in request body and if it's owner
  // is the current user
  const cardWithTheSameTitle = await Card.findOne({ title: title, owner: _id });

  // if there is a card with the same title that belongs to the current user return response with 403 status code (Forbidden)
  // and a message
  if (cardWithTheSameTitle) {
    return res.status(403).json({
      message: "Card's title must be unique",
    });
  }

  // try to create a card with given data and return response with 201 status code (Created) and created card data
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
    // if there is an error show it's contents in console
    console.error(e);
    next(e);
  }
};

// ##################################################### EDIT CARD #####################################################
const editCard = async (req, res, next) => {
  // request card id as a parameter
  const { cardId } = req.params;

  // check if given id is a valid mongo db id object - if it's not return response with 400 status code (Bad Request)
  if (!mongoose.isValidObjectId(cardId)) {
    return res.status(400).json({ message: "Invalid cardId" });
  }

  // check if card with given id exists in database
  const cardInDb = await Card.findById(cardId);

  // if it doesn't exist return response with 400 status code
  if (!cardInDb) {
    return res
      .status(400)
      .json({ message: "No card with given Id in database!" });
  }

  // get token from request headers
  const token = req.headers.authorization.split(" ")[1];

  // decode token and assign user id from the token to 'userId' constant
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_ACCESS);
  const userId = decoded.id;

  // convert card's owner id to string
  const cardsOwner = cardInDb.owner.toString();

  // check if the card's owner id is the same as user's id from the token. If not return a response with 403 status code (Forbidden)
  if (cardsOwner !== userId) {
    return res.status(403).json({ message: "You are not the card's owner!" });
  }

  // assign values of requested body parameters to given constants - additional parameters will be ignored
  const { title, difficulty, category, date, time, type } = req.body;

  // if there are no parameters in request body return a response with 400 status code (Bad Request)
  if (!title && !difficulty && !category && !date && !time && !type) {
    return res.status(400).json({
      message:
        "Nothing to change! Please provide at least one element that you want to change",
    });
  }

  // if all parameters in request body are the same as the ones on edited card return a response with 400 status code (Bad Request) and a message
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

  // validate given parameters using joi and editedCardSchema - if any of given parameters doesn't meet
  // the requirements assign error message to "error" constant
  const { error } = editedCardSchema.validate({
    title,
    difficulty,
    category,
    date,
    time,
    type,
  });

  // if "error" constant exists return response with 400 status code (Bad Request) and error's message value as 'message'
  // (error is an object with 'message' field)
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // try to find edited card by it's id and update it with given parameters
  try {
    await Card.findByIdAndUpdate(cardId, {
      title,
      difficulty,
      category,
      date,
      time,
      type,
    });
    // find edited card with new values by it's id and assign it to 'result' constant
    const result = await Card.findById(cardId);
    // return response status code 200 (OK) and edited card's body
    res.status(200).json({ editedCard: result });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

// ##################################################### DELETE CARD #####################################################
const deleteCard = async (req, res, next) => {
  // request card id as a parameter
  const { cardId } = req.params;

  // check if given id is a valid mongo db id object - if it's not return response with 400 status code (Bad Request)
  if (!mongoose.isValidObjectId(cardId)) {
    return res.status(400).json({ message: "Invalid cardId" });
  }

  // find a card in database which id matches parameter's id
  const card = await Card.findOne({ _id: cardId });

  // if such card doesn't exist return response with 404 status code (Not Found) and a message
  if (!card) {
    return res.status(404).json({
      message: "No card with given Id in database",
    });
  }

  // delete card with given id from database and return respose with 204 status code (No Content)
  try {
    await Card.deleteOne({ _id: cardId });
    res.status(204).json();
  } catch (e) {
    console.error(e);
    next(e);
  }
};

// ##################################################### GET ALL USER'S CARDS #####################################################
const getAllUsersCards = async (req, res, next) => {
  // request user's id
  const { _id } = req.user;
  // find all cards where owner matches user's id and return status code 200 (OK)
  try {
    const results = await Card.find({ owner: _id }).lean();
    res.status(200).json({ cards: results });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

// ##################################################### UPDATE CARD COMPLETION #####################################################
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
