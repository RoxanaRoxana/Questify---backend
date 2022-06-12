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
 *      '200':
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
 *          example: 62a5e76be56b359bbce6d0a2
 *        email:
 *          type: string
 *          description: User's email address
 *          example: email@email.com
 *        password:
 *          type: string
 *          description: User's bcrypted password
 *          example: $2b$06$Urq1ur4hbPril/4jHZnleu9TQL86.mMdPJne5m599OlK1OV/3W8v2
 *        accessToken:
 *          type: string
 *          description: User's access token auto-generated using JWT
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYTVlNzZiZTU2YjM1OWJiY2U2ZDBhMiIsImVtYWlsIjoicmFkZWtAZ21haWwuY29tIiwiaWF0IjoxNjU1MDUyMDM4LCJleHAiOjE2NTUwNTU2Mzh9.4uW-8WYaoqRFjRmFbzoWgUlmTgWG_JxrjSbi6shsElk
 *        refreshToken:
 *          type: string
 *          description: User's refresh token auto-generated using JWT
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYTVlNzZiZTU2YjM1OWJiY2U2ZDBhMiIsImVtYWlsIjoicmFkZWtAZ21haWwuY29tIiwiaWF0IjoxNjU1MDUyMDM4LCJleHAiOjE2NTUwNTU2Mzh9.5BVPRez1ow7xRADNCj1OW7bxezd7AWPKeRv6aXSBkss
 *        sid:
 *          type: string
 *          description: User's session Id auto-generated using UUID
 *          example: df00c626-12c2-491b-a21a-d8e76cd68725
 */
