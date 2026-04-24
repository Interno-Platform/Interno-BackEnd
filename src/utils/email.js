const transporter = require('./email.transporter')

const sendNotificationEmail = async (to, subject, message) => {
    try {
        await transporter.sendMail({
            from: process.env.BREVO_LOGIN,
            to: to,
            subject: subject,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <br/>
          <p>Best regards,<br/><strong>Interno Team</strong></p>
        </div>
      `
        })
        console.log(`Email sent to ${to}`)
    } catch (error) {
        console.error('Email sending failed:', error)
    }
}

module.exports = { sendNotificationEmail }