const { promisify } = require("util");
const User = require("../service/schemas/user");
const Card = require("../service/schemas/card");
const Session = require("../service/schemas/sessions");
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

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

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

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const { error } = userSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(403)
      .json({ message: "User with provided email doesn't exist" });
  }

  const isPasswordCorrect = await user.validatePassword(password);

  if (!isPasswordCorrect) {
    return res.status(403).json({ message: "Wrong password" });
  }

  const sid = uuidv4();
  await Session.create({ sid, owner: user._id });

  const payload = {
    id: user._id,
    email: user.email,
    sid,
  };

  const accessToken = jwt.sign(payload, process.env.SECRET_ACCESS, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, process.env.SECRET_REFRESH, {
    expiresIn: "1h",
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
  // 1) initialize token
  let token;

  // 2) get token from headers and assign it to variable without it's 'Bearer' prefix
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 3) decode token
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_ACCESS);

  // 4) get sid from decoded token and assign it to variable
  const sidFromToken = decoded.sid;

  // 5) get id of a current user and assign it to constant
  const { _id } = req.user;

  // 6) find a session where sid from token matches sid in database and current user is it's owner
  // If we would've found session based only on owner's id and the user was logged in multiple times we would be able to log out multiple times from his different sessions
  const userSession = await Session.findOne({ sid: sidFromToken, owner: _id });

  try {
    // 7) find a session based on it's id found in previous step and remove it from database
    await Session.findByIdAndRemove(userSession._id);
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
  const userSession = await Session.findOne({ owner: _id });

  if (sid !== userSession.sid) {
    return res.status(403).json({ message: "Wrong sid provided" });
  }

  const user = await User.findOne({ _id });

  const newSid = uuidv4();

  const payload = {
    id: user._id,
    email: user.email,
    sid: newSid,
  };

  const newAccessToken = jwt.sign(payload, process.env.SECRET_ACCESS, {
    expiresIn: "1h",
  });
  const newRefreshToken = jwt.sign(payload, process.env.SECRET_REFRESH, {
    expiresIn: "1h",
  });

  try {
    await Session.findByIdAndUpdate(userSession._id, {
      sid: newSid,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }

  const newSessionData = await Session.findOne({ owner: _id });
  res.status(200).json({
    newAccessToken,
    newRefreshToken,
    newSid: newSessionData.sid,
  });
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  logoutUser,
  refreshTokens,
};
