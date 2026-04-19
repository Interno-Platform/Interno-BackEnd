const express = require("express");
const usersRouter = express.Router();
const {
  usersController,
  verifyCode,
  login,
} = require("../../controllers/usersControllers/userController");
const upload = require("../../utils/upload");
usersRouter.post("/register", upload.single("profile_picture"), usersController);
usersRouter.get("/verify-code/:user_id/:token", verifyCode);
usersRouter.post("/login", login);

module.exports = usersRouter;
 