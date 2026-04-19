const createError = require("../utils/createError");

function AccessRole(message, ...roles) {
  return (req, res, next) => {

    const role = req.user.role;

    if (!roles.includes(role)) {
      next(
        createError(message || "you can not access to this request", 403),
      );
    }
    next();
  };
}
module.exports = AccessRole;
