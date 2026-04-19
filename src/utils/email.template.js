const welacomeEmailTemplate = () => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Interno Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f5;font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background:#e8f5ee;padding:30px;">
              <img src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg" alt="Interno Logo" width="120" style="display:block;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;color:#2f4f3a;">
              <h2 style="margin-top:0;color:#1f7a4d;">
                Welcome to Interno 👋
              </h2>

              <p style="font-size:15px;line-height:1.7;">
                We’re excited to have you with us!
                <br /><br />
                <strong>Interno</strong> helps you start your career by assessing your skills,
                guiding your learning journey, and connecting you with real IT opportunities.
              </p>

              <p style="font-size:15px;line-height:1.7;">
                If you have any questions or need support, feel free to reply to this email.
                Our team is always here to help 🌱
              </p>

              <!-- Button -->
              <div style="text-align:center;margin:30px 0;">
                <a href="#" style="
                  background:#1f7a4d;
                  color:#ffffff;
                  padding:14px 28px;
                  text-decoration:none;
                  border-radius:6px;
                  font-weight:bold;
                  display:inline-block;
                ">
                  Start Your Career
                </a>
              </div>

              <p style="font-size:14px;color:#6b8f7a;">
                Best regards,<br />
                <strong>Interno Support Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f1f7f3;padding:20px;font-size:12px;color:#6b8f7a;">
              © 2026 Interno · Start Your Career
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};

const verificationEmailTemplate = (id, verifyCode) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f5;font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background:#e8f5ee;padding:30px;">
              <img src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg" alt="Interno Logo" width="120" style="display:block;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;color:#2f4f3a;">
              <h2 style="margin-top:0;color:#1f7a4d;">
                Verify Your Email 
              </h2>

              <p style="font-size:15px;line-height:1.7;">
                Thank you for signing up! Please verify your email to start your journey with <strong>Interno</strong>.
              </p>

              <!-- Verify Button -->
              <div style="text-align:center;margin:30px 0;">
                <a href=${`localhost:3000/api/users/verify-code/${id}/${verifyCode}`} style="
                  background:#1f7a4d;
                  color:#ffffff;
                  padding:14px 28px;
                  text-decoration:none;
                  border-radius:6px;
                  font-weight:bold;
                  display:inline-block;
                ">
                  Verify Email
                </a>
              </div>

             
              <p style="font-size:14px;color:#6b8f7a;">
                Best regards,<br />
                <strong>Interno Support Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f1f7f3;padding:20px;font-size:12px;color:#6b8f7a;">
              © 2026 Interno · Start Your Career
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

module.exports = { welacomeEmailTemplate, verificationEmailTemplate };
