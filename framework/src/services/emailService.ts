import config from 'app-config';
import nodemailer from 'nodemailer';

config.assert('smtp');

export default {
  sendEmail: async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport(config.smtp)

    return await transporter.sendMail({
      from: config.smtp.fromEmail,
      to, subject, html
    })
  }
};