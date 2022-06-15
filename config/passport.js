const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require("../service/schemas/user");
const Session = require("../service/schemas/sessions");
const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const params = {
  secretOrKey: process.env.SECRET_ACCESS,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

const paramsRef = {
  secretOrKey: process.env.SECRET_REFRESH,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

const passportFunction = async (payload, done) => {
  const user = await User.findOne({ _id: payload.id });

  if (!user) {
    return done(new Error("User not found!"));
  }

  const session = await Session.findOne(
    { sid: payload.sid, owner: payload.id },
    { _id: 1 }
  ).lean();

  if (session) {
    return done(null, user);
  } else if (!session) {
    return done(new Error("You are not logged in or session expired!"));
  } else {
    return done(new Error("Sid mismatch!"));
  }
};

passport.use("accessStrategy", new Strategy(params, passportFunction));
passport.use("refreshStrategy", new Strategy(paramsRef, passportFunction));
