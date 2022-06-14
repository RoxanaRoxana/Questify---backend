const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const cardController = require("../controllers/cardController");
const { accessMiddleware, refreshMiddleware } = require("../middleware/jwt");
const authController = require("../controllers/authController");

router
  .get("/users", userController.getAllUsers)
  .post("/users/register", userController.registerUser)
  .post("/users/login", userController.loginUser)
  .post(
    "/users/logout",
    authController.protect,
    accessMiddleware,
    userController.logoutUser
  )
  .post("/users/refresh", refreshMiddleware, userController.refreshTokens);

router
  .post(
    "/card",
    authController.protect,
    accessMiddleware,
    cardController.createCard
  )
  .patch(
    "/card/:cardId",
    authController.protect,
    accessMiddleware,
    cardController.editCard
  )
  .delete(
    "/card/:cardId",
    authController.protect,
    accessMiddleware,
    cardController.deleteCard
  )
  .get(
    "/card",
    authController.protect,
    accessMiddleware,
    cardController.getAllUsersCards
  )
  .patch(
    "/card/complete/:cardId",
    accessMiddleware,
    cardController.updateCardCompletion
  );

module.exports = router;
