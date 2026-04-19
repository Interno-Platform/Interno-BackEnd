const expressAsyncHandler = require("express-async-handler");
const {
  postInternship,
  getInternships,
  addTechnicalExam,
} = require("../../Services/CompanyServices/Company.Services");

const createInternships = expressAsyncHandler(async (req, res) => {
  const { company_id } = req.query;

  const result = await postInternship(req.body, company_id);
  res.json(result);
});

const getInternshipsController = expressAsyncHandler(async (req, res) => {
  const { company_id } = req.query;
  const internships = await getInternships(company_id);
  res.json(internships);
});

const addTechExamController = expressAsyncHandler(async (req, res) => {
  const buffer = req.file.buffer;
  const { company_id } = req.query;

  const result = await addTechnicalExam(buffer, company_id);
  res.json({ text: result });
});

module.exports = {
  createInternships,
  getInternshipsController,
  addTechExamController,
};
