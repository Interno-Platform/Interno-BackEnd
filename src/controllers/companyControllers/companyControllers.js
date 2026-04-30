const expressAsyncHandler = require("express-async-handler");
const createError = require("../../utils/createError");
const {
  postInternship,
  getInternships,
  addTechnicalExam,
  postCompanySkills,
} = require("../../Services/CompanyServices/Company.Services");

const createInternships = expressAsyncHandler(async (req, res) => {
  const { company_id } = req.query;

  const result = await postInternship(req.body, company_id);
  res.json(result);
});

const getInternshipsController = expressAsyncHandler(async (req, res) => {
  const { company_id } = req.query;
  const user_id = req.user?.id;
  const internships = await getInternships(user_id);
  res.json(internships);
});

const addTechExamController = expressAsyncHandler(async (req, res) => {
  const buffer = req.file.buffer;
  const { company_id } = req.query;

  const result = await addTechnicalExam(buffer, company_id);
  res.json({ text: result });
});

const insertCompanySkillsController = expressAsyncHandler(async (req, res) => {
  const { company_id } = req.params;

  if (!req.body || !Object.keys(req.body).includes("skills")) {
    throw createError("skills is required", 400);
  }

  const result = await postCompanySkills(company_id, req.body.skills);
  res.json(result);
});

module.exports = {
  createInternships,
  getInternshipsController,
  addTechExamController,
  insertCompanySkillsController,
};
