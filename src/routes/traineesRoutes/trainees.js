const express = require("express");
const router = express.Router();
const upload = require("../../utils/upload")
const {
  submitQuizAnswersController,
  submitExamSolutionController,
  markQuizCompletedController,
  getQuizStatusController,
  getTraineeScoresController,
  getTraineeSkillScoreController,
  getTraineeProgressController,
} = require("../../controllers/traineesControllers/traineesQuizSubmission.controller");
const {
  insertSkills,
  getAllTraineerSkillsController
} = require("../../controllers/traineesControllers/traineesControllers");

router.post(
  "/insert-skills/:trainee_id",
  upload.single("cv_file"),
  insertSkills,
);
router.get(
  "/skills/:trainee_id",
  getAllTraineerSkillsController,
);


// Quiz submission routes
router.post("/submit-quiz-answers", submitQuizAnswersController);
router.post("/submit-exam-solution", submitExamSolutionController);
router.post("/mark-quiz-completed", markQuizCompletedController);

// Get status and scores
router.get("/quiz-status/:traineeId/:examId", getQuizStatusController);
router.get("/trainee-scores/:traineeId", getTraineeScoresController);
router.get("/skill-scores/:traineeId/:skillId", getTraineeSkillScoreController);
router.get("/trainee-progress/:traineeId", getTraineeProgressController);

module.exports = router;
