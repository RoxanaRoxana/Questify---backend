const passport = require("passport");

const accessMiddleware = (req, res, next) => {
  passport.authenticate("accessStrategy", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const refreshMiddleware = (req, res, next) => {
  passport.authenticate("refreshStrategy", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = { accessMiddleware, refreshMiddleware };
