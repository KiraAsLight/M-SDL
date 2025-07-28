const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
    },
});

const sendResetEmail = async (to, token) => {
    //const link = 'http://localhost:3000/reset-password/${token}';
    const link = `${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: "Reset Password",
        text: `Token Anda: ${link}`, // Untuk mengirim token reset password

        // Untuk mengirim link reset password
        // text: `Klik link berikut untuk reset password Anda: ${link}`,
        // html: `<p>Klik link berikut untuk reset password Anda:</p><a href="${link}">${link}</a>`,
    });
};

module.exports = { sendResetEmail };