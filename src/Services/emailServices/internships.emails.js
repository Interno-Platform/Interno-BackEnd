const { traineeStatusEmailTemplate } = require("../../utils/email.template");
const sentEmail = require("./Email.services");

const applicationStatusEmail = async (
  traineeName,
  internshipName,
  companyName,
  status, // accepted | rejected
  notes = "",
  email,
) => {

  const emailTemplate = await traineeStatusEmailTemplate(
    traineeName,
    internshipName,
    companyName,
    status,
    notes,
  );
    await sentEmail(email, "Internship Application Update", emailTemplate);
};

module.exports = { applicationStatusEmail };
