const { sendEvent } = require('../../config/kafka')
const {
  usersRegister,
  getAllUsersById,
  loginService,
} = require("../../Services/usersServices/users.services");
const asyncHandler = require("express-async-handler");
const createError = require("../../utils/createError");
const { activateEmail } = require("../../Services/emailServices/verify-code");

const usersController = asyncHandler(async (req, res, next) => {
  const register = await usersRegister(req)

  // send event to Kafka using data from request body
  try {
    await sendEvent('user-registrations', {
      email: req.body.email,
      name: req.body.name,
      role: req.body.role,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('Kafka event failed:', err.message)
  }

  res.json(register)
});

const verifyCode = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  await activateEmail(req.params);
  const user = await getAllUsersById(user_id);
  if (user.has_verified === 0) {
    throw createError("unExpected Error While Activate", 400);
  }
  res.json({ message: "email has been activated successfully" });
});

const login = asyncHandler(async (req, res) => {
  const userData = await loginService(req.body);
  res.json(userData)
});

module.exports = { usersController, verifyCode, login };