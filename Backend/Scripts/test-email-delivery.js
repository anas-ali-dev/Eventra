import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const to = process.argv[2] || "tahoun.hazem@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const info = await transporter.sendMail({
  from: `"Eventra" <${process.env.EMAIL_USER}>`,
  to,
  replyTo: process.env.EMAIL_USER,
  subject: "Eventra — Test Email Delivery",
  text: "If you receive this, Eventra email delivery is working. Check spam if needed.",
  html: "<p>If you receive this, <strong>Eventra</strong> email delivery is working. Check spam if needed.</p>",
});

console.log("Sent to:", to);
console.log("From:", process.env.EMAIL_USER);
console.log("MessageId:", info.messageId);
console.log("Accepted:", info.accepted);
