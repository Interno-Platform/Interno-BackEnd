const db = require("../../config/database");
const createError = require("../../utils/createError");
const redis = require("../../config/redisConnection");
const { sentVerifyAccountEmail } = require("../emailServices/verify-code");
const generateJwt = require("../../utils/generateJWT");
const imagekit = require("../../storage/stroage");
const registerSchema = require("../../Validations/registerSchema");
const bycrypt = require("bcrypt");
const path = require("path");

const usersRegister = async (req) => {
  const {
    name,
    email,
    phone,
    role,
    password
  } = req.body;
  const validationResult = registerSchema.safeParse(req.body);

  if (!validationResult.success) {
    throw createError(
      "invalid inputs",
      404,
      validationResult.error.flatten().fieldErrors,
    );
  }

  const usersQuery = `
    INSERT INTO users (
      name, 
      email, 
      password,
      role,
      phone, 
      profile_picture
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  // check if  user duplicated

  const findUserQuery = `SELECT email from users where email=?`;
  const [findSameUser] = await db.execute(findUserQuery, [email]);

  if (findSameUser.length > 0) {
    throw createError("this user already exist", 400);
  }

  let avatarUrl = "";

  if (req.file) {
    const buffer = req.file.buffer;
    const ext = path.extname(req.file.originalname) || ".jpg";
    const fileName = `${Date.now()}${ext}`;

    const uploaded = await imagekit.upload({
      file: buffer,
      fileName,
    });

    avatarUrl = uploaded.url;
  }
  const saltRounds = 10;
  const hashedPassword = await bycrypt.hash(password, saltRounds);

  const [usersResult] = await db.execute(usersQuery, [
    name,
    email,
    hashedPassword,
    role,
    phone || null,
    avatarUrl,
  ]);

  const [users] = await db.execute(
    `SELECT id, name, email, role, phone, profile_picture
       FROM users WHERE id = ?`,
    [usersResult.insertId],
  );

  if (!usersResult) {
    throw new Error("Trainee registration failed");
  }

  const stringId = String(usersResult.insertId);
  await redis.set(stringId, JSON.stringify({ body: req.body }));
  await sentVerifyAccountEmail(stringId, email);

  return {
    success: true,
    message:
      "Registration successful! Please check your email to verify your account.",
  };
};

const getDataByRole = async (userData) => {
  if (userData.role === "trainee") {
    
    const [user] = await db.query("SELECT * FROM trainees WHERE user_id = ?", [
      userData.id,
    ]);
    return user;
  } else {
    const [user] = await db.query("SELECT * FROM companies WHERE user_id = ?", [
      userData.id,
    ]);
    return user;
  }
};

const formatRes = async (user) => {
  const data = await getDataByRole(user);
  const extractedData = data[0];
  const mergedData = { ...user, ...extractedData };
  const { password, has_verified, user_id, ...filteredUser } = mergedData;

  return filteredUser;
  
};

const loginService = async (body) => {
  const { email, password } = body;
  const requiredFields = [];
  if (!email) requiredFields.push(email);
  if (!password) requiredFields.push(password);
  if (requiredFields.length > 0) {
    throw createError(
      `${requiredFields.map((e) => e).join(" - ")} are required`,
      400,
    );
  }

  const userQuery = `SELECT * FROM users WHERE email = ?`;

  const [user] = await db.execute(userQuery, [email]);

  const userLoginData = user[0];
  if (user.find((e) => e.has_verified === 0)) {
    throw createError("Please check your email to verify your account.", 400);
  }

  if (!userLoginData) throw createError("Invalid Credentials", 400);

  const isMatch = await bycrypt.compare(password, userLoginData.password);
  if (!isMatch) throw createError("Invalid Credentials", 400);

  const token = generateJwt(...user, process.env.secret_key);
  const detailsData = await formatRes(user[0]);
  const userData = {
    data: {
      token: token,
      user: { details: detailsData },
    },
  };
  return userData;
};

const getAllUsersById = async (id) => {
  const usersQuery = `SELECT * FROM users WHERE id = ?`;
  const [user] = await db.execute(usersQuery, [id]);
  console.log(user[0]);

  return user[0];
};

module.exports = { usersRegister, getAllUsersById, loginService };
