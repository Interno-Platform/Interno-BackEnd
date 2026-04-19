const token = require("jsonwebtoken");
const generateJwt = (payload, secretKey) => {
  const userPayload = { role: payload.role ,id: payload.id};
  const genratedToken = token.sign(userPayload, secretKey);
  return genratedToken;
};
module.exports = generateJwt;
