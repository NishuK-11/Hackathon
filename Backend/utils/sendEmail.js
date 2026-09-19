const dotenv = require('dotenv');
dotenv.config();

const nodemailer = require('nodemailer');
const sendEmail = async ({ to, subject, text }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });

        console.log("Mail Sent:", info.response);
    } catch (err) {
        console.log("Mail Error:", err);
        throw err;
    }
};
module.exports = sendEmail;