const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().email().min(3).max(254),
  password: Joi.string().min(8).max(100),
});

const cardSchema = Joi.object({
  title: Joi.string().min(2).max(100),
});

module.exports = { userSchema, cardSchema };
