const asyncHandler = require("express-async-handler");
const createError = require("../../utils/createError");
const internshipAppServices = require("../../Services/internshipServices/internshipApplications.services");
const { sendEvent } = require('../../config/kafka')

const applyForInternshipController = asyncHandler(async (req, res) => {
  const { traineeId, internshipId } = req.body;
  const { coverLetter } = req.body;

  if (!traineeId || !internshipId) {
    throw createError("traineeId and internshipId are required", 400);
  }

  const result = await internshipAppServices.applyForInternship(
    traineeId,
    internshipId,
    coverLetter,
  );

// inside applyForInternshipController after saving to DB:
  await sendEvent('internship-applications', {
    traineeId: req.body.trainee_id,
    traineeName: trainee.name,
    traineeEmail: trainee.email,
    internshipId: req.body.internship_id,
    internshipTitle: internship.title,
    companyEmail: company.email,
    timestamp: new Date().toISOString()
  })
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
// get applications for an internship (for company/ HR)
const getInternshipApplicationsController = asyncHandler(async (req, res) => {
  const { internshipId } = req.params;

  if (!internshipId) {
    throw createError("internshipId is required", 400);
  }

  const applications =
    await internshipAppServices.getInternshipApplications(internshipId);

  res.json({
    message: "Applications retrieved successfully",
    count: applications.length,
    data: applications,
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
  reviewApplicationController,
  deleteInternship
};
