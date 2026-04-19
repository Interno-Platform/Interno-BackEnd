const asyncHandler = require("express-async-handler");
const createError = require("../../utils/createError");
const internshipQestionsBySkill = require("../../Services/traineesServices/traineeQuestions.services");
const imagekit = require("../../storage/stroage");
const path = require("path");
const {
  postSkills,
  getAllSkills,
  getAllTraineerSkills,
} = require("../../Services/traineesServices/traineesSkills.services");

const parseSkillsInput = (skills) => {
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

const insertSkills = asyncHandler(async (req, res) => {
  const { trainee_id } = req.params;
  if (!req.body || !Object.keys(req.body).includes("skills")) {
    throw createError("skills is required", 400);
  }
  const parsedSkills = parseSkillsInput(req.body.skills);

  if (!parsedSkills || parsedSkills.length === 0) {
    throw createError("skills must be a non-empty array", 400);
  }

  let cvFileUrl = null;

  if (req.file) {
    const buffer = req.file.buffer;
    const ext = path.extname(req.file.originalname) || ".pdf";
    const fileName = `${Date.now()}${ext}`;

    const uploaded = await imagekit.upload({
      file: buffer,
      fileName,
    });

    cvFileUrl = uploaded.url;
  }

  const result = await postSkills(trainee_id, parsedSkills, cvFileUrl);
  res.json(result);
});

const questionsBySkillsController = asyncHandler(async (req, res) => {
  const { internship_id, skills } = req.body;
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    throw createError("skills must be a non-empty array", 400);
  }
  const result = await internshipQestionsBySkill(internship_id, skills);
  res.json(result);
});

const getAllSkillsController = asyncHandler(async (req, res) => {
  const result = await getAllSkills();
  res.json(result);
});

const getAllTraineerSkillsController = asyncHandler(async (req, res) => {
  const { trainee_id } = req.params;
  const result = await getAllTraineerSkills(trainee_id);
  res.json(result);
});

module.exports = {
  insertSkills,
  questionsBySkillsController,
  getAllSkillsController,
  getAllTraineerSkillsController,
};
