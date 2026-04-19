const express = require("express");
const { getAllSkillsController } = require("../../controllers/traineesControllers/traineesControllers");
const router = express.Router();

router.get ("/get-skills",getAllSkillsController)

module.exports = router