const sendEmail = require("./Email.services");
const createError = require("../../utils/createError");
const {
  verificationEmailTemplate,
  traineeWelcomeEmailTemplate,
  emailVerificationSuccessPageTrainee,
  emailVerificationSuccessPageCompany,
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
  await sendEmail(email, "Verify Your Account", emailTempalte);
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
    // Mark email as verified
    const activateQuery = `UPDATE users SET has_verified = ? WHERE id = ?`;
    await db.execute(activateQuery, [1, user_id]);
  }

  const userData = parseCachedData.body;
  const role = userData.role;

  // Insert trainee or company record
  await insertTraineeOrCompany({ ...userData, id: user_id });

  // Send welcome email only for trainees (not for companies - they're under review)
  if (role === "trainee") {
    const welcomeEmail = traineeWelcomeEmailTemplate(userData.name);
    await sendEmail(userData.email, "Welcome to Interno!", welcomeEmail);
  }

  // Return HTML page (different for trainee vs company)
  const htmlPage =
    role === "trainee"
      ? emailVerificationSuccessPageTrainee()
      : emailVerificationSuccessPageCompany();

  await redisClient.del(stringId);

  return {
    success: true,
    htmlPage: htmlPage,
    userRole: role,
  };
};

module.exports = { sentVerifyAccountEmail, activateEmail };
