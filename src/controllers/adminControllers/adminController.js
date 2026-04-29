const {
  approveCompanyService,
  rejectCompanyService,
  approvedCompanies,
  companyStatusService,
  pendingCompanies,
  getRejectedCompanies,
  getTraineesService,
  changeInternshipStatus,
  getPendingInternships,
} = require("../../Services/adminServices/admin.services");
const asyncHandler = require("express-async-handler");
const createError = require("../../utils/createError");

const approveCompany = asyncHandler(async (req, res) => {
  const { company_id } = req.params;
  const admin_id = req.user?.id; // Assuming auth middleware sets req.user
  const result = await approveCompanyService(company_id, admin_id);
  res.json(result);
});

const rejectCompany = asyncHandler(async (req, res) => {
  const { company_id } = req.params;
  const { reason } = req.body;
  const admin_id = req.user?.id; // Assuming auth middleware sets req.user

  if (!reason || reason.trim().length === 0) {
    throw createError("Rejection reason is required", 400);
  }

  const result = await rejectCompanyService(company_id, reason, admin_id);
  res.json(result);
});

const getAprrovedCompanies = asyncHandler(async (req, res) => {
  const result = await approvedCompanies();
  res.json(result);
});

const getPendingCompanies = asyncHandler(async (req, res) => {
  const result = await pendingCompanies();
  res.json(result);
});

const getRejectedCompaniesController = asyncHandler(async (req, res) => {
  const result = await getRejectedCompanies();
  res.json(result);
});

const changeCompanyStatus = asyncHandler(async (req, res) => {
  const { company_id } = req.params;
  if (!req.body || !Object.keys(req.body).includes("status")) {
    throw createError("status is required", 400);
  }
  const { status } = req.body;
  const result = await companyStatusService(company_id, status);
  res.json(result);
});

const changeinternshipstatus = asyncHandler(async (req, res) => {
  const { company_id, internship_id } = req.query;
  const { status, reason } = req.body;
  const admin_id = req.user?.id; // Assuming auth middleware sets req.user

  const allowedStatus = ["rejected", "active"];

  if (!req.body || !Object.keys(req.body).includes("status")) {
    throw createError("status is required", 400);
  }

  if (!allowedStatus.includes(status)) {
    throw createError("invalid status", 400);
  }

  if (!company_id || !internship_id) {
    throw createError("company_id and internship_id are required", 400);
  }

  // Reason is required for rejection
  if (status === "rejected" && (!reason || reason.trim().length === 0)) {
    throw createError("Rejection reason is required", 400);
  }

  const result = await changeInternshipStatus(
    company_id,
    status,
    internship_id,
    reason,
    admin_id,
  );
  res.json(result);
});

const getTraineesForAdmin = asyncHandler(async (req, res) => {
  const result = await getTraineesService();
  res.json(result);
});

const getPendingInternshipsController = asyncHandler(async (req, res) => {
  const result = await getPendingInternships();
  res.json(result);
});

module.exports = {
  approveCompany,
  rejectCompany,
  getAprrovedCompanies,
  changeCompanyStatus,
  getPendingCompanies,
  getRejectedCompaniesController,
  getTraineesForAdmin,
  changeinternshipstatus,
  getPendingInternshipsController,
};
