export const sendVerificationEmail = async (user, token) => {
  console.log("Verification Email");
  console.log("User:", user.email);
  console.log("Token:", token);
};

export const sendResetPasswordEmail = async (user, token) => {
  console.log("Reset Password Email");
  console.log("User:", user.email);
  console.log("Token:", token);
};
