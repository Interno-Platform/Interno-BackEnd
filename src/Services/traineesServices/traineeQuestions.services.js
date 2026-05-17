const db = require("../../config/database");
const {
  ensureQuestionsForInternship,
} = require("../skillsServices/skills.services");

const groupQuestionsBySkill = (rows) => {
  const questionsMap = {};

  rows.forEach((row) => {
    if (!questionsMap[row.id]) {
      questionsMap[row.id] = {
        question_id: row.id,
        question: row.question_text,
        skill_name: row.skill_name,
        exam_id: row.exam_id,
        options: [],
      };
    }

    if (row.option_text) {
      questionsMap[row.id].options.push({
        option_id: row.option_id,
        option_text: row.option_text,
      });
    }
  });

  const result = {};
  Object.values(questionsMap).forEach((question) => {
    if (!result[question.skill_name]) {
      result[question.skill_name] = [];
    }

    result[question.skill_name].push({
      question_id: question.question_id,
      question: question.question,
      options: question.options,
    });
  });

  return { data: { exam_id: rows[0]?.exam_id, ...result } };
};

const internshipQestionsBySkill = async (internshipId, skillIds, traineeId = null) => {
  const normalizedSkillIds = Array.isArray(skillIds)
    ? skillIds
        .map((skillId) => Number(skillId))
        .filter((skillId) => Number.isInteger(skillId) && skillId > 0)
    : [];

  if (normalizedSkillIds.length === 0) {
    return { data: {} };
  }

  // If traineeId provided, exclude skills the trainee already submitted answers for
  let filteredSkillIds = normalizedSkillIds;
  if (traineeId) {
    const placeholdersCheck = normalizedSkillIds.map(() => "?").join(", ");
    const answeredQuery = `
      SELECT DISTINCT q.skill_id
      FROM trainees_answers ta
      JOIN questions q ON ta.question_id = q.id
      WHERE ta.trainee_id = ?
        AND q.internship_id = ?
        AND q.skill_id IN (${placeholdersCheck})
    `;

    const [answeredRows] = await db.query(answeredQuery, [
      traineeId,
      internshipId,
      ...normalizedSkillIds,
    ]);

    const answeredSkillIds = new Set(answeredRows.map((r) => Number(r.skill_id)));
    filteredSkillIds = normalizedSkillIds.filter((id) => !answeredSkillIds.has(Number(id)));
  }

  if (filteredSkillIds.length === 0) {
    return { data: {} };
  }

  await ensureQuestionsForInternship(filteredSkillIds, internshipId);

  const placeholders = filteredSkillIds.map(() => "?").join(", ");
  const query = `
    SELECT q.id , ie.id as exam_id, q.question_text,o.id as option_id, o.option_text, s.name as skill_name
    FROM questions q
    JOIN options o ON q.id = o.question_id
    JOIN skills s ON q.skill_id = s.id 
    JOIN internship_exams ie ON ie.internship_id = ?
    WHERE q.internship_id = ?
      AND q.skill_id IN (${placeholders})
    ORDER BY s.name, q.id, o.id
  `;

  const [questions] = await db.query(query, [
    internshipId,
    internshipId,
    ...filteredSkillIds,
  ]);

  return groupQuestionsBySkill(questions);
};

module.exports = internshipQestionsBySkill;
