const sendEmail = require("./Email.services");
const createError = require("../../utils/createError");
const {
  verificationEmailTemplate,
  welacomeEmailTemplate,
} = require("../../utils/email.template");
const crypto = require("crypto");
const insertTraineeOrCompany = require("../usersServices/insertTrainees-compaines");
const db = require("../../config/database");
const redisClient = require("../../config/redisConnection");

const sentVerifyAccountEmail = async (id, email) => {
  const verifyCode = crypto.randomBytes(32).toString("hex");
  const cachedBody = await redisClient.get(id);
  const parseData = JSON.parse(cachedBody);
  await redisClient.set(
    id,
    JSON.stringify({ ...parseData, activateCode: verifyCode }),
  );
  const emailTempalte = verificationEmailTemplate(id, verifyCode);
  await sendEmail(email, "verify Your Account", emailTempalte);
};

const activateEmail = async (params) => {
  const { user_id, token } = params;

  if (!user_id || !token) {
    throw createError("UnExpected verify link", 404);
  }
  const stringId = String(user_id);
  const cachedActivateLink = await redisClient.get(stringId);
  const parseCachedData = JSON.parse(cachedActivateLink);

  if (!parseCachedData) {
    throw createError(
      "expired activation link or user already activate account",
      400,
    );
  }
  const parsedLink = parseCachedData.activateCode;

  if (parsedLink && parsedLink === token) {
    const activateQuery = `Update users SET has_verified = ?  WHERE id= ?`;
    await db.execute(activateQuery, [1, user_id]);
  }

  await insertTraineeOrCompany({ ...parseCachedData.body, id: user_id });

  const welacomeEmail = welacomeEmailTemplate();

  await sendEmail(
    parseCachedData?.body.email,
    "welcome in Interno",
    welacomeEmail,
  );
  await redisClient.del(stringId);
};

module.exports = { sentVerifyAccountEmail, activateEmail };
