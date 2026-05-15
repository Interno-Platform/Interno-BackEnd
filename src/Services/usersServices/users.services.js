const db = require("../../config/database");
const createError = require("../../utils/createError");
const redis = require("../../config/redisConnection");
const { sentVerifyAccountEmail } = require("../emailServices/verify-code");
const generateJwt = require("../../utils/generateJWT");
const imagekit = require("../../storage/stroage");
const registerSchema = require("../../Validations/registerSchema");
const bycrypt = require("bcrypt");
const path = require("path");
const insertTraineeOrCompany = require("./insertTrainees-compaines");

const usersRegister = async (req) => {
  const { name, email, phone, role, password } = req.body;

  const validationResult = registerSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw createError(
      "invalid inputs",
      404,
      validationResult.error.flatten().fieldErrors,
    );
  }

  const findUserQuery = `SELECT id FROM users WHERE email = ?`;
  const [findSameUser] = await db.execute(findUserQuery, [email]);

  if (findSameUser.length > 0) {
    throw createError("this user already exist", 400);
  }

  let avatarUrl = "";
  if (req.file) {
    const buffer = req.file.buffer;
    const ext = path.extname(req.file.originalname) || ".jpg";
    const fileName = `${Date.now()}${ext}`;

    const uploaded = await imagekit.upload({ file: buffer, fileName });
    avatarUrl = uploaded.url;
  } else {
    console.log("No file received in request");
  }

  const saltRounds = 8;
  const hashedPassword = await bycrypt.hash(password, saltRounds);

  const usersQuery = `
    INSERT INTO users (
      name, email, password, role, phone, profile_picture
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [usersResult] = await db.execute(usersQuery, [
    name,
    email,
    hashedPassword,
    role,
    phone || null,
    avatarUrl,
  ]);

  if (!usersResult?.insertId) {
    throw new Error("User registration failed");
  }

  const userId = String(usersResult.insertId);

  // Build clean body to store - exclude empty profile_picture from req.body
  const { profile_picture, ...cleanReqBody } = req.body;

  const bodyToStore = {
    ...cleanReqBody,
    profile_picture: avatarUrl || "", // Always use the uploaded URL or empty string
  };

  if (!avatarUrl) {
    console.warn("No profile picture uploaded for user:", userId);
  } else {
    console.log("Profile picture uploaded successfully:", avatarUrl);
  }

  console.log("Body to store in Redis:", bodyToStore);

  Promise.allSettled([
    redis.set(userId, JSON.stringify({ body: bodyToStore })),
    sentVerifyAccountEmail(userId, email),
  ]).catch((err) => {
    console.error("post-register tasks failed:", err);
  });

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
  const extractedData = data[0] || {};
  const mergedData = {
    ...user,
    profile_picture: user.profile_picture,
    ...extractedData,
  };
  const { password, has_verified, user_id, ...filteredUser } = mergedData;
  return filteredUser;
};

const loginService = async (body) => {
  const { email, password } = body;
  const requiredFields = [];
  if (!email) requiredFields.push("email");
  if (!password) requiredFields.push("password");
  if (requiredFields.length > 0) {
    throw createError(
      `${requiredFields.map((e) => e).join(" - ")} are required`,
      400,
    );
  }

  const userQuery = `SELECT * FROM users WHERE email = ?`;
  const [user] = await db.execute(userQuery, [email]);
  const userLoginData = user[0];

  if (!userLoginData) throw createError("user does not exist", 400);

  const isMatch = await bycrypt.compare(password, userLoginData.password);
  if (!isMatch) throw createError("Invalid Credentials", 400);

  if (userLoginData.has_verified === 0) {
    throw createError("Please check your email to verify your account.", 400);
  }

  const detailsData = await formatRes(userLoginData);

  const user_id =detailsData.id?.toString();

  const token = generateJwt(
    { role: detailsData.role, id: user_id },
    process.env.secret_key,
  );

  const userData = {
    data: {
      token,
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

const updateUserProfile = async (user_id, role, data = {}, fileUrl = null) => {
  if (!user_id) throw createError("Unauthorized", 401);

  if (role === "company") {
    const [rows] = await db.query(
      `SELECT id FROM companies WHERE user_id = ? LIMIT 1`,
      [user_id],
    );
    if (!rows || rows.length === 0) throw createError("company not found", 404);
    const companyId = rows[0].id;

    const allowed = [
      "company_name",
      "registration_number",
      "email",
      "phone",
      "website",
      "address",
      "city",
      "country",
      "industry",
      "social_media_links",
      "employee_count",
      "annual_revenue",
      "founded_date",
      "is_active",
      "profile_picture",
    ];

    const updates = [];
    const values = [];

    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(data, k)) {
        let val = data[k];
        if (k === "social_media_links" && typeof val !== "string") {
          try {
            val = JSON.stringify(val);
          } catch (_) {}
        }
        updates.push(`${k} = ?`);
        values.push(val);
      }
    });

    if (fileUrl) {
      updates.push(`logo_url = ?`);
      values.push(fileUrl);
    }

    if (updates.length === 0) return { message: "no changes provided" };

    values.push(companyId);
    const sql = `UPDATE companies SET ${updates.join(", ")} WHERE id = ?`;
    await db.execute(sql, values);

    const [updated] = await db.query(
      `SELECT * FROM companies WHERE id = ? LIMIT 1`,
      [companyId],
    );
    return { data: updated[0] };
  }

  if (role === "trainee") {
    const [rows] = await db.query(
      `SELECT MIN(id) AS id FROM trainees WHERE user_id = ?`,
      [user_id],
    );
    const traineeId = rows[0]?.id;
    if (!traineeId) throw createError("trainee not found", 404);

    const allowed = [
      "name",
      "email",
      "phone",
      "gender",
      "city",
      "university",
      "major",
      "graduation_year",
      "skills",
      "cv_file",
      "profile_picture",
    ];
    const updates = [];
    const values = [];

    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(data, k)) {
        let val = data[k];
        if (k === "skills" && typeof val !== "string") {
          try {
            val = JSON.stringify(val);
          } catch (_) {}
        }
        updates.push(`${k} = ?`);
        values.push(val);
      }
    });

    if (fileUrl) {
      updates.push(`profile_picture = ?`);
      values.push(fileUrl);
    }

    if (updates.length === 0) return { message: "no changes provided" };

    values.push(traineeId);
    const sql = `UPDATE trainees SET ${updates.join(", ")} WHERE id = ?`;
    await db.execute(sql, values);

    const [updated] = await db.query(
      `SELECT * FROM trainees WHERE id = ? LIMIT 1`,
      [traineeId],
    );
    return { data: updated[0] };
  }

  throw createError("unsupported role", 400);
};

module.exports = {
  usersRegister,
  getAllUsersById,
  loginService,
  updateUserProfile,
};
