const express = require("express");
const {
  createInternships,
  getInternshipsController,
  addTechExamController,
} = require("../../controllers/companyControllers/companyControllers");
const router = express.Router();
const upload = require("../../utils/upload");


router.post("/create-internship", createInternships);
router.get("/internships", getInternshipsController);
router.post("/tech-exam",upload.single("task-file"), addTechExamController);
router.Access_Role = ["company","trainee"];
router.message;
module.exports = router;
