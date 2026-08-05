import crypto from "crypto";

const generateVerificationCode = () => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

  return { code, hashedCode };
};

export default generateVerificationCode;
