const express = require("express");
const router = express.Router();
const {
  applyForInternshipController,
  getTraineeApplicationsController,
  getInternshipApplicationsController,
  getMyCompanyApplicationsController,
  getInternshipTechExamController,
  reviewApplicationController,
  deleteInternship,
} = require("../../controllers/internshipControllers/internshipApplications.controller");
const {
  questionsBySkillsController,
} = require("../../controllers/traineesControllers/traineesControllers");

// Trainee routes
router.post("/apply", applyForInternshipController);
router.post("/questions", questionsBySkillsController);

router.get("/trainee/:traineeId/", getTraineeApplicationsController);

// Company/Recruiter routes
router.get("/company/applications", getMyCompanyApplicationsController);
router.get("/company/:companyId/", getInternshipApplicationsController);
router.get("/:internshipId/tech-exam", getInternshipTechExamController);
router.get("/tech-exam/:internshipId", getInternshipTechExamController);

router.delete("/company/delete/:internshipId/", deleteInternship);

router.put("/:applicationId/review", reviewApplicationController);

module.exports = router;
