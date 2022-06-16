const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().email().min(3).max(254),
  password: Joi.string().min(8).max(100),
});

const cardSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  difficulty: Joi.any().valid("Easy", "Normal", "Hard").required(),
  category: Joi.any().valid(
    "Stuff",
    "Family",
    "Health",
    "Learning",
    "Leisure",
    "Work"
  ),
  date: Joi.string().required(),
  time: Joi.string(),
  type: Joi.any().valid("Task", "Challenge").required(),
  isCompleted: Joi.boolean(),
});

const editedCardSchema = Joi.object({
  title: Joi.string().min(2).max(100),
  difficulty: Joi.any().valid("Easy", "Normal", "Hard"),
  category: Joi.any().valid(
    "Stuff",
    "Family",
    "Health",
    "Learning",
    "Leisure",
    "Work"
  ),
  date: Joi.string(),
  time: Joi.string(),
  type: Joi.any().valid("Task", "Challenge"),
  isCompleted: Joi.boolean(),
});

module.exports = { userSchema, cardSchema, editedCardSchema };
