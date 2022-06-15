const mongoose = require("mongoose");
const { Schema } = mongoose;

const currentTime = () => {
  return new Date();
};

const timeInOneHour = () => {
  return new Date(new Date().setHours(new Date().getHours() + 1));
};

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
    createdAt: {
      type: Date,
    },
    thisSessionWasCreatedAt: {
      type: String,
      default: currentTime,
    },
    thisSessionWillExpireAt: {
      type: String,
      default: timeInOneHour,
    },
  },
  { versionKey: false, timestamps: true }
);

session.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const Session = mongoose.model("session", session);

module.exports = Session;
