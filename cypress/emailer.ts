// This mailer is only for auto testing purposes
// https://www.cypress.io/blog/2021/05/11/testing-html-emails-using-cypress
// import { exit } from "node:process";
import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'localhost';
const port = Number(process.env.SMTP_PORT || 7777);

// if (process.env.NODE_ENV === "production") {
//   console.error("Production mode is not allowed for this script: mailer.ts");
//   exit(1);
// }

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 456,
});
