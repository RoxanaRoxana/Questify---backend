const mongoose = require("mongoose");
const { Schema } = mongoose;

const session = new Schema(
  {
    sid: {
      type: String,
      default: null,
      unique: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false }
);

const Session = mongoose.model("session", session);

module.exports = Session;
