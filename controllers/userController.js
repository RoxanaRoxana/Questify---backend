const User = require("../service/schemas/user");
const Card = require("../service/schemas/card");
const { userSchema } = require("../helpers/joi");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const registerUser = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = userSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const user = await User.findOne({ email }, { _id: 1 }).lean();
  if (user) {
    return res.status(409).json({ message: "User already exists" });
  }

  try {
    const newUser = new User({ email });
    await newUser.setPassword(password);
    await newUser.save();
    res.status(201).json({
      message: "User successfully created",
      userData: {
        email,
        id: newUser._id,
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = userSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const user = await User.findOne({ email });
  const isPasswordCorrect = await user.validatePassword(password);

  if (!user || !isPasswordCorrect) {
    return res.status(403).json({ message: "Wrong credentials" });
  }

  const payload = {
    id: user._id,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, process.env.SECRETACC, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, process.env.SECRETREF, {
    expiresIn: "1h",
  });

  const sid = uuidv4();

  await User.findByIdAndUpdate(user._id, {
    accessToken,
    refreshToken,
    sid,
  });

  const userCards = await Card.find({ owner: user._id });

  res.status(200).json({
    accessToken,
    refreshToken,
    sid,
    userData: {
      email,
      id: user._id,
      cards: userCards,
    },
  });
};

const logoutUser = async (req, res, next) => {
  const { _id, accessToken } = req.user;

  if (!accessToken) {
    return res.status(400).json({
      message: "No accessToken provided",
    });
  }

  try {
    await User.findByIdAndUpdate(_id, {
      accessToken: null,
      refreshToken: null,
      sid: null,
    });
    return res.status(204).json({
      status: "No Content",
      code: 204,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const refreshTokens = async (req, res, next) => {
  const { sid } = req.body;

  if (!sid) {
    return res.status(400).json({ message: "No sid provided" });
  }

  const { _id } = req.user;
  const user = await User.findOne({ _id });

  if (sid !== user.sid) {
    return res.status(403).json({ message: "Wrong sid provided" });
  }

  const payload = {
    id: user._id,
    email: user.email,
  };

  const newAccessToken = jwt.sign(payload, process.env.SECRETACC, {
    expiresIn: "1h",
  });
  const newRefreshToken = jwt.sign(payload, process.env.SECRETREF, {
    expiresIn: "1h",
  });
  const newSid = uuidv4();

  try {
    await User.findByIdAndUpdate(_id, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sid: newSid,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }

  const newUserData = await User.findOne({ _id });
  res.status(200).json({
    newAccessToken: newUserData.accessToken,
    newRefreshToken: newUserData.refreshToken,
    newSid: newUserData.sid,
  });
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  logoutUser,
  refreshTokens,
};
