const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: { message: "Too Many Requests Please Wait a While" },
  standardHeaders: true,
  legacyHeaders: false,
});
module.exports = limiter