const mongoose = require("mongoose");
const { Schema } = mongoose;

const card = new Schema({
  title: {
    type: String,
    minlength: 2,
    maxlength: 100,
    required: [true, "Title is required"],
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Normal", "Hard"],
    required: [true, "Difficulty is required"],
  },
  category: {
    type: String,
    enum: ["Stuff", "Family", "Health", "Learning", "Leisure", "Work"],
  },
  date: {
    type: String,
    required: [true, "Date is required"],
  },
  time: {
    type: String,
  },
  type: {
    type: String,
    enum: ["Task", "Challenge"],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

const Card = mongoose.model("card", card);

module.exports = Card;
