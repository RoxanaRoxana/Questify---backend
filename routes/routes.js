const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const cardController = require("../controllers/cardController");
const { accessMiddleware, refreshMiddleware } = require("../middleware/jwt");

router.get("/users", userController.getAllUsers);
router.post("/users/register", userController.registerUser);
router.post("/users/login", userController.loginUser);
router.post("/users/logout", accessMiddleware, userController.logoutUser);
router.post("/users/refresh", refreshMiddleware, userController.refreshTokens);

router.post("/card", accessMiddleware, cardController.createCard);
router.patch("/card/:cardId", accessMiddleware, cardController.editCard);
router.delete("/card/:cardId", accessMiddleware, cardController.deleteCard);
router.get("/card", accessMiddleware, cardController.getAllUsersCards);
router.patch(
  "/card/complete/:cardId",
  accessMiddleware,
  cardController.updateCardCompletion
);

module.exports = router;
