import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../Models/user.model.js";
import connectDB from "../Config/db.js";
import generateRandomToken from "../Utils/generateRandomToken.js";
import generateVerificationCode from "../Utils/generateVerificationCode.js";
import { sendVerificationEmail } from "../Services/email.service.js";

dotenv.config();

const email = process.argv[2]?.trim().toLowerCase() || "tahoun.hazem@gmail.com";

const run = async () => {
  await connectDB();

  const user = await User.findOne({ email }).select(
    "+emailVerificationToken +emailVerificationCode +emailVerificationExpires",
  );

  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  const { rawToken, hashedToken } = generateRandomToken();
  const { code, hashedCode } = generateVerificationCode();

  user.isVerified = false;
  user.emailVerificationToken = hashedToken;
  user.emailVerificationCode = hashedCode;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const sent = await sendVerificationEmail(user, rawToken, code);

  console.log(sent
    ? `Verification email sent to ${email}`
    : `Failed to send email to ${email} — check Backend/.env`);

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
