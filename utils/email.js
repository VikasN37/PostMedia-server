const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // using transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //   mail options

  const mailOptions = {
    from: 'Vikas Niranjan <vikas630602@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // sending mail

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
