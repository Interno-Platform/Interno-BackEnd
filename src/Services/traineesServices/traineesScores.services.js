const db = require("../../config/database");
const createError = require("../../utils/createError");

const DEFAULT_PASSING_SCORE = 60;

const normalizePassingScore = (passingScore) => {
  const parsedScore = Number(passingScore);

  if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
    throw createError("passingScore must be a number between 0 and 100", 400);
  }

  return parsedScore;
};

const getInternshipPassingScore = async (internshipId) => {
  if (!internshipId) {
    throw createError("internshipId is required", 400);
  }

  const [exams] = await db.query(
    `SELECT exam_passing_score
     FROM internship_exams
     WHERE internship_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [internshipId],
  );

  if (exams.length === 0) {
    throw createError("Technical exam not found for this internship", 404);
  }

  return normalizePassingScore(
    exams[0].exam_passing_score ?? DEFAULT_PASSING_SCORE,
  );
};

// Calculate and update trainee score for a skill based on quiz answers
const updateTraineeScore = async (traineeId, skillId, internshipId = null) => {
  const internshipFilter = internshipId ? "AND q.internship_id = ?" : "";
  const queryParams = internshipId
    ? [traineeId, skillId, internshipId]
    : [traineeId, skillId];

  const query = `
    SELECT
      COUNT(*) as total_questions,
      COALESCE(SUM(opt.is_correct), 0) as correct_answers
    FROM trainees_answers ta
    JOIN questions q ON ta.question_id = q.id
    JOIN options opt ON ta.selected_option_id = opt.id
    WHERE ta.trainee_id = ? AND q.skill_id = ?
      ${internshipFilter}
  `;

  const [result] = await db.query(query, queryParams);

  if (!result || result.length === 0) {
    throw createError("No quiz data found for this trainee and skill", 404);
  }

  const totalQuestions = Number(result[0].total_questions || 0);
  const correctAnswers = Number(result[0].correct_answers || 0);
  const scorePercentage =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const upsertQuery = `
    INSERT INTO trainees_scores (trainee_id, internship_id, skill_id, total_questions, correct_answers, score_percentage)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      total_questions = ?,
      correct_answers = ?,
      score_percentage = ?,
      last_assessed = CURRENT_TIMESTAMP
  `;

  const [updateResult] = await db.query(upsertQuery, [
    traineeId,
    internshipId,
    skillId,
    totalQuestions,
    correctAnswers,
    parseFloat(scorePercentage.toFixed(2)),
    totalQuestions,
    correctAnswers,
    parseFloat(scorePercentage.toFixed(2)),
  ]);

  if (updateResult.affectedRows === 0) {
    throw createError("Failed to update trainee score", 500);
  }

  return {
    traineeId,
    internshipId,
    skillId,
    totalQuestions,
    correctAnswers,
    scorePercentage: scorePercentage.toFixed(2),
  };
};

// Calculate and update scores for all skills assigned to a trainee in an internship
const updateAllTraineeScores = async (traineeId, internshipId) => {
  if (!internshipId) {
    throw createError("internshipId is required", 400);
  }

  const [skills] = await db.query(
    `SELECT DISTINCT q.skill_id
     FROM trainees_skills tsk
     JOIN questions q ON q.skill_id = tsk.skill_id
     WHERE tsk.trainee_id = ?
       AND q.internship_id = ?`,
    [traineeId, internshipId],
  );

  if (skills.length === 0) {
    throw createError("No skills found for this trainee and internship", 404);
  }

  const scores = [];

  for (const skill of skills) {
    scores.push(await updateTraineeScore(traineeId, skill.skill_id, internshipId));
  }

  return scores;
};

// Get all scores for a trainee
const getTraineeScores = async (traineeId) => {
  const query = `
    SELECT
      ts.id,
      ts.internship_id,
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
      ts.internship_id,
      ts.skill_id,
      s.name as skill_name,
      ts.total_questions,
      ts.correct_answers,
      ts.score_percentage,
      ts.last_assessed
    FROM trainees_scores ts
    JOIN skills s ON ts.skill_id = s.id
    WHERE ts.trainee_id = ? AND ts.skill_id = ?
    ORDER BY ts.last_assessed DESC
    LIMIT 1
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

// Get progress for each trainee skill, including unanswered skills
const getTraineeSkillsProgress = async (traineeId, internshipId) => {
  const normalizedPassingScore = await getInternshipPassingScore(internshipId);

  const query = `
    SELECT
      s.id AS skill_id,
      s.name AS skill_name,
      COUNT(DISTINCT q.id) AS total_questions,
      COUNT(DISTINCT ta.question_id) AS answered_questions,
      COALESCE(ts.correct_answers, 0) AS correct_answers,
      COALESCE(ts.score_percentage, 0) AS score_percentage,
      ts.last_assessed
    FROM trainees_skills tsk
    JOIN skills s ON tsk.skill_id = s.id
    JOIN questions q
      ON q.skill_id = s.id
      AND q.internship_id = ?
    LEFT JOIN trainees_answers ta
      ON ta.question_id = q.id
      AND ta.trainee_id = tsk.trainee_id
    LEFT JOIN trainees_scores ts
      ON ts.trainee_id = tsk.trainee_id
      AND ts.internship_id = ?
      AND ts.skill_id = s.id
    WHERE tsk.trainee_id = ?
    GROUP BY
      s.id,
      s.name,
      ts.correct_answers,
      ts.score_percentage,
      ts.last_assessed
    ORDER BY s.name
  `;

  const [skills] = await db.query(query, [
    internshipId,
    internshipId,
    traineeId,
  ]);

  if (skills.length === 0) {
    throw createError("No skills found for this trainee and internship", 404);
  }

  const data = skills.map((skill) => {
    const totalQuestions = Number(skill.total_questions || 0);
    const answeredQuestions = Number(skill.answered_questions || 0);
    const scorePercentage = Number(skill.score_percentage || 0);
    const hasAnswers = answeredQuestions > 0;
    const isCompleted =
      totalQuestions > 0 && answeredQuestions >= totalQuestions;

    return {
      skillId: skill.skill_id,
      skillName: skill.skill_name,
      totalQuestions,
      answeredQuestions,
      remainingQuestions: Math.max(totalQuestions - answeredQuestions, 0),
      hasAnswers,
      isCompleted,
      correctAnswers: Number(skill.correct_answers || 0),
      scorePercentage: Number(scorePercentage.toFixed(2)),
      passingScore: normalizedPassingScore,
      passed: hasAnswers && scorePercentage >= normalizedPassingScore,
      canRetake: hasAnswers && scorePercentage < normalizedPassingScore,
      lastAssessed: skill.last_assessed,
    };
  });

  return {
    traineeId,
    internshipId,
    passingScore: normalizedPassingScore,
    totalSkills: data.length,
    completedSkills: data.filter((skill) => skill.isCompleted).length,
    answeredSkills: data.filter((skill) => skill.hasAnswers).length,
    passedSkills: data.filter((skill) => skill.passed).length,
    failedSkills: data.filter((skill) => skill.canRetake).length,
    skills: data,
  };
};

// Delete trainee answers and score rows for skills below the internship passing score
const deleteFailedSkillSubmissions = async (traineeId, internshipId) => {
  const progress = await getTraineeSkillsProgress(traineeId, internshipId);
  const normalizedPassingScore = progress.passingScore;
  const failedSkills = progress.skills.filter((skill) => skill.canRetake);

  if (failedSkills.length === 0) {
    return {
      traineeId,
      internshipId,
      passingScore: normalizedPassingScore,
      deletedSkillsCount: 0,
      deletedAnswersCount: 0,
      deletedScoresCount: 0,
      deletedSkills: [],
      message: "No failed skill submissions found",
    };
  }

  const failedSkillIds = failedSkills.map((skill) => skill.skillId);
  const placeholders = failedSkillIds.map(() => "?").join(",");
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [deletedAnswers] = await connection.query(
      `DELETE ta
       FROM trainees_answers ta
       JOIN questions q ON ta.question_id = q.id
       WHERE ta.trainee_id = ?
         AND q.internship_id = ?
         AND q.skill_id IN (${placeholders})`,
      [traineeId, internshipId, ...failedSkillIds],
    );

    const [deletedScores] = await connection.query(
      `DELETE FROM trainees_scores
       WHERE trainee_id = ?
         AND internship_id = ?
         AND skill_id IN (${placeholders})`,
      [traineeId, internshipId, ...failedSkillIds],
    );

    await connection.commit();

    return {
      traineeId,
      internshipId,
      passingScore: normalizedPassingScore,
      deletedSkillsCount: failedSkills.length,
      deletedAnswersCount: deletedAnswers.affectedRows,
      deletedScoresCount: deletedScores.affectedRows,
      deletedSkills: failedSkills.map((skill) => ({
        skillId: skill.skillId,
        skillName: skill.skillName,
        scorePercentage: skill.scorePercentage,
      })),
      message: "Failed skill submissions deleted successfully",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  updateTraineeScore,
  updateAllTraineeScores,
  getInternshipPassingScore,
  getTraineeScores,
  getTraineeSkillScore,
  getTraineeProgress,
  getTraineeSkillsProgress,
  deleteFailedSkillSubmissions,
};
