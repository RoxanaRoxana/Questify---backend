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
    // expireAt: {
    //   type: Date,
    //   default: Date.now() + 60 * 1000,
    // },
  },
  { versionKey: false }
);

// session.index({ expireAt: 1 }, { expires: 60 * 1000 });

const Session = mongoose.model("session", session);

module.exports = Session;
