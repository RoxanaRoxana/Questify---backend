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
    expireAt: {
      type: Date,
      default: Date.now,
      index: {
        expireAfterSeconds: 3600,
      },
    },
  },
  { versionKey: false, timestamps: true, index: true }
);

const Session = mongoose.model("session", session);

module.exports = Session;
