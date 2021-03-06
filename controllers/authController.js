const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../service/schemas/user");

const protectAccess = async (req, res, next) => {
  // 1) Getting token and checking if it's in headers and if it starts with 'Bearer'.
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // if it exists assign it to 'token' variable
    token = req.headers.authorization.split(" ")[1];
  }

  // if token doesn't exist return response message with 401 code
  if (!token) {
    return res
      .status(401)
      .json({ message: "You are not logged in! Please log in to get access." });
  }
  // 2) Verification of a token
  try {
    await promisify(jwt.verify)(token, process.env.SECRET_ACCESS);
  } catch (e) {
    console.error(e);
    if (e.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your token has expired" });
    }
    next(e);
  }

  // 3) Check if user still exists
  try {
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.SECRET_ACCESS
    );
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({
        message: "The user belonging to this token does no longer exist.",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }

  next();
};

const protectRefresh = async (req, res, next) => {
  // 1) Getting token and checking if it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "You are not logged in! Please log in to get access." });
  }
  // 2) Verification token
  try {
    await promisify(jwt.verify)(token, process.env.SECRET_REFRESH);
  } catch (e) {
    console.error(e);
    if (e.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your token has expired" });
    }
    next(e);
  }

  // 3) Check if user still exists
  try {
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.SECRET_REFRESH
    );
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({
        message: "The user belonging to this token does no longer exist.",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }

  next();
};

module.exports = { protectAccess, protectRefresh };
