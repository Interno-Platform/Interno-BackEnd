const db = require("../../config/database");
const createError = require("../../utils/createError");
const {
  sendCompanyApprovalEmail,
  sendCompanyRejectionEmail,
  sendInternshipApprovalEmail,
  sendInternshipRejectionEmail,
} = require("../emailServices/approval.emails");

const approveCompanyService = async (company_id, admin_id = null) => {
  // Get company details
  const [company] = await db.query(`SELECT * FROM companies WHERE id = ?`, [
    company_id,
  ]);

  if (company.length === 0) {
    throw createError("invalid company(id)", 404);
  }

  const companyEmail = company[0].email;
  const companyName = company[0].company_name;

  // Update company status
  const approveQuery = `
    UPDATE companies 
    SET approved = 1
    WHERE id = ?
  `;
  const [result] = await db.execute(approveQuery, [company_id]);

  if (result.affectedRows === 0) {
    throw createError("invalid company(id)", 404);
  }

  // Send approval email
  try {
    await sendCompanyApprovalEmail(companyEmail, companyName);
  } catch (emailError) {
    console.error("Error sending approval email:", emailError);
    // Don't throw - approval is still successful even if email fails
  }

  return { message: "Company has been approved successfully" };
};

const rejectCompanyService = async (
  company_id,
  rejectionReason,
  admin_id = null,
) => {
  // Validate inputs
  if (!rejectionReason || rejectionReason.trim().length === 0) {
    throw createError("Rejection reason is required", 400);
  }

  // Get company details
  const [company] = await db.query(`SELECT * FROM companies WHERE id = ?`, [
    company_id,
  ]);

  if (company.length === 0) {
    throw createError("invalid company(id)", 404);
  }

  const companyEmail = company[0].email;
  const companyName = company[0].company_name;

  // Update company status
  const rejectQuery = `
    UPDATE companies 
    SET approved = 2, rejection_reason = ?
    WHERE id = ?
  `;
  const [result] = await db.execute(rejectQuery, [rejectionReason, company_id]);

  if (result.affectedRows === 0) {
    throw createError("invalid company(id)", 404);
  }

  // Send rejection email
  try {
    await sendCompanyRejectionEmail(companyEmail, companyName, rejectionReason);
  } catch (emailError) {
    console.error("Error sending rejection email:", emailError);
    // Don't throw - rejection is still successful even if email fails
  }

  return { message: "Company has been rejected" };
};

const approvedCompanies = async () => {
  const query = `SELECT u.profile_picture ,companies.* FROM companies
  JOIN users u ON companies.user_id = u.id
   WHERE approved = ?`;
  const [result] = await db.execute(query, [1]);
  if (result.length === 0) {
    throw createError("there is no approved companies yet", 404);
  }

  const finalResult = result.map(({ approved, ...rest }) => rest);
  return finalResult;
};

const pendingCompanies = async () => {
  const query = `
  SELECT u.profile_picture ,companies.* FROM companies
  JOIN users u ON companies.user_id = u.id
   WHERE approved = ?`;
  const [result] = await db.execute(query, [0]);
  if (result.length === 0) {
    throw createError("there is no pending companies yet", 404);
  }
  const finalResult = result.map(({ approved, ...rest }) => rest);
  return finalResult;
};

const getRejectedCompanies = async () => {
  const query = `
  SELECT u.profile_picture, companies.* FROM companies
  JOIN users u ON companies.user_id = u.id
  WHERE approved = 2`;
  const [result] = await db.execute(query, []);
  if (result.length === 0) {
    throw createError("there are no rejected companies", 404);
  }
  const finalResult = result.map(({ approved, ...rest }) => rest);
  return finalResult;
};

const getTraineesService = async () => {
  const query = `SELECT * FROM trainees`;
  const [result] = await db.execute(query, [0]);
  if (result.length === 0) {
    throw createError("there is no trainees yet", 404);
  }
  console.log(result);

  return result;
};

const companyStatusService = async (company_id, status) => {
  const convertStatus = status === true ? 1 : 0;
  const query = `UPDATE companies SET is_active = ? WHERE id =?`;
  const [result] = await db.execute(query, [convertStatus, company_id]);
  if (result.affectedRows === 0) {
    throw createError("invalid company(id)", 404);
  }
  let message;
  if (convertStatus === 1) {
    message = { message: "company has activated successfully" };
  } else {
    message = { message: "company has disabled successfully" };
  }
  return message;
};

const changeInternshipStatus = async (
  company_id,
  status,
  internship_id,
  rejectionReason = null,
  admin_id = null,
) => {
  // Validate status
  const allowedStatus = ["active", "rejected"];
  if (!allowedStatus.includes(status)) {
    throw createError("Invalid status. Allowed: active, rejected", 400);
  }

  // For rejection, reason is required
  if (
    status === "rejected" &&
    (!rejectionReason || rejectionReason.trim().length === 0)
  ) {
    throw createError("Rejection reason is required", 400);
  }

  // Get internship details
  const [internship] = await db.query(
    `SELECT i.* FROM internships i WHERE i.id = ? AND i.company_id = ?`,
    [internship_id, company_id],
  );

  if (internship.length === 0) {
    throw createError("invalid internship(id) or company(id)", 404);
  }

  // Get company details for email
  const [company] = await db.query(`SELECT * FROM companies WHERE id = ?`, [
    company_id,
  ]);

  if (company.length === 0) {
    throw createError("invalid company(id)", 404);
  }

  const companyEmail = company[0].email;
  const companyName = company[0].company_name;
  const internshipName = internship[0].name || internship[0].title;

  // Update internship status
  if (status === "active") {
    const query = `
      UPDATE internships 
      SET status = ?, rejection_reason = NULL
      WHERE id = ? AND company_id = ?
    `;
    const [result] = await db.execute(query, [
      status,
      internship_id,
      company_id,
    ]);

    if (result.affectedRows === 0) {
      throw createError("Failed to update internship status", 400);
    }

    // Send approval email
    try {
      await sendInternshipApprovalEmail(
        companyEmail,
        companyName,
        internshipName,
      );
    } catch (emailError) {
      console.error("Error sending internship approval email:", emailError);
    }

    return { message: "Internship has been approved successfully" };
  } else {
    // Rejected
    const query = `
      UPDATE internships 
      SET status = ?, rejection_reason = ?
      WHERE id = ? AND company_id = ?
    `;
    const [result] = await db.execute(query, [
      status,
      rejectionReason,
      internship_id,
      company_id,
    ]);

    if (result.affectedRows === 0) {
      throw createError("Failed to update internship status", 400);
    }

    // Send rejection email
    try {
      await sendInternshipRejectionEmail(
        companyEmail,
        companyName,
        internshipName,
        rejectionReason,
      );
    } catch (emailError) {
      console.error("Error sending internship rejection email:", emailError);
    }

    return { message: "Internship has been rejected successfully" };
  }
};

const getPendingInternships = async () => {
  const [result] = await db.query(
    `SELECT 
      internships.id,
      internships.title,
      companies.company_name,
      companies.email,
  JSON_ARRAYAGG(skills.name) AS skills
  FROM internships
  JOIN companies 
   ON internships.company_id = companies.id
  JOIN skills 
   ON JSON_CONTAINS(internships.required_skills, CAST(skills.id AS JSON))
    WHERE internships.status = ?
    GROUP BY internships.id`,
    ["pending"],
  );

  if (result.length === 0) {
    throw createError(`no pending internships`, 404);
  }
  return { data: result };
};

module.exports = {
  approveCompanyService,
  rejectCompanyService,
  approvedCompanies,
  companyStatusService,
  pendingCompanies,
  getRejectedCompanies,
  getTraineesService,
  changeInternshipStatus,
  getPendingInternships,
};
