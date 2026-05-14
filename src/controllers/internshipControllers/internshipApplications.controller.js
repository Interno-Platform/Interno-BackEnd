const asyncHandler = require("express-async-handler");
const createError = require("../../utils/createError");
const internshipAppServices = require("../../Services/internshipServices/internshipApplications.services");
const { sendEvent } = require("../../config/kafka");

const applyForInternshipController = asyncHandler(async (req, res) => {
  const { traineeId, internshipId } = req.body;
  const { coverLetter } = req.body;

  if (!traineeId || !internshipId) {
    throw createError("traineeId and internshipId are required", 400);
  }

  if (traineeId !== req.user.id) {
    throw createError("You are not authorized to apply for this internship", 403);
  }

  const result = await internshipAppServices.applyForInternship(
    traineeId,
    internshipId,
    coverLetter,
  );

  await sendEvent("internship-applications", {
    traineeId: result.traineeId,
    internshipId: result.internshipId,
    status: result.status,
    timestamp: new Date().toISOString(),
  });
  res.status(201).json(result);
});

// get internship applications for a trainee
const getTraineeApplicationsController = asyncHandler(async (req, res) => {
  const { traineeId } = req.params;

  if (!traineeId) {
    throw createError("traineeId is required", 400);
  }

  const applications =
    await internshipAppServices.getTraineeApplications(traineeId);

  res.json({
    message: "Applications retrieved successfully",
    count: applications.length,
    data: applications,
  });
});
// get all company applications (for company/ HR)
const getInternshipApplicationsController = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!companyId) {
    throw createError("companyId is required", 400);
  }

  if (role !== "company") {
    throw createError("Only company users can access this endpoint", 403);
  }

  const applications =
    await internshipAppServices.getInternshipApplications(companyId, userId);

  res.json({
    message: "Applications retrieved successfully",
    count: applications.length,
    data: applications,
  });
});

// get all applications for the logged-in company (no companyId in params)
const getMyCompanyApplicationsController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (role !== "company") {
    throw createError("Only company users can access this endpoint", 403);
  }

  const applications =
    await internshipAppServices.getInternshipApplications(null, userId);

  res.json({
    message: "Applications retrieved successfully",
    count: applications.length,
    data: applications,
  });
});

const getInternshipTechExamController = asyncHandler(async (req, res) => {
  const { internshipId } = req.params;

  if (!internshipId) {
    throw createError("internshipId is required", 400);
  }

  const techExam =
    await internshipAppServices.getInternshipTechExam(internshipId);

  res.json({
    message: "Tech exam retrieved successfully",
    data: techExam,
  });
});

const reviewApplicationController = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status, notes } = req.body;
  const reviewedBy = req.user?.id;

  if (!applicationId) {
    throw createError("applicationId is required", 400);
  }

  if (!status) {
    throw createError("status is required (accepted or rejected)", 400);
  }

  if (!reviewedBy) {
    throw createError("User authentication required", 401);
  }

  const result = await internshipAppServices.reviewApplication(
    applicationId,
    status,
    reviewedBy,
    notes,
  );

  res.json(result);
});

const deleteInternship = asyncHandler(async (req, res) => {
  const { internshipId } = req.params;

  if (!internshipId) {
    throw createError("internshipId is required", 400);
  }
  const result = await internshipAppServices.deleteInternship(internshipId);

  res.json(result);
});

module.exports = {
  applyForInternshipController,
  getTraineeApplicationsController,
  getInternshipApplicationsController,
  getMyCompanyApplicationsController,
  getInternshipTechExamController,
  reviewApplicationController,
  deleteInternship,
};
