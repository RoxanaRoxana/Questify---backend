const User = require("../service/schemas/user");
const { userSchema } = require("../helpers/joi");
const jwt = require("jsonwebtoken");

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

  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1h" });

  await User.findByIdAndUpdate(user._id, { token: token });

  res.status(200).json({
    token,
    userData: {
      email,
      id: user._id,
    },
  });
};

const logoutUser = async (req, res, next) => {
  const { _id, token } = req.user;

  if (!token) {
    return res.status(400).json({
      message: "No token provided",
    });
  }

  try {
    await User.findByIdAndUpdate(_id, { token: null });
    return res.status(204).json({
      status: "No Content",
      code: 204,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

module.exports = { getAllUsers, registerUser, loginUser, logoutUser };
