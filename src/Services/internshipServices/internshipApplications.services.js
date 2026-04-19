const db = require("../../config/database");
const createError = require("../../utils/createError");

// Apply for an internship
const applyForInternship = async (
  traineeId,
  internshipId,
  coverLetter = null,
) => {
  const traineeIdNumber = Number(traineeId);
  const internshipIdNumber = Number(internshipId);

  if (!Number.isInteger(traineeIdNumber) || traineeIdNumber <= 0) {
    throw createError("Invalid traineeId. It must be a positive integer", 400);
  }

  if (!Number.isInteger(internshipIdNumber) || internshipIdNumber <= 0) {
    throw createError(
      "Invalid internshipId. It must be a positive integer",
      400,
    );
  }

  const [traineeRows] = await db.query(
    "SELECT id FROM trainees WHERE id = ? LIMIT 1",
    [traineeIdNumber],
  );

  if (traineeRows.length === 0) {
    throw createError(`Trainee was not found`, 404);
  }

  const [internshipRows] = await db.query(
    "SELECT id FROM internships WHERE id = ? LIMIT 1",
    [internshipIdNumber],
  );

  if (internshipRows.length === 0) {
    throw createError(`Internship was not found`, 404);
  }

  const query = `
    INSERT INTO internship_applications (
      internship_id,
      trainee_id,
      cover_letter,
      reviewed_at
    )
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE 
      cover_letter = VALUES(cover_letter),
      reviewed_at = CURRENT_TIMESTAMP,
      applied_at = CURRENT_TIMESTAMP
  `;

  const [result] = await db.query(query, [
    internshipIdNumber,
    traineeIdNumber,
    coverLetter,
  ]);

  if (result.affectedRows === 0) {
    throw createError("Failed to apply for internship", 500);
  }

  return {
    message: "Application submitted successfully",
    internshipId: internshipIdNumber,
    traineeId: traineeIdNumber,
    status: "pending",
  };
};

// Get all applications for a trainee
const getTraineeApplications = async (traineeId) => {
  const query = `
    SELECT 
      ia.id,
      ia.internship_id,
      ia.status,
      ia.applied_at,
      ia.reviewed_at,
      i.title,
      i.description,
      c.company_name,
      ia.notes
    FROM internship_applications ia
    JOIN internships i ON ia.internship_id = i.id
    JOIN companies c ON i.company_id = c.id
    WHERE ia.trainee_id = ?
    ORDER BY ia.applied_at DESC
  `;

  const [applications] = await db.query(query, [traineeId]);
  return applications;
};

// Get all applications for an internship (for company review)
const getInternshipApplications = async (internshipId) => {
  const query = `
    SELECT 
      ia.id,
      ia.trainee_id,
      i.title,
      ia.status,
      ia.applied_at,
      ia.reviewed_at,
      ia.cover_letter,
      ia.notes,
      t.name,
      t.email,
      t.phone,
      t.university,
      t.major,
      t.cv_file,
      t.profile_picture
    FROM internship_applications ia
    JOIN trainees t ON ia.trainee_id = t.id
    JOIN internships i ON ia.internship_id = i.id
    WHERE ia.internship_id = ?
    ORDER BY ia.applied_at DESC
  `;

  const [applications] = await db.query(query, [internshipId]);
  return applications;
};

// Review application (accept/reject)
const reviewApplication = async (
  applicationId,
  status,
  reviewedBy,
  notes = null,
) => {
  if (!["accepted", "rejected"].includes(status)) {
    throw createError("Invalid status. Must be 'accepted' or 'rejected'", 400);
  }

  const query = `
    UPDATE internship_applications
    SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, notes = ?
    WHERE id = ?
  `;

  const [result] = await db.query(query, [
    status,
    reviewedBy,
    notes,
    applicationId,
  ]);

  if (result.affectedRows === 0) {
    throw createError("Application not found", 404);
  }

  return {
    message: `Application ${status} successfully`,
    applicationId,
    status,
  };
};

// Mark application as completed (after exam/quiz completion)
const markApplicationCompleted = async (traineeId, internshipId) => {
  const query = `
    UPDATE internship_applications
    SET status = 'completed'
    WHERE  internship_id = ?
  `;

  const [result] = await db.query(query, [internshipId]);

  if (result.affectedRows === 0) {
    throw createError("Application not found", 404);
  }

  return {
    message: "Application marked as completed",
    traineeId,
    internshipId,
  };
};

const deleteInternship = async (internshipId) => {
  const query = `
    DELETE FROM internships
    WHERE id = ?
  `;
  const [findInternship] = await db.query(
    `SELECT * FROM internships WHERE id = ?`,
    [internshipId],
  );
  if (findInternship.length === 0) {
    throw createError("Internship not found", 404);
  }

  const [result] = await db.query(query, [internshipId]);

  if (result.affectedRows === 0) {
    throw createError("Failed to delete internship", 500);
  }

  return {
    message: "Internship deleted successfully",
    internshipId,
  };
};
module.exports = {
  applyForInternship,
  getTraineeApplications,
  getInternshipApplications,
  reviewApplication,
  markApplicationCompleted,
  deleteInternship,
};
