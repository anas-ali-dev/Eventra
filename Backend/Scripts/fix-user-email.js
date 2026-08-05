import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../Models/user.model.js";
import connectDB from "../Config/db.js";

dotenv.config();

const TARGET_EMAIL = "tahoun.hazem@gmail.com";
const LEGACY_EMAILS = ["tahoun.hazm@gmail.com"];

const run = async () => {
  await connectDB();

  const targetTaken = await User.findOne({ email: TARGET_EMAIL });

  for (const legacyEmail of LEGACY_EMAILS) {
    const user = await User.findOne({ email: legacyEmail });

    if (!user) {
      continue;
    }

    if (targetTaken && String(targetTaken._id) !== String(user._id)) {
      console.log(`Cannot update ${legacyEmail} — ${TARGET_EMAIL} is already used by another account.`);
      continue;
    }

    user.email = TARGET_EMAIL;
    await user.save();
    console.log(`Updated account email from ${legacyEmail} to ${TARGET_EMAIL}`);
  }

  const user = await User.findOne({ email: TARGET_EMAIL });

  if (user) {
    user.isVerified = false;
    user.emailVerificationToken = undefined;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    console.log(`Verification reset for ${user.name} <${user.email}>. You must verify before logging in.`);
  } else {
    console.log(`No user found for ${TARGET_EMAIL}. Register with this email to create the account.`);
  }

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
