const SibApiV3Sdk = require("sib-api-v3-sdk");

// إعداد Brevo client
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (to, subject, html) => {
  try {
    const response = await apiInstance.sendTransacEmail({
      sender: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME,
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    });

    return {
      success: true,
      messageId: response.messageId,
    };
  } catch (error) {
    console.error("❌ Email error:", error.response?.body || error.message);

    return {
      success: false,
      error: error.response?.body || error.message,
    };
  }
};

module.exports = sendEmail;