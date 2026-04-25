const express = require("express");
const {
  createInternships,
  getInternshipsController,
  addTechExamController,
  insertCompanySkillsController,
} = require("../../controllers/companyControllers/companyControllers");
const router = express.Router();
const upload = require("../../utils/upload");

router.post("/create-internship", createInternships);
router.get("/internships", getInternshipsController);
router.post("/tech-exam", upload.single("task-file"), addTechExamController);
router.post("/insert-skills/:company_id", insertCompanySkillsController);
router.Access_Role = ["company", "trainee", "admin"];
router.message;
module.exports = router;
