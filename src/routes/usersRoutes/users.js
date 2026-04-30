const express = require("express");
const usersRouter = express.Router();
const {
  usersController,
  verifyCode,
  login,
} = require("../../controllers/usersControllers/userController");
const upload = require("../../utils/upload");
const {
  updateProfile,
} = require("../../controllers/usersControllers/userController");
usersRouter.post(
  "/register",
  upload.single("profile_picture"),
  usersController,
);
usersRouter.get("/verify-code/:user_id/:token", verifyCode);
usersRouter.post("/login", login);

usersRouter.put("/profile", upload.single("file"), updateProfile);

module.exports = usersRouter;
