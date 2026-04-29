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
                <a href=${`${process.env.BASE_URL}/api/users/verify-code/${id}/${verifyCode}`} style="
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

const traineeStatusEmailTemplate = (
  traineeName,
  internshipName,
  companyName,
  status, // accepted | rejected
  notes = "",
) => {
  const isAccepted = status === "accepted";
  console.log(traineeName, internshipName, companyName, status, notes);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Interno Email</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f5;font-family:Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:30px 15px;">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td align="center" style="background:#e8f5ee;padding:30px;">
<img
src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg"
alt="Interno Logo"
width="120"
style="display:block;"
/>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:40px;color:#2f4f3a;">

<h2 style="margin-top:0;color:${isAccepted ? "#1f7a4d" : "#c0392b"};">
${isAccepted ? "Congratulations 🎉" : "Application Update 📩"}
</h2>

<p style="font-size:15px;line-height:1.8;">
Hello <strong>${traineeName}</strong>,
</p>

<p style="font-size:15px;line-height:1.8;">
Regarding your application for:
<br />
<strong>${internshipName}</strong>
</p>

<p style="font-size:15px;line-height:1.8;">
From: <strong>${companyName}</strong>
</p>

${
  isAccepted
    ? `
<p style="font-size:15px;line-height:1.8;color:#1f7a4d;">
✅ We are pleased to inform you that you have been
<strong>accepted</strong> into this training opportunity.
</p>

<p style="font-size:15px;line-height:1.8;">
Our team will contact you soon with the next steps.
</p>
`
    : `
<p style="font-size:15px;line-height:1.8;color:#c0392b;">
❌ After reviewing your application, we regret to inform you that you were
<strong>not selected</strong> for this opportunity.
</p>

<p style="font-size:15px;line-height:1.8;">
We encourage you to apply again for future opportunities.
</p>
`
}

${
  notes
    ? `
<!-- Notes -->
<div style="
margin-top:25px;
padding:18px;
background:#f8faf9;
border-left:4px solid ${isAccepted ? "#1f7a4d" : "#c0392b"};
border-radius:6px;
">
<p style="margin:0 0 8px 0;font-size:14px;font-weight:bold;color:#2f4f3a;">
Company Notes:
</p>

<p style="margin:0;font-size:14px;line-height:1.8;color:#555;">
${notes}
</p>
</div>
`
    : ""
}

<!-- Button -->
<div style="text-align:center;margin:30px 0;">
<a href="#" style="
background:${isAccepted ? "#1f7a4d" : "#555"};
color:#ffffff;
padding:14px 28px;
text-decoration:none;
border-radius:6px;
font-weight:bold;
display:inline-block;
">
View Dashboard
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
<td align="center"
style="background:#f1f7f3;padding:20px;font-size:12px;color:#6b8f7a;">
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

// Email template for trainee/company after successful email verification
const emailVerificationSuccessPageTrainee = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verified - Interno</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f1419 0%, #1a1f26 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; position: relative; overflow: hidden; }
    body::before { content: ''; position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%); border-radius: 50%; top: -300px; left: -300px; pointer-events: none; }
    body::after { content: ''; position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(76, 175, 80, 0.05) 0%, transparent 70%); border-radius: 50%; bottom: -200px; right: -200px; pointer-events: none; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bounce { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
    .container { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 20px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4); max-width: 700px; width: 100%; padding: 80px 50px; text-align: center; position: relative; z-index: 1; animation: slideUp 0.6s ease-out; margin: 50px 0; }
    .logo { margin-bottom: 50px; }
    .logo img { max-width: 100px; height: auto; filter: drop-shadow(0 4px 10px rgba(76, 175, 80, 0.15)); }
    .success-animation { width: 120px; height: 120px; margin: 0 auto 40px; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 60px; color: white; box-shadow: 0 15px 40px rgba(76, 175, 80, 0.4); animation: bounce 0.8s ease-out; }
    h1 { font-size: 42px; color: #1a1f26; margin-bottom: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .subtitle { font-size: 18px; color: #5a5f69; margin-bottom: 40px; line-height: 1.8; font-weight: 400; }
    .highlight { color: #4CAF50; font-weight: 700; }
    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin: 50px 0; padding: 40px 0; border-top: 1px solid #e8ecf1; border-bottom: 1px solid #e8ecf1; }
    .feature-item { text-align: center; padding: 15px; }
    .feature-icon { font-size: 32px; margin-bottom: 12px; }
    .feature-text { font-size: 14px; color: #5a5f69; line-height: 1.6; font-weight: 500; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 18px 50px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3); margin-top: 30px; text-transform: uppercase; letter-spacing: 0.5px; }
    .cta-button:hover { transform: translateY(-4px); box-shadow: 0 15px 40px rgba(76, 175, 80, 0.5); }
    .footer { margin-top: 50px; padding-top: 30px; border-top: 1px solid #e8ecf1; font-size: 13px; color: #8a8f9a; }
    .footer-text { margin-bottom: 8px; }
    @media (max-width: 600px) { .container { padding: 50px 30px; margin: 40px 0; } h1 { font-size: 32px; } .features { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg" alt="Interno Logo" />
    </div>
    <div class="success-animation">✓</div>
    <h1>Email Verified!</h1>
    <p class="subtitle">Congratulations! Your email has been <span class="highlight">verified successfully</span>.<br>Your account is ready to use.</p>
    <div class="features">
      <div class="feature-item">
        <div class="feature-icon">🎯</div>
        <div class="feature-text">Browse Internships</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">📚</div>
        <div class="feature-text">Access Resources</div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">💼</div>
        <div class="feature-text">Build Profile</div>
      </div>
    </div>
    <a href="https://interno.blog/login" class="cta-button">Go to Login</a>
    <div class="footer">
      <p class="footer-text">If you didn't create this account, you can safely ignore this message.</p>
      <p class="footer-text">© 2026 Interno · Start Your Career</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Email template for company after email verification
const emailVerificationSuccessPageCompany = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verified - Interno</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f1419 0%, #1a1f26 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; position: relative; overflow: hidden; }
    body::before { content: ''; position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%); border-radius: 50%; top: -300px; left: -300px; pointer-events: none; }
    body::after { content: ''; position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(76, 175, 80, 0.05) 0%, transparent 70%); border-radius: 50%; bottom: -200px; right: -200px; pointer-events: none; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bounce { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
    .container { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 20px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4); max-width: 700px; width: 100%; padding: 80px 50px; text-align: center; position: relative; z-index: 1; animation: slideUp 0.6s ease-out; margin: 50px 0; }
    .logo { margin-bottom: 50px; }
    .logo img { max-width: 100px; height: auto; filter: drop-shadow(0 4px 10px rgba(76, 175, 80, 0.15)); }
    .success-animation { width: 120px; height: 120px; margin: 0 auto 40px; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 60px; color: white; box-shadow: 0 15px 40px rgba(76, 175, 80, 0.4); animation: bounce 0.8s ease-out; }
    h1 { font-size: 42px; color: #1a1f26; margin-bottom: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .subtitle { font-size: 18px; color: #5a5f69; margin-bottom: 40px; line-height: 1.8; font-weight: 400; }
    .highlight { color: #4CAF50; font-weight: 700; }
    .notice-box { background: linear-gradient(135deg, #f0f9f7 0%, #e8f5ef 100%); border-radius: 15px; padding: 30px; margin: 40px 0; border-left: 6px solid #4CAF50; text-align: left; box-shadow: 0 10px 30px rgba(76, 175, 80, 0.1); }
    .notice-box h3 { color: #2e7d32; margin-bottom: 12px; font-size: 18px; font-weight: 700; }
    .notice-box p { color: #1a1f26; margin: 0; font-size: 16px; line-height: 1.8; }
    .footer { margin-top: 50px; padding-top: 30px; border-top: 1px solid #e8ecf1; font-size: 13px; color: #8a8f9a; }
    .footer-text { margin-bottom: 8px; }
    @media (max-width: 600px) { .container { padding: 50px 30px; margin: 40px 0; } h1 { font-size: 32px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg" alt="Interno Logo" />
    </div>
    <div class="success-animation">✓</div>
    <h1>Email Verified!</h1>
    <p class="subtitle">
      Thank you for registering with <span class="highlight">Interno</span>.<br>
      Your email has been verified successfully.
    </p>
    <div class="notice-box">
      <h3>📋 Account Under Review</h3>
      <p>Your account is currently under review by our admin team. We typically review applications within <strong>1-2 business days</strong>. We'll notify you via email once your account has been approved.</p>
    </div>
    <p class="subtitle">We look forward to working with you soon!</p>
    <div class="footer">
      <p class="footer-text">© 2026 Interno · Start Your Career</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Company welcome + approval email
const companyApprovalEmailTemplate = (companyName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Welcome to Interno - Account Approved</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);margin:20px;">
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #4CAF50 0%, #45a049 100%);padding:40px;">
              <img src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg" alt="Interno Logo" width="120" style="display:block;filter:brightness(1.1);" />
            </td>
          </tr>
          <tr>
            <td style="padding:40px;color:#1a1f26;">
              <h2 style="margin-top:0;color:#4CAF50;font-size:28px;">Welcome to Interno, ${companyName}! 🎉</h2>
              <p style="font-size:16px;line-height:1.7;color:#5a5f69;">
                Congratulations! Your account has been approved and is now active.<br /><br />
                We're excited to have ${companyName} join our platform. You can now:
              </p>
              <ul style="font-size:15px;line-height:1.9;color:#1a1f26;margin:20px 0;padding-left:25px;">
                <li style="margin-bottom:10px;">✅ Post internships and training programs</li>
                <li style="margin-bottom:10px;">✅ Review and manage candidate applications</li>
                <li style="margin-bottom:10px;">✅ Build your employer brand profile</li>
                <li>✅ Connect with top talent in your industry</li>
              </ul>
              <p style="font-size:15px;line-height:1.7;color:#5a5f69;">Your account is ready to use. Log in to your dashboard to get started.</p>
              <div style="text-align:center;margin:35px 0;">
                <a href="https://interno.blog/login" style="background:linear-gradient(135deg, #4CAF50 0%, #45a049 100%);color:#ffffff;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;box-shadow:0 8px 20px rgba(76, 175, 80, 0.3);">
                  Access Your Account
                </a>
              </div>
              <p style="font-size:14px;color:#8a8f9a;line-height:1.8;">If you have any questions, our support team is ready to assist.<br />Best regards,<br /><strong style="color:#4CAF50;">Interno Team</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background:#f5f7fa;padding:25px;font-size:12px;color:#8a8f9a;border-top:1px solid #e8ecf1;">
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

// Company rejection email
const companyRejectionEmailTemplate = (companyName, rejectionReason) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Account Registration Decision - Interno</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);margin:20px;">
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);padding:40px;">
              <img src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg" alt="Interno Logo" width="120" style="display:block;filter:brightness(1.1);" />
            </td>
          </tr>
          <tr>
            <td style="padding:40px;color:#1a1f26;">
              <h2 style="margin-top:0;color:#d32f2f;font-size:28px;">Account Registration Decision</h2>
              <p style="font-size:16px;line-height:1.7;color:#5a5f69;">Dear ${companyName},</p>
              <p style="font-size:15px;line-height:1.7;color:#5a5f69;">Thank you for your interest in partnering with Interno. After careful review of your application, we regret to inform you that your account registration was not approved at this time.</p>
              <div style="background:#fff5f5;border-left:4px solid #d32f2f;padding:25px;margin:25px 0;border-radius:8px;">
                <p style="margin:0;font-size:15px;color:#c62828;font-weight:700;">Reason:</p>
                <p style="margin:12px 0 0 0;font-size:15px;color:#1a1f26;line-height:1.8;">${rejectionReason}</p>
              </div>
              <p style="font-size:15px;line-height:1.7;color:#5a5f69;">If you have questions about this decision or would like to reapply, please don't hesitate to contact our support team. We'd be happy to discuss your application or help you address any concerns.</p>
              <p style="font-size:14px;color:#8a8f9a;line-height:1.8;">Best regards,<br /><strong style="color:#1a1f26;">Interno Admin Team</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background:#f5f7fa;padding:25px;font-size:12px;color:#8a8f9a;border-top:1px solid #e8ecf1;">
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

// Internship approval email
const internshipApprovalEmailTemplate = (companyName, internshipName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Internship Approved - Interno</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);margin:20px;">
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #4CAF50 0%, #45a049 100%);padding:40px;">
              <img src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg" alt="Interno Logo" width="120" style="display:block;filter:brightness(1.1);" />
            </td>
          </tr>
          <tr>
            <td style="padding:40px;color:#1a1f26;">
              <h2 style="margin-top:0;color:#4CAF50;font-size:28px;">Your Training/Internship Has Been Approved! ✅</h2>
              <p style="font-size:16px;line-height:1.7;color:#5a5f69;">Dear ${companyName},</p>
              <p style="font-size:15px;line-height:1.7;color:#5a5f69;">Great news! Your training/internship program <strong>"${internshipName}"</strong> has been approved and is now live on the Interno platform.</p>
              <ul style="font-size:15px;line-height:1.9;color:#1a1f26;margin:20px 0;padding-left:25px;">
                <li style="margin-bottom:10px;">🎯 Your program is now visible to potential candidates</li>
                <li style="margin-bottom:10px;">📱 Candidates can view and apply for positions</li>
                <li>📊 You can track applications in your dashboard</li>
              </ul>
              <p style="font-size:15px;line-height:1.7;color:#5a5f69;">Log in to your dashboard to start reviewing applications and managing your program.</p>
              <div style="text-align:center;margin:35px 0;">
                <a href="https://interno.blog/login" style="background:linear-gradient(135deg, #4CAF50 0%, #45a049 100%);color:#ffffff;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;box-shadow:0 8px 20px rgba(76, 175, 80, 0.3);">
                  Go to Dashboard
                </a>
              </div>
              <p style="font-size:14px;color:#8a8f9a;line-height:1.8;">Best regards,<br /><strong style="color:#4CAF50;">Interno Team</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background:#f5f7fa;padding:25px;font-size:12px;color:#8a8f9a;border-top:1px solid #e8ecf1;">
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

// Internship rejection email
const internshipRejectionEmailTemplate = (
  companyName,
  internshipName,
  rejectionReason,
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Training/Internship Review Decision - Interno</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);margin:20px;">
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);padding:40px;">
              <img src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg" alt="Interno Logo" width="120" style="display:block;filter:brightness(1.1);" />
            </td>
          </tr>
          <tr>
            <td style="padding:40px;color:#1a1f26;">
              <h2 style="margin-top:0;color:#d32f2f;font-size:28px;">Training/Internship Review Decision</h2>
              <p style="font-size:16px;line-height:1.7;color:#5a5f69;">Dear ${companyName},</p>
              <p style="font-size:15px;line-height:1.7;color:#5a5f69;">Thank you for submitting your training/internship program <strong>"${internshipName}"</strong> for review. After careful evaluation, we are unable to approve it at this time.</p>
              <div style="background:#fff5f5;border-left:4px solid #d32f2f;padding:25px;margin:25px 0;border-radius:8px;">
                <p style="margin:0;font-size:15px;color:#c62828;font-weight:700;">Reason for Decision:</p>
                <p style="margin:12px 0 0 0;font-size:15px;color:#1a1f26;line-height:1.8;">${rejectionReason}</p>
              </div>
              <p style="font-size:15px;line-height:1.7;color:#5a5f69;">We encourage you to make the necessary adjustments and resubmit your program. Our team is available to provide guidance if you have questions about the feedback.</p>
              <p style="font-size:14px;color:#8a8f9a;line-height:1.8;">Best regards,<br /><strong style="color:#1a1f26;">Interno Admin Team</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background:#f5f7fa;padding:25px;font-size:12px;color:#8a8f9a;border-top:1px solid #e8ecf1;">
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

const contactUsEmailTemplate = (name) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Interno Contact Confirmation</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f5;font-family:Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:30px 15px;">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td align="center" style="background:#e8f5ee;padding:30px;">
<img
src="https://ik.imagekit.io/focsamf/logo.jpg.jpeg"
alt="Interno Logo"
width="120"
style="display:block;"
/>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:40px;color:#2f4f3a;">

<h2 style="margin-top:0;color:#1f7a4d;">
Message Received 📩
</h2>

<p style="font-size:15px;line-height:1.8;">
Hello <strong>${name}</strong>,
</p>

<p style="font-size:15px;line-height:1.8;">
Thank you for contacting us through the <strong>Interno</strong> platform.
</p>

<p style="font-size:15px;line-height:1.8;">
We have successfully received your message and our team is currently reviewing it.
</p>

<p style="font-size:15px;line-height:1.8;color:#1f7a4d;">
✅ We will get back to you as soon as possible.
</p>

<!-- Info Box -->
<div style="
margin-top:25px;
padding:18px;
background:#f8faf9;
border-left:4px solid #1f7a4d;
border-radius:6px;
">
<p style="margin:0;font-size:14px;line-height:1.8;color:#555;">
Our support team usually responds within 24–48 hours.  
Please make sure to check your email regularly for updates.
</p>
</div>

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
Go to Dashboard
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
<td align="center"
style="background:#f1f7f3;padding:20px;font-size:12px;color:#6b8f7a;">
© 2026 Interno · We’re here to help
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

module.exports = {
  welacomeEmailTemplate,
  verificationEmailTemplate,
  traineeStatusEmailTemplate,
  emailVerificationSuccessPageTrainee,
  emailVerificationSuccessPageCompany,
  companyApprovalEmailTemplate,
  companyRejectionEmailTemplate,
  internshipApprovalEmailTemplate,
  internshipRejectionEmailTemplate,
  contactUsEmailTemplate,
};
