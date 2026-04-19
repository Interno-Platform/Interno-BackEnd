const createError = require("../utils/createError");
const jwt = require("jsonwebtoken") 
const verifyJwt = (req, res, next) => {
  const findToken =
    req.headers["authorization"] || req.headers["Authorization"];
  const token = findToken?.split(" ")[1];

  const excludedPaths = ["/api/users/register", "/api/users/login", "/api/users/verify-code","/api/website/contact-us"];

  if (excludedPaths.some((url) => req.originalUrl.startsWith(url))) {
    return next();
  }

  if (!token) {
    return next(createError("Unauthorized", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.secret_key);
    req.user = decoded;
    next();
  } catch (error) {
    next(createError("Invalid or expired token", 401));
  }
};
module.exports = verifyJwt;
