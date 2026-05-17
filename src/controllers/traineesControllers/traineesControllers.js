const asyncHandler = require("express-async-handler");
const createError = require("../../utils/createError");
const internshipQestionsBySkill = require("../../Services/traineesServices/traineeQuestions.services");
const imagekit = require("../../storage/stroage");
const path = require("path");
const db = require("../../config/database");
const { sendEvent } = require("../../config/kafka");
const {
  markQuizCompleted: markQuizCompletedService,
} = require("../../Services/traineesServices/quizSubmission.services");

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

  if (!trainee_id) {
    throw createError("trainee_id is required", 400);
  }

  if (trainee_id !== req.user.id) {
    throw createError(
      "You are not authorized to modify this trainee's skills",
      400,
    );
  }
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
  const [traineeRows] = await db.query(
    `SELECT email FROM trainees WHERE id = ? LIMIT 1`,
    [trainee_id],
  );

  const traineeEmail = traineeRows[0]?.email ?? null;

  // inside insertSkills after processing CV:
  await sendEvent("cv-uploads", {
    traineeId: req.params.trainee_id,
    traineeEmail,
    fileName: req.file?.originalname ?? null,
    timestamp: new Date().toISOString(),
  });
  res.json(result);
});

const questionsBySkillsController = asyncHandler(async (req, res) => {
  const { internship_id, skills } = req.body;
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    throw createError("skills must be a non-empty array", 400);
  }
  const traineeId = req.user && req.user.id ? req.user.id : null;
  const result = await internshipQestionsBySkill(
    internship_id,
    skills,
    traineeId,
  );
  // If no questions returned for the requested skills, mark quiz as completed
  if (result && result.data && Object.keys(result.data).length === 0) {
    // find an exam for this internship to mark completion
    const [examRows] = await db.query(
      `SELECT id FROM internship_exams WHERE internship_id = ? LIMIT 1`,
      [internship_id],
    );

    if (examRows.length > 0 && traineeId) {
      const markResult = await markQuizCompletedService(
        traineeId,
        examRows[0].id,
        internship_id,
      );
      return res.json({
        message: "Quiz completed",
        quizCompleted: true,
        data: markResult,
      });
    }

    return res.json({ message: "No questions available", data: result });
  }

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
