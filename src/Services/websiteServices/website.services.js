const db = require("../../config/database");
const createError = require("../../utils/createError");
const { contactUsSchema } = require("../../Validations/websiteValidation");
const { sentContactUsEmail } = require("../emailServices/approval.emails");

const contactUsService = async (body) => {
  const parsedBody = contactUsSchema.safeParse(body);

  if (!parsedBody.success) {
    throw createError("Invalid input data", 400, parsedBody.error.flatten().fieldErrors);
  }

  const query = `INSERT INTO contact_us (name, email , subject , message) VALUES (? , ? ,?, ?)`;
  const [result] =  await db.execute(query, [
    parsedBody.data.name,
    parsedBody.data.email,
    parsedBody.data.subject,
    parsedBody.data.message,
  ]);


  if (result.affectedRows.length === 0)
    throw createError(" Failed to send message", 400);

  await sentContactUsEmail(parsedBody.data.name, parsedBody.data.email);
  
  return result;
};
 const getAllContactUsMessagesService = async () => {
  const query = `SELECT * FROM contact_us`;
  const [result] =  await db.execute(query);
  return result;
}

module.exports = {
  contactUsService,
  getAllContactUsMessagesService
};
