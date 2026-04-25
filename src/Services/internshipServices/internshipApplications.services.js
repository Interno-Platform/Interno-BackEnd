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
      status,
      cover_letter
    )
    VALUES (?, ?, 'applied', ?)
    ON DUPLICATE KEY UPDATE 
      status = 'applied',
      cover_letter = VALUES(cover_letter),
      reviewed_at = NULL,
      reviewed_by = NULL,
      notes = NULL,
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
    status: "applied",
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

// Get applications for a specific company owned by the logged-in company user
const getInternshipApplications = async (companyId, userId) => {
  if (!userId) {
    throw createError("User authentication required", 401);
  }

  let companyIdNumber = null;

  if (companyId !== undefined && companyId !== null && companyId !== "") {
    companyIdNumber = Number(companyId);
    if (!Number.isInteger(companyIdNumber) || companyIdNumber <= 0) {
      throw createError("Invalid companyId. It must be a positive integer", 400);
    }
  }

  const [companyRows] = await db.query(
    `
      SELECT c.id
      FROM companies c
      JOIN users u ON u.id = c.user_id
      WHERE u.id = ?
        AND (? IS NULL OR c.id = ?)
      LIMIT 1
    `,
    [userId, companyIdNumber, companyIdNumber],
  );

  if (companyRows.length === 0) {
    throw createError(
      "This company does not belong to the logged-in user",
      403,
    );
  }

  const resolvedCompanyId = companyRows[0].id;

  const query = `
    SELECT 
      ia.id AS application_id,
      ia.internship_id,
      i.title AS internship_title,
      i.company_id,
      ia.trainee_id,
      ia.status,
      ia.applied_at,
      ia.reviewed_at,
      ia.cover_letter,
      ia.notes,
      t.name AS trainee_name,
      t.email AS trainee_email,
      t.phone AS trainee_phone,
      t.gender AS trainee_gender,
      t.city AS trainee_city,
      t.university AS trainee_university,
      t.major AS trainee_major,
      t.graduation_year AS trainee_graduation_year,
      t.skills AS trainee_skills,
      t.cv_file AS trainee_cv_file,
      t.profile_picture AS trainee_profile_picture,
      t.created_at AS trainee_created_at,
      t.updated_at AS trainee_updated_at,
      es.quiz_score,
      es.quiz_completed,
      es.quiz_submitted_at,
      es.code_solution AS submitted_code,
      es.code_language,
      es.code_submitted_at
    FROM internship_applications ia
    JOIN trainees t ON ia.trainee_id = t.id
    JOIN internships i ON ia.internship_id = i.id
    JOIN companies c ON i.company_id = c.id
    JOIN users u ON c.user_id = u.id
    LEFT JOIN (
      SELECT
        ie.internship_id,
        sub.trainee_id,
        sub.quiz_score,
        sub.quiz_completed,
        sub.quiz_submitted_at,
        sub.code_solution,
        sub.language AS code_language,
        sub.submitted_at AS code_submitted_at
      FROM internship_exams ie
      JOIN exam_submissions sub ON sub.exam_id = ie.id
      JOIN (
        SELECT
          ie2.internship_id,
          sub2.trainee_id,
          MAX(sub2.id) AS latest_submission_id
        FROM internship_exams ie2
        JOIN exam_submissions sub2 ON sub2.exam_id = ie2.id
        GROUP BY ie2.internship_id, sub2.trainee_id
      ) latest_sub
        ON latest_sub.latest_submission_id = sub.id
       AND latest_sub.internship_id = ie.internship_id
       AND latest_sub.trainee_id = sub.trainee_id
    ) es ON es.internship_id = ia.internship_id AND es.trainee_id = ia.trainee_id
    WHERE c.id = ?
      AND u.id = ?
    ORDER BY ia.applied_at DESC, ia.id DESC
  `;

  const [applications] = await db.query(query, [
    resolvedCompanyId,
    userId,
  ]);
  return applications;
};

// Get technical exam for an internship
const getInternshipTechExam = async (internshipId) => {
  const query = `
    SELECT 
      id,
      internship_id,
      exam_title,
      exam_description,
      requirements,
      expected_input,
      expected_output,
      programmingLanguage,
      created_at
    FROM internship_exams
    WHERE internship_id = ?
    LIMIT 1
  `;

  const [exams] = await db.query(query, [internshipId]);

  if (exams.length === 0) {
    throw createError("Tech exam not found for this internship", 404);
  }

  return exams[0];
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
  getInternshipTechExam,
  reviewApplication,
  markApplicationCompleted,
  deleteInternship,
};
