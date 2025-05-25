import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env['PERSONAL_EMAIL'],
    pass: process.env['EMAIL_PASSWORD'],
  },
});