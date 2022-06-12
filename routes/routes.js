const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const cardController = require("../controllers/cardController");
const { authMiddleware } = require("../middleware/jwt");

router.get("/users", userController.getAllUsers);
router.post("/users/register", userController.registerUser);
router.post("/users/login", userController.loginUser);
router.post("/users/logout", authMiddleware, userController.logoutUser);
router.post("/users/refresh", authMiddleware, userController.refreshTokens);

router.post("/card", authMiddleware, cardController.createCard);
router.patch("/card/:cardId", authMiddleware, cardController.editCard);
router.delete("/card/:cardId", authMiddleware, cardController.deleteCard);
router.get("/card", authMiddleware, cardController.getAllUsersCards);
router.patch(
  "/card/:cardId",
  authMiddleware,
  cardController.updateCardCompletion
);

module.exports = router;

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: Users endpoints
 */

/**
 * @swagger
 *
 * /api/users:
 *  get:
 *    summary: Returns the list of all users
 *    tags: [Users]
 *    description: Get the list of all users
 *    responses:
 *      200:
 *       description: The list of all users
 *       content:
 *        application/json:
 *          schema:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        id:
 *          type: string
 *          description: The auto-generated id of the user
 *        email:
 *          type: string
 *          description: User's email address
 *        password:
 *          type: string
 *          description: User's bcrypted password
 *        accessToken:
 *          type: string
 *          description: User's access token auto-generated using JWT
 *        refreshToken:
 *          type: string
 *          description: User's refresh token auto-generated using JWT
 *        sid:
 *          type: string
 *          description: User's session Id auto-generated using UUID
 */
