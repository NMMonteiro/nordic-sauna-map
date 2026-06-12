require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.sendMail({
    from: '"Suomiportaat" <no-reply@suomiportaat.com>',
    to: 'creadordeconteudos@gmail.com',
    subject: 'Test Email Direct',
    text: 'Testing Hostinger SMTP from Local.'
}).then(i => console.log('Sent:', i)).catch(console.error);
