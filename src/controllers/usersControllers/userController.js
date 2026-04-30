const { sendEvent } = require("../../config/kafka");
const {
  usersRegister,
  getAllUsersById,
  loginService,
} = require("../../Services/usersServices/users.services");
const {
  updateUserProfile,
} = require("../../Services/usersServices/users.services");
const asyncHandler = require("express-async-handler");
const createError = require("../../utils/createError");
const { activateEmail } = require("../../Services/emailServices/verify-code");

const usersController = asyncHandler(async (req, res, next) => {
  const register = await usersRegister(req);

  // send event to Kafka using data from request body
  try {
    await sendEvent("user-registrations", {
      email: req.body.email,
      name: req.body.name,
      role: req.body.role,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Kafka event failed:", err.message);
  }

  res.json(register);
});

const verifyCode = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const result = await activateEmail(req.params);

  if (result.success) {
    // Return HTML page instead of JSON
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(result.htmlPage);
  } else {
    throw createError("Error verifying email", 400);
  }
});

const login = asyncHandler(async (req, res) => {
  const userData = await loginService(req.body);
  res.json(userData);
});

module.exports = { usersController, verifyCode, login };

const updateProfile = asyncHandler(async (req, res) => {
  const user_id = req.user?.id;
  const role = req.user?.role;
  if (!user_id || !role) throw createError("Unauthorized", 401);

  let fileUrl = null;
  if (req.file) {
    const imagekit = require("../../storage/stroage");
    const path = require("path");
    const ext = path.extname(req.file.originalname) || "";
    const fileName = `${Date.now()}${ext}`;
    const uploaded = await imagekit.upload({ file: req.file.buffer, fileName });
    fileUrl = uploaded.url;
  }

  const result = await updateUserProfile(user_id, role, req.body, fileUrl);
  res.json(result);
});

module.exports.updateProfile = updateProfile;
