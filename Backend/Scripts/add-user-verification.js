import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../Models/user.model.js";
import connectDB from "../Config/db.js";
import generateRandomToken from "../Utils/generateRandomToken.js";
import generateVerificationCode from "../Utils/generateVerificationCode.js";
import { sendVerificationEmail } from "../Services/email.service.js";
import { normalizeEmail } from "../Utils/helpers.js";

dotenv.config();

const email = normalizeEmail(process.argv[2] || "");
const name = process.argv[3]?.trim() || "Eventra User";
const password = process.argv[4] || "Eventra123!";

if (!email) {
  console.error("Usage: node Scripts/add-user-verification.js <email> [name] [password]");
  process.exit(1);
}

const run = async () => {
  await connectDB();

  let user = await User.findOne({ email }).select(
    "+password +emailVerificationToken +emailVerificationCode +emailVerificationExpires",
  );

  if (!user) {
    user = await User.create({
      name,
      email,
      password,
      role: "customer",
      isVerified: false,
    });
    console.log(`Created account: ${name} <${email}>`);
    console.log(`Temporary password: ${password}`);
  } else {
    console.log(`Account already exists: ${user.name} <${email}>`);
  }

  const { rawToken, hashedToken } = generateRandomToken();
  const { code, hashedCode } = generateVerificationCode();

  user.isVerified = false;
  user.emailVerificationToken = hashedToken;
  user.emailVerificationCode = hashedCode;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const sent = await sendVerificationEmail(user, rawToken, code, email);

  if (sent) {
    console.log(`Verification code email sent to ${email}`);
  } else {
    console.log(`Could not send email — check EMAIL_USER / EMAIL_PASS in Backend/.env`);
    console.log(`Dev verification code: ${code}`);
  }

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.connection.close();
  process.exit(1);
});
