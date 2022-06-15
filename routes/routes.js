const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const cardController = require("../controllers/cardController");
const { accessMiddleware, refreshMiddleware } = require("../middleware/jwt");
const {
  protectAccess,
  protectRefresh,
} = require("../controllers/authController");

router
  .get("/users", userController.getAllUsers)
  .post("/users/register", userController.registerUser)
  .post("/users/login", userController.loginUser)
  .post(
    "/users/logout",
    protectAccess,
    accessMiddleware,
    userController.logoutUser
  )
  .post(
    "/users/refresh",
    protectRefresh,
    refreshMiddleware,
    userController.refreshTokens
  );

router
  .post("/card", protectAccess, accessMiddleware, cardController.createCard)
  .patch(
    "/card/:cardId",
    protectAccess,
    accessMiddleware,
    cardController.editCard
  )
  .delete(
    "/card/:cardId",
    protectAccess,
    accessMiddleware,
    cardController.deleteCard
  )
  .get(
    "/card",
    protectAccess,
    accessMiddleware,
    cardController.getAllUsersCards
  )
  .patch(
    "/card/complete/:cardId",
    protectAccess,
    accessMiddleware,
    cardController.updateCardCompletion
  );

module.exports = router;
