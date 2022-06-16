const mongoose = require("mongoose");
const { Schema } = mongoose;

const currentHour = () => {
  return new Date().toTimeString().split(" ")[0].slice(0, 5);
};

const card = new Schema(
  {
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
      default: "Stuff",
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      default: currentHour,
    },
    type: {
      type: String,
      enum: ["Task", "Challenge"],
      required: [true, "Card's type is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false }
);

const Card = mongoose.model("card", card);

module.exports = Card;
