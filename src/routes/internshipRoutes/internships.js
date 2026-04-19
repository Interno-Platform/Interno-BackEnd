const express = require("express");
const router = express.Router();
const {
  applyForInternshipController,
  getTraineeApplicationsController,
  getInternshipApplicationsController,
  reviewApplicationController,
  deleteInternship
} = require("../../controllers/internshipControllers/internshipApplications.controller");
const { questionsBySkillsController } = require("../../controllers/traineesControllers/traineesControllers");

// Trainee routes
router.post("/apply", applyForInternshipController);
router.post("/questions", questionsBySkillsController);

router.get(
  "/trainee/:traineeId/",
  getTraineeApplicationsController,
);

// Company/Recruiter routes
router.get("/company/:internshipId/", getInternshipApplicationsController);

router.delete("/company/delete/:internshipId/", deleteInternship);


router.put(
  "/:applicationId/review",
  reviewApplicationController,
);

module.exports = router;
