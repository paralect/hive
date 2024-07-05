import config from "app-config";
import nodemailer from "nodemailer";
config.assert("smtp");
export const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport(config.smtp);
    return await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
    });
};
export default {
    sendEmail
};
