const db = require("../../config/database");
const createError = require("../../utils/createError");
const {
  addSkillsToTrainee,
  getAllSkills,
  getAllTraineerSkills,
} = require("../skillsServices/skills.services");

const parseSkillsValue = (skills) => {
  if (Array.isArray(skills)) {
    return skills;
  }

  if (typeof skills === "string") {
    try {
      const parsedSkills = JSON.parse(skills);
      if (Array.isArray(parsedSkills)) {
        return parsedSkills;
      }
    } catch (_) {
      return null;
    }
  }

  return null;
};

const postSkills = async (user_id, skills, cvFileUrl = null) => {
  const parsedSkills = parseSkillsValue(skills);

  if (!parsedSkills || parsedSkills.length === 0) {
    throw createError("skills must be a non-empty array", 400);
  }

  const stringfySkills = JSON.stringify(parsedSkills);

  const updateQuery = `UPDATE trainees SET skills = ?, cv_file = COALESCE(?, cv_file) Where id = ?`;

  const [result] = await db.execute(updateQuery, [
    stringfySkills,
    cvFileUrl,
    user_id,
  ]);
  if (result.affectedRows === 0) {
    throw createError("invalid trainee(id)", 400);
  }
  const query = `SELECT * FROM trainees Where id = ?`;
  const [row] = await db.execute(query, [user_id]);

  await addSkillsToTrainee(row[0].id, parsedSkills);
  return {
    message: "skills has inserted successfully",
  };
};

module.exports = { postSkills, getAllSkills, getAllTraineerSkills };
