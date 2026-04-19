const db = require("../../config/database");
const createError = require("../../utils/createError");

const DEFAULT_QUESTIONS_PER_SKILL = 10;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const normalizeSkill = (skill) =>
  String(skill || "")
    .trim()
    .toLowerCase();

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

const toUniqueNormalizedSkills = (skills = []) => {
  const parsedSkills = parseSkillsInput(skills);

  if (!parsedSkills) {
    return [];
  }

  const seen = new Set();

  return parsedSkills
    .map((skill) => String(skill || "").trim())
    .filter(Boolean)
    .filter((skill) => {
      const normalized = normalizeSkill(skill);
      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
};

const extractJsonArray = (text) => {
  if (!text) {
    return null;
  }

  const cleaned = text.replace(/```json|```/gi, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : null;
  } catch (_) {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      return null;
    }

    try {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  }
};

const sanitizeAiQuestions = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const questionText = String(item?.question || "").trim();
      const options = Array.isArray(item?.options)
        ? item.options
            .map((option) => ({
              text: String(option?.text || "").trim(),
              isCorrect: Boolean(option?.is_correct),
            }))
            .filter((option) => option.text)
        : [];

      const correctOptionsCount = options.filter(
        (option) => option.isCorrect,
      ).length;

      if (!questionText || options.length < 2 || correctOptionsCount !== 1) {
        return null;
      }

      return {
        questionText,
        options,
      };
    })
    .filter(Boolean);
};

const generateQuestionsForSkill = async (skillName) => {
  if (!process.env.API_KEY) {
    throw createError("API_KEY is missing for Groq question generation", 500);
  }

  const prompt = `Generate ${DEFAULT_QUESTIONS_PER_SKILL} multiple-choice interview questions for the skill: ${skillName}.

Return ONLY valid JSON array with this exact format:
[
  {
    "question": "...",
    "options": [
      { "text": "...", "is_correct": true },
      { "text": "...", "is_correct": false },
      { "text": "...", "is_correct": false },
      { "text": "...", "is_correct": false }
    ]
  }
]

Rules:
- Exactly ${DEFAULT_QUESTIONS_PER_SKILL} questions.
- Exactly 4 options per question.
- Exactly 1 correct option per question.
- No markdown, no explanations, JSON only.`;

  try {
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      throw createError(
        `Groq API failed (${groqResponse.status}): ${errorText}`,
        502,
      );
    }

    const data = await groqResponse.json();

    const content = data?.choices?.[0]?.message?.content || "";

    const rawQuestions = extractJsonArray(content);

    const questions = sanitizeAiQuestions(rawQuestions);

    if (questions.length === 0) {
      throw createError(
        `AI returned invalid questions for skill: ${skillName}`,
        502,
      );
    }

    return questions;
  } catch (error) {
    if (error.status) {
      throw error;
    }

    throw createError(`Failed to generate questions: ${error.message}`, 502);
  }
};

const insertQuestionsForSkill = async (skillId, skillName) => {
  const [existingQuestions] = await db.query(
    "SELECT id FROM questions WHERE skill_id = ? LIMIT 1",
    [skillId],
  );

  if (existingQuestions.length > 0) {
    return;
  }

  try {
    const aiQuestions = await generateQuestionsForSkill(skillName);

    for (const [index, question] of aiQuestions.entries()) {
      const [questionResult] = await db.query(
        "INSERT INTO questions (skill_id, question_text) VALUES (?, ?)",
        [skillId, question.questionText],
      );

      const optionValues = question.options.map((option) => [
        questionResult.insertId,
        option.text,
        option.isCorrect,
      ]);

      await db.query(
        "INSERT INTO options (question_id, option_text, is_correct) VALUES ?",
        [optionValues],
      );
    }
  } catch (error) {
    throw error;
  }
};

// add skills in bulk to a trainee,
//  creating any new skills as needed, and generating questions for new skills or insert skills if comes from company without insert this to sepifec trainee but add the questions to the skill if not exist
const addSkillsToTrainee = async (traineeId, skills) => {
  const normalizedSkills = toUniqueNormalizedSkills(skills);

  if (normalizedSkills.length === 0) {
    throw createError("skills must contain at least one non-empty value", 400);
  }

  const placeholders = normalizedSkills.map(() => `LOWER(TRIM(?))`).join(", ");
  const [existing] = await db.query(
    `SELECT id, name FROM skills WHERE LOWER(TRIM(name)) IN (${placeholders})`,
    normalizedSkills,
  );

  const existingNames = existing.map((s) => s.name.toLowerCase().trim());
  const newSkills = normalizedSkills.filter(
    (s) => !existingNames.includes(s.toLowerCase().trim()),
  );

  let allSkills = [...existing];

  if (newSkills.length > 0) {
    const insertPlaceholders = newSkills.map(() => `(?)`).join(", ");

     await db.query(
      `INSERT INTO skills (name) VALUES ${insertPlaceholders}`,
      newSkills,
    );

    const newPlaceholders = newSkills.map(() => `LOWER(TRIM(?))`).join(", ");
    const [insertedSkillsRows] = await db.query(
      `SELECT id, name FROM skills WHERE LOWER(TRIM(name)) IN (${newPlaceholders})`,
      newSkills,
    );

    allSkills = [...allSkills, ...insertedSkillsRows];
  }

  const traineeSkillsPlaceholders = allSkills.map(() => `(?, ?)`).join(", ");
  const traineeSkillsValues = allSkills.flatMap((s) => [
    parseInt(traineeId),
    s.id,
  ]);

  await db.query(
    `INSERT IGNORE  INTO trainees_skills (trainee_id, skill_id) 
         VALUES ${traineeSkillsPlaceholders}
        `,
    traineeSkillsValues,
  );

  for (const skill of allSkills) {
    await insertQuestionsForSkill(skill.id, skill.name);
  }

  return allSkills;
};

//get all skills in the system, ordered by name
const getAllSkills = async () => {
  const [skills] = await db.query("SELECT id, name FROM skills ORDER BY name");
  return skills;
};

// get all skills for a specific trainee, ordered by name.
const getAllTraineerSkills = async (traineeId) => {
  const [skills] = await db.query("SELECT id, name FROM trainees_skills ts JOIN skills s ON ts.skill_id = s.id  WHERE trainee_id = ? ORDER BY name", [traineeId]);
  if (skills.length === 0) {
    throw createError("No skills found for this trainee", 404);
  }
  return skills;
};

module.exports = {
  addSkillsToTrainee,
  getAllSkills,
  getAllTraineerSkills,
};
