const asyncHandler = require("express-async-handler");
const createError = require("../../utils/createError");
const traineesScoresServices = require("../../Services/traineesServices/traineesScores.services");
const quizSubmissionServices = require("../../Services/traineesServices/quizSubmission.services");

const submitQuizAnswersController = asyncHandler(async (req, res) => {
  const { traineeId, answers } = req.body;

  if (!traineeId || !answers) {
    throw createError("traineeId and answers are required", 400);
  }

  const result = await quizSubmissionServices.submitQuizAnswers(
    traineeId,
    answers,
  );

  res.status(201).json(result);
});

const submitExamSolutionController = asyncHandler(async (req, res) => {
  const { traineeId, examId, codeSolution, language } = req.body;

  if (!traineeId || !examId || !codeSolution) {
    throw createError("traineeId, examId, and codeSolution are required", 400);
  }

  const result = await quizSubmissionServices.submitExamSolution(
    traineeId,
    examId,
    codeSolution,
    language,
  );

  res.status(201).json(result);
});

const markQuizCompletedController = asyncHandler(async (req, res) => {
  const { traineeId, examId, quizScore, internshipId } = req.body;

  if (!traineeId || !examId || quizScore === undefined) {
    throw createError("traineeId, examId, and quizScore are required", 400);
  }

  const result = await quizSubmissionServices.markQuizCompleted(
    traineeId,
    examId,
    quizScore,
    internshipId,
  );

  res.json(result);
});

const getQuizStatusController = asyncHandler(async (req, res) => {
  const { traineeId, examId } = req.params;

  if (!traineeId || !examId) {
    throw createError("traineeId and examId are required", 400);
  }

  const status = await quizSubmissionServices.getTraineeQuizStatus(
    traineeId,
    examId,
  );

  if (!status) {
    throw createError("Quiz submission not found", 404);
  }

  res.json({
    message: "Quiz status retrieved successfully",
    data: status,
  });
});

const getTraineeScoresController = asyncHandler(async (req, res) => {
  const { traineeId } = req.params;

  if (!traineeId) {
    throw createError("traineeId is required", 400);
  }

  const scores = await traineesScoresServices.getTraineeScores(traineeId);

  res.json({
    message: "Scores retrieved successfully",
    count: scores.length,
    data: scores,
  });
});

const getTraineeSkillScoreController = asyncHandler(async (req, res) => {
  const { traineeId, skillId } = req.params;

  if (!traineeId || !skillId) {
    throw createError("traineeId and skillId are required", 400);
  }

  const score = await traineesScoresServices.getTraineeSkillScore(
    traineeId,
    skillId,
  );

  res.json({
    message: "Skill score retrieved successfully",
    data: score,
  });
});

const getTraineeProgressController = asyncHandler(async (req, res) => {
  const { traineeId } = req.params;

  if (!traineeId) {
    throw createError("traineeId is required", 400);
  }

  const progress = await traineesScoresServices.getTraineeProgress(traineeId);

  res.json({
    message: "Trainee progress retrieved successfully",
    data: progress,
  });
});

module.exports = {
  submitQuizAnswersController,
  submitExamSolutionController,
  markQuizCompletedController,
  getQuizStatusController,
  getTraineeScoresController,
  getTraineeSkillScoreController,
  getTraineeProgressController,
};
