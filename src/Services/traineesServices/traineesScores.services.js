const db = require("../../config/database");
const createError = require("../../utils/createError");

// Calculate and update trainee score for a skill based on quiz answers
const updateTraineeScore = async (traineeId, skillId) => {
  // Get all correctly answered questions for this trainee and skill
  const query = `
    SELECT 
      COUNT(*) as total_questions,
      SUM(CASE WHEN opt.is_correct = TRUE THEN 1 ELSE 0 END) as correct_answers
    FROM trainees_answers ta
    JOIN questions q ON ta.question_id = q.id
    JOIN options opt ON ta.selected_option_id = opt.id
    WHERE ta.trainee_id = ? AND q.skill_id = ?
  `;

  const [result] = await db.query(query, [traineeId, skillId]);

  if (!result || result.length === 0) {
    throw createError("No quiz data found for this trainee and skill", 404);
  }

  const totalQuestions = result[0].total_questions || 0;
  const correctAnswers = result[0].correct_answers || 0;
  const scorePercentage =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Upsert the score into trainees_scores table
  const upsertQuery = `
    INSERT INTO trainees_scores (trainee_id, skill_id, total_questions, correct_answers, score_percentage)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      total_questions = ?,
      correct_answers = ?,
      score_percentage = ?,
      last_assessed = CURRENT_TIMESTAMP
  `;

  const [updateResult] = await db.query(upsertQuery, [
    traineeId,
    skillId,
    totalQuestions,
    correctAnswers,
    scorePercentage.toFixed(2),
    totalQuestions,
    correctAnswers,
    scorePercentage.toFixed(2),
  ]);

  if (updateResult.affectedRows === 0) {
    throw createError("Failed to update trainee score", 500);
  }

  return {
    traineeId,
    skillId,
    totalQuestions,
    correctAnswers,
    scorePercentage: scorePercentage.toFixed(2),
  };
};

// Get all scores for a trainee
const getTraineeScores = async (traineeId) => {
  const query = `
    SELECT 
      ts.id,
      ts.skill_id,
      s.name as skill_name,
      ts.total_questions,
      ts.correct_answers,
      ts.score_percentage,
      ts.last_assessed
    FROM trainees_scores ts
    JOIN skills s ON ts.skill_id = s.id
    WHERE ts.trainee_id = ?
    ORDER BY ts.last_assessed DESC
  `;

  const [scores] = await db.query(query, [traineeId]);
  return scores;
};

// Get score for specific trainee and skill
const getTraineeSkillScore = async (traineeId, skillId) => {
  const query = `
    SELECT 
      ts.id,
      ts.trainee_id,
      ts.skill_id,
      s.name as skill_name,
      ts.total_questions,
      ts.correct_answers,
      ts.score_percentage,
      ts.last_assessed
    FROM trainees_scores ts
    JOIN skills s ON ts.skill_id = s.id
    WHERE ts.trainee_id = ? AND ts.skill_id = ?
  `;

  const [scores] = await db.query(query, [traineeId, skillId]);

  if (scores.length === 0) {
    throw createError("Score not found for this trainee and skill", 404);
  }

  return scores[0];
};

// Get overall trainee progress average score all skills
const getTraineeProgress = async (traineeId) => {
  const query = `
    SELECT 
      COUNT(*) as total_skills,
      AVG(score_percentage) as average_score,
      MIN(score_percentage) as lowest_score,
      MAX(score_percentage) as highest_score
    FROM trainees_scores
    WHERE trainee_id = ?
  `;

  const [progress] = await db.query(query, [traineeId]);

  if (!progress || progress.length === 0) {
    return {
      traineeId,
      totalSkills: 0,
      averageScore: 0,
      lowestScore: null,
      highestScore: null,
    };
  }

  return {
    traineeId,
    totalSkills: progress[0].total_skills,
    averageScore: progress[0].average_score
      ? parseFloat(progress[0].average_score).toFixed(2)
      : 0,
    lowestScore: progress[0].lowest_score
      ? parseFloat(progress[0].lowest_score).toFixed(2)
      : null,
    highestScore: progress[0].highest_score
      ? parseFloat(progress[0].highest_score).toFixed(2)
      : null,
  };
};

module.exports = {
  updateTraineeScore,
  getTraineeScores,
  getTraineeSkillScore,
  getTraineeProgress,
};
