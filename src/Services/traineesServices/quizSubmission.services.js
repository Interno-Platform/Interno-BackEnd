const db = require("../../config/database");
const createError = require("../../utils/createError");
const {
  ensureQuestionsForInternship,
} = require("../skillsServices/skills.services");
const { updateTraineeScore } = require("./traineesScores.services");

const parseRequiredSkills = (requiredSkills) => {
  if (Array.isArray(requiredSkills)) {
    return requiredSkills;
  }

  if (typeof requiredSkills === "string") {
    try {
      const parsed = JSON.parse(requiredSkills);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  return [];
};

const getCanonicalSubmissionId = async (examId, traineeId) => {
  const [rows] = await db.query(
    `SELECT id
     FROM exam_submissions
     WHERE exam_id = ? AND trainee_id = ?
     ORDER BY id DESC`,
    [examId, traineeId],
  );

  if (rows.length === 0) {
    return null;
  }

  const canonicalId = rows[0].id;

  // Clean up historic duplicates and keep the newest submission row.
  if (rows.length > 1) {
    await db.query(
      `DELETE FROM exam_submissions
       WHERE exam_id = ? AND trainee_id = ? AND id <> ?`,
      [examId, traineeId, canonicalId],
    );
  }

  return canonicalId;
};

const getExamInternshipId = async (examId) => {
  const [exams] = await db.query(
    `SELECT internship_id FROM internship_exams WHERE id = ?`,
    [examId],
  );

  if (exams.length === 0) {
    throw createError("Exam not found", 404);
  }

  return exams[0].internship_id;
};

const ensureInternshipQuestions = async (internshipId) => {
  const [internships] = await db.query(
    `SELECT required_skills
     FROM internships
     WHERE id = ?
     LIMIT 1`,
    [internshipId],
  );

  if (internships.length === 0) {
    throw createError("Internship not found", 404);
  }

  const skillIds = parseRequiredSkills(internships[0].required_skills);
  await ensureQuestionsForInternship(skillIds, internshipId);
};

const getQuizScoreSummary = async (traineeId, internshipId) => {
  const [skills] = await db.query(
    `SELECT
       q.skill_id,
       MAX(ie.exam_passing_score) AS exam_passing_score,
       s.name AS skill_name,
       COUNT(DISTINCT q.id) AS total_questions,
       COUNT(DISTINCT ta.question_id) AS answered_questions,
       COALESCE(SUM(CASE WHEN opt.is_correct = 1 THEN 1 ELSE 0 END), 0) AS correct_answers
     FROM questions q
     JOIN skills s ON s.id = q.skill_id
     LEFT JOIN trainees_answers ta
       ON ta.question_id = q.id
       AND ta.trainee_id = ?
     LEFT JOIN options opt ON opt.id = ta.selected_option_id
     JOIN internship_exams ie ON ie.internship_id = q.internship_id
     WHERE q.internship_id = ?
     GROUP BY q.skill_id, s.name, ie.exam_passing_score
     ORDER BY s.name`,
    [traineeId, internshipId],
  );

  if (skills.length === 0) {
    throw createError("No quiz questions found for this internship", 404);
  }

  const skillScores = skills.map((skill) => {
    const totalQuestions = Number(skill.total_questions || 0);
    const answeredQuestions = Number(skill.answered_questions || 0);
    const correctAnswers = Number(skill.correct_answers || 0);
    const scorePercentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      skillId: skill.skill_id,
      skillName: skill.skill_name,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      scorePercentage: Number(scorePercentage.toFixed(2)),
    };
  });

  const totalQuestions = skillScores.reduce(
    (sum, skill) => sum + skill.totalQuestions,
    0,
  );
  const answeredQuestions = skillScores.reduce(
    (sum, skill) => sum + skill.answeredQuestions,
    0,
  );
  const correctAnswers = skillScores.reduce(
    (sum, skill) => sum + skill.correctAnswers,
    0,
  );
  const quizScore =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const passingScore = skills[0].exam_passing_score || 0;
  const passed = quizScore >= passingScore;
  return {
    quizScore,
    totalQuestions,
    passed,
    passingScore,
    answeredQuestions,
    correctAnswers,
    skillScores,
  };
};

const submitQuizAnswers = async (
  traineeId,
  examId,
  answers,
  internshipId = null,
) => {
  if (!examId) {
    throw createError("examId is required", 400);
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw createError("Answers must be a non-empty array", 400);
  }

  const examInternshipId = await getExamInternshipId(examId);
  const resolvedInternshipId = examInternshipId;
  await ensureInternshipQuestions(resolvedInternshipId);

  const validAnswers = answers.every(
    (answer) => answer.questionId && answer.selectedOptionId,
  );

  if (!validAnswers) {
    throw createError(
      "Each answer must have questionId and selectedOptionId",
      400,
    );
  }

  const questionIds = answers.map((answer) => answer.questionId);
  const uniqueQuestionIds = new Set(questionIds);

  if (uniqueQuestionIds.size !== questionIds.length) {
    throw createError("Duplicate questions are not allowed", 400);
  }

  // Get the skill associated with these questions BEFORE inserting
  const skillQuery = `
    SELECT DISTINCT q.skill_id, q.internship_id, s.name as skill_name
    FROM questions q
    JOIN skills s ON q.skill_id = s.id
    WHERE q.id IN (${answers.map(() => "?").join(",")})
  `;

  const [skillResults] = await db.query(skillQuery, questionIds);

  if (skillResults.length === 0) {
    throw createError("No valid questions found in submission", 400);
  }

  const [validQuestions] = await db.query(
    `SELECT COUNT(*) as count
     FROM questions
     WHERE id IN (${answers.map(() => "?").join(",")})`,
    questionIds,
  );

  if (Number(validQuestions[0].count) !== uniqueQuestionIds.size) {
    throw createError("One or more questions are invalid", 400);
  }

  const invalidInternshipQuestions = skillResults.some(
    (skill) => Number(skill.internship_id) !== Number(resolvedInternshipId),
  );

  if (invalidInternshipQuestions) {
    throw createError(
      "All submitted questions must belong to the selected internship",
      400,
    );
  }

  const [internshipQuestionCount] = await db.query(
    `SELECT COUNT(*) AS count
     FROM questions
     WHERE internship_id = ?`,
    [resolvedInternshipId],
  );

  if (Number(internshipQuestionCount[0].count) !== uniqueQuestionIds.size) {
    throw createError(
      "All internship quiz questions must be submitted in one request",
      400,
    );
  }

  // Check if trainee already submitted answers for any of these skills
  const submittedSkills = [
    ...new Map(
      skillResults.map((skill) => [
        `${skill.skill_id}:${skill.internship_id ?? "null"}`,
        {
          skillId: skill.skill_id,
          internshipId: skill.internship_id,
          skillName: skill.skill_name,
        },
      ]),
    ).values(),
  ];

  for (const submittedSkill of submittedSkills) {
    const [existingAnswers] = await db.query(
      `SELECT COUNT(*) as count
       FROM trainees_answers ta
       JOIN questions q ON ta.question_id = q.id
       WHERE ta.trainee_id = ?
         AND q.skill_id = ?
         AND q.internship_id <=> ?`,
      [traineeId, submittedSkill.skillId, submittedSkill.internshipId],
    );

    if (existingAnswers[0].count > 0) {
      throw createError(
        `You have already submitted answers for the skill "${submittedSkill.skillName}". Only one submission is allowed per skill.`,
        400,
      );
    }
  }

  // Insert all answers
  const values = answers.map((answer) => [
    traineeId,
    answer.questionId,
    answer.selectedOptionId,
  ]);

  const insertQuery = `
    INSERT INTO trainees_answers (trainee_id, question_id, selected_option_id)
    VALUES ?
  `;

  const [result] = await db.query(insertQuery, [values]);

  if (result.affectedRows === 0) {
    throw createError("Failed to submit quiz answers", 500);
  }

  // Update scores for each skill
  const scoreUpdates = [];
  for (const skillResult of submittedSkills) {
    if (skillResult.skillId) {
      const scoreUpdate = await updateTraineeScore(
        traineeId,
        skillResult.skillId,
        skillResult.internshipId,
      );
      scoreUpdates.push(scoreUpdate);
    }
  }

  const quizScoreSummary = await getQuizScoreSummary(
    traineeId,
    resolvedInternshipId,
  );

  const canonicalSubmissionId = await getCanonicalSubmissionId(
    examId,
    traineeId,
  );

  let submissionResult;

  if (canonicalSubmissionId) {
    [submissionResult] = await db.query(
      `UPDATE exam_submissions
       SET quiz_completed = TRUE,
           quiz_score = ?,
           quiz_submitted_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [quizScoreSummary.quizScore, canonicalSubmissionId],
    );
  } else {
    [submissionResult] = await db.query(
      `INSERT INTO exam_submissions (exam_id, trainee_id, quiz_completed, quiz_score, quiz_submitted_at)
       VALUES (?, ?, TRUE, ?, CURRENT_TIMESTAMP)`,
      [examId, traineeId, quizScoreSummary.quizScore],
    );
  }

  if (submissionResult.affectedRows === 0) {
    throw createError("Failed to update exam submission quiz score", 500);
  }

  const [examSubmissions] = await db.query(
    `SELECT id, exam_id, trainee_id, quiz_completed, quiz_score, quiz_submitted_at
     FROM exam_submissions
     WHERE exam_id = ? AND trainee_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [examId, traineeId],
  );

  const examSubmission = examSubmissions[0];

  return {
    message: "Quiz submitted and marked as completed successfully",
    examId,
    traineeId,
    internshipId: resolvedInternshipId,
    answersCount: result.affectedRows,
    examSubmission: {
      id: examSubmission.id,
      examId: examSubmission.exam_id,
      traineeId: examSubmission.trainee_id,
      score: Number(examSubmission.quiz_score || 0),
      quizCompleted: !!examSubmission.quiz_completed,
      quizSubmittedAt: examSubmission.quiz_submitted_at,
    },
    score: Number(examSubmission.quiz_score || 0),
    passed: quizScoreSummary.passed,
    passingScore: quizScoreSummary.passingScore,
    totalQuestions: quizScoreSummary.totalQuestions,
    answeredQuestions: quizScoreSummary.answeredQuestions,
    correctAnswers: quizScoreSummary.correctAnswers,
    skillScores: quizScoreSummary.skillScores,
    scoresUpdated: scoreUpdates,
  };
};

// Submit exam code solution
const submitExamSolution = async (
  traineeId,
  examId,
  codeSolution,
  language,
) => {
  if (!codeSolution || codeSolution.trim() === "") {
    throw createError("Code solution cannot be empty", 400);
  }

  if (!language) {
    throw createError("Programming language is required", 400);
  }

  // Check if exam exists and get internship_id
  const examQuery = `
    SELECT id, internship_id FROM internship_exams WHERE id = ?
  `;

  const [examResult] = await db.query(examQuery, [examId]);

  if (examResult.length === 0) {
    throw createError("Exam not found", 404);
  }

  const canonicalSubmissionId = await getCanonicalSubmissionId(
    examId,
    traineeId,
  );

  let result;

  if (canonicalSubmissionId) {
    [result] = await db.query(
      `UPDATE exam_submissions
       SET code_solution = ?, language = ?, submitted_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [codeSolution, language, canonicalSubmissionId],
    );
  } else {
    [result] = await db.query(
      `INSERT INTO exam_submissions (exam_id, trainee_id, code_solution, language)
       VALUES (?, ?, ?, ?)`,
      [examId, traineeId, codeSolution, language],
    );
  }

  if (result.affectedRows === 0) {
    throw createError("Failed to submit exam solution", 500);
  }

  return {
    message: "Exam solution submitted successfully",
    examId,
    traineeId,
    language,
  };
};

// Mark quiz as completed (after all quiz questions are answered)
const markQuizCompleted = async (traineeId, examId, internshipId = null) => {
  const resolvedInternshipId = await getExamInternshipId(examId);
  await ensureInternshipQuestions(resolvedInternshipId);
  const quizScoreSummary = await getQuizScoreSummary(
    traineeId,
    resolvedInternshipId,
  );
  const canonicalSubmissionId = await getCanonicalSubmissionId(
    examId,
    traineeId,
  );

  let result;

  if (canonicalSubmissionId) {
    [result] = await db.query(
      `UPDATE exam_submissions
       SET quiz_completed = TRUE,
           quiz_score = ?,
           quiz_submitted_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [quizScoreSummary.quizScore, canonicalSubmissionId],
    );
  } else {
    [result] = await db.query(
      `INSERT INTO exam_submissions (exam_id, trainee_id, quiz_completed, quiz_score, quiz_submitted_at)
       VALUES (?, ?, TRUE, ?, CURRENT_TIMESTAMP)`,
      [examId, traineeId, quizScoreSummary.quizScore],
    );
  }

  if (result.affectedRows === 0) {
    throw createError("Failed to mark quiz as completed", 500);
  }

  return {
    message: "Quiz marked as completed",
    examId,
    traineeId,
    internshipId: resolvedInternshipId,
    ...quizScoreSummary,
    quizCompleted: true,
  };
};
// Get trainee's quiz submission status
const getTraineeQuizStatus = async (traineeId, examId) => {
  const query = `
    SELECT 
      es.id,
      es.exam_id,
      es.trainee_id,
      es.code_solution,
      es.language,
      es.quiz_completed,
      es.quiz_score,
      es.quiz_submitted_at,
      es.submitted_at,
      ie.internship_id,
      ie.exam_passing_score
    FROM exam_submissions es
    JOIN internship_exams ie ON es.exam_id = ie.id
    WHERE es.trainee_id = ? AND es.exam_id = ?
    ORDER BY es.id DESC
    LIMIT 1
  `;

  const [result] = await db.query(query, [traineeId, examId]);

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0],
    passingScore: Number(result[0].exam_passing_score || 0),
  };
};

module.exports = {
  submitQuizAnswers,
  submitExamSolution,
  markQuizCompleted,
  getTraineeQuizStatus,
};
