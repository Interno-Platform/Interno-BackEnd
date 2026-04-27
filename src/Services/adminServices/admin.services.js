const db = require("../../config/database");
const createError = require("../../utils/createError");

const approveCompanyService = async (company_id) => {
  const approveQuery = `UPDATE companies SET approved = ? WHERE id = ?`;
  const [result] = await db.execute(approveQuery, [1, company_id]);
  if (result.affectedRows === 0) {
    throw createError("invalid company(id)", 404);
  }
  return { message: "company has approved successfully" };
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

const changeInternshipStatus = async (company_id, status, internship_id) => {
  const query = `UPDATE internships SET status = ? WHERE company_id =? AND id = ?`;
  const [result] = await db.execute(query, [status, company_id , internship_id]);

  if (result.affectedRows === 0) {
    throw createError("invalid company(id)", 404);
  }

  let message;
  if (status === "active") {
    message = { message: "internship has approved successfully" };
  } else {
    message = { message: "internship has rejected successfully" };
  }
  return message;
};

const getPendingInternships = async (company_id) => {
  const [findCompany] = await db.query(`SELECT * FROM companies WHERE id = ?`, [
    company_id,
  ]);

  if (findCompany.length === 0) {
    throw createError(`company(id) is invalid`, 404);
  }

  const [result] = await db.query(
    `SELECT * FROM internships WHERE company_id = ? And status = ?`,
    [company_id, "pending"],
  );

  if (result.length === 0) {
    throw createError(`no pending internships for this company`, 404);
  }
  return { data: result };
};

module.exports = {
  approveCompanyService,
  approvedCompanies,
  companyStatusService,
  pendingCompanies,
  getTraineesService,
  changeInternshipStatus,
  getPendingInternships,
};
