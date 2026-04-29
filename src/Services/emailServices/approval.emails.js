const sendEmail = require("./Email.services");
const {
  companyApprovalEmailTemplate,
  companyRejectionEmailTemplate,
  internshipApprovalEmailTemplate,
  internshipRejectionEmailTemplate,
  contactUsEmailTemplate,
} = require("../../utils/email.template");

/**
 * Send approval email when admin approves a company
 * @param {string} companyEmail - Company email address
 * @param {string} companyName - Company name
 */
const sendCompanyApprovalEmail = async (companyEmail, companyName) => {
  try {
    const emailTemplate = companyApprovalEmailTemplate(companyName);
    const result = await sendEmail(
      companyEmail,
      "Welcome to Interno — Your Account has been Approved!",
      emailTemplate,
    );
    return result;
  } catch (error) {
    console.error("Error sending company approval email:", error);
    throw error;
  }
};

/**
 * Send rejection email when admin rejects a company
 * @param {string} companyEmail - Company email address
 * @param {string} companyName - Company name
 * @param {string} rejectionReason - Reason for rejection
 */
const sendCompanyRejectionEmail = async (
  companyEmail,
  companyName,
  rejectionReason,
) => {
  try {
    const emailTemplate = companyRejectionEmailTemplate(
      companyName,
      rejectionReason,
    );
    const result = await sendEmail(
      companyEmail,
      "Your Account Registration Was Not Approved",
      emailTemplate,
    );
    return result;
  } catch (error) {
    console.error("Error sending company rejection email:", error);
    throw error;
  }
};

/**
 * Send approval email for internship/training program
 * @param {string} companyEmail - Company email address
 * @param {string} companyName - Company name
 * @param {string} internshipName - Internship/training program name
 */
const sendInternshipApprovalEmail = async (
  companyEmail,
  companyName,
  internshipName,
) => {
  try {
    const emailTemplate = internshipApprovalEmailTemplate(
      companyName,
      internshipName,
    );
    const result = await sendEmail(
      companyEmail,
      "Your Training Has Been Approved",
      emailTemplate,
    );
    return result;
  } catch (error) {
    console.error("Error sending internship approval email:", error);
    throw error;
  }
};

/**
 * Send rejection email for internship/training program
 * @param {string} companyEmail - Company email address
 * @param {string} companyName - Company name
 * @param {string} internshipName - Internship/training program name
 * @param {string} rejectionReason - Reason for rejection
 */
const sendInternshipRejectionEmail = async (
  companyEmail,
  companyName,
  internshipName,
  rejectionReason,
) => {
  try {
    const emailTemplate = internshipRejectionEmailTemplate(
      companyName,
      internshipName,
      rejectionReason,
    );
    const result = await sendEmail(
      companyEmail,
      "Your Training Was Not Approved",
      emailTemplate,
    );
    return result;
  } catch (error) {
    console.error("Error sending internship rejection email:", error);
    throw error;
  }
};

const sentContactUsEmail = async (name, email) => {
  const emailTemplate = contactUsEmailTemplate(name);

  await sendEmail(email, "welcome to Interno", emailTemplate);
};

module.exports = {
  sendCompanyApprovalEmail,
  sendCompanyRejectionEmail,
  sendInternshipApprovalEmail,
  sendInternshipRejectionEmail,
  sentContactUsEmail,
};
