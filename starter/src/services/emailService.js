const config = require('app-config');
const nodemailer = require('nodemailer');

config.assert('smtp');

module.exports = {
  sendEmail: async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport(config.smtp)

    return await transporter.sendMail({
      from: process.env.SMTP_USER,
      to, subject, html
    })
  }
}