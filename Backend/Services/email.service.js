import nodemailer from "nodemailer";

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:4200";

const getFromAddress = () => {
  const name = process.env.EMAIL_FROM_NAME || "Eventra";
  const user = process.env.EMAIL_USER || "noreply@eventra.com";
  return `"${name}" <${user}>`;
};

let transporterCache = null;

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  if (!transporterCache) {
    transporterCache = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 2,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
  }

  return transporterCache;
};

const formalLayout = ({ title, greeting, bodyHtml, ctaLabel, ctaLink, footerNote, preheader = "" }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${title}</title>
  <!--[if mso]><style type="text/css">body,table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#070707;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#070707;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#121816;border:1px solid #1f3d2a;border-radius:18px;overflow:hidden;box-shadow:0 0 40px rgba(0,200,83,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#004d25 0%,#00c853 100%);padding:32px 28px;text-align:center;">
              <div style="font-size:34px;font-weight:800;color:#ffffff;letter-spacing:2px;font-family:Arial,sans-serif;">EVENTRA</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.88);letter-spacing:2px;margin-top:8px;text-transform:uppercase;">Official Event Platform</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;color:#e8ece9;background:#121816;">
              <p style="margin:0 0 20px;font-size:16px;color:#ffffff;font-weight:500;">${greeting}</p>
              ${bodyHtml}
              ${
                ctaLabel && ctaLink
                  ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:32px 0 0;">
                <tr><td align="center">
                  <a href="${ctaLink}" style="display:inline-block;background:#00c853;color:#071109;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-family:Arial,sans-serif;font-size:14px;letter-spacing:0.4px;box-shadow:0 4px 20px rgba(0,200,83,0.35);">${ctaLabel}</a>
                </td></tr>
              </table>`
                  : ""
              }
              <hr style="border:none;border-top:1px solid #243028;margin:32px 0 20px;" />
              <p style="margin:0;font-size:12px;line-height:1.7;color:#8a968f;">${footerNote}</p>
              <p style="margin:14px 0 0;font-size:11px;color:#5a6660;">© ${new Date().getFullYear()} Eventra · Discover concerts, sports &amp; exclusive events</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const verificationCodeBlock = (verificationCode) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:#0b0f0c;border:1px solid #243028;border-radius:14px;overflow:hidden;">
    <tr>
      <td style="padding:28px 24px;text-align:center;">
        <p style="margin:0 0 10px;font-size:11px;color:#8a968f;text-transform:uppercase;letter-spacing:1.5px;font-family:Arial,sans-serif;">Your Verification Code</p>
        <p style="margin:0;font-size:40px;font-weight:800;color:#00e676;letter-spacing:10px;font-family:'Courier New',monospace;">${verificationCode}</p>
        <p style="margin:14px 0 0;font-size:12px;color:#6d776f;">Valid for 24 hours · Do not share this code</p>
      </td>
    </tr>
  </table>`;

const infoPanel = (rows) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0 0;background:#0d1210;border:1px solid #243028;border-radius:12px;">
    ${rows}
  </table>`;

const infoRow = (label, value, highlight = false) => `
  <tr>
    <td style="padding:14px 20px;border-bottom:1px solid #1a2420;">
      <p style="margin:0 0 4px;font-size:11px;color:#8a968f;text-transform:uppercase;letter-spacing:0.8px;">${label}</p>
      <p style="margin:0;font-size:15px;color:${highlight ? "#00e676" : "#ffffff"};font-weight:${highlight ? "700" : "500"};">${value}</p>
    </td>
  </tr>`;

const sendOrLog = async ({ to, subject, html, text, devLink, verificationCode }) => {
  if (verificationCode) {
    console.log(`\n[Eventra] Verification code for ${to}: ${verificationCode}\n`);
  }

  const transporter = getTransporter();

  if (!transporter) {
    console.log("Email not sent — set EMAIL_USER and EMAIL_PASS in Backend/.env");
    if (devLink) console.log(`Link: ${devLink}`);
    return false;
  }

  try {
    const plainText =
      text ||
      (verificationCode
        ? `Hello,\n\nYour Eventra verification code is: ${verificationCode}\n\nThis code expires in 24 hours.\n\nIf you did not request this, ignore this email.\n\nEventra Team`
        : subject);

    const result = await transporter.sendMail({
      from: getFromAddress(),
      to,
      replyTo: process.env.EMAIL_USER,
      subject,
      text: plainText,
      html,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    });
    console.log(`Email sent → ${to} (${result.messageId})`);
    return true;
  } catch (error) {
    console.error("Email delivery failed:", error.message);
    return false;
  }
};

/** Queue email in background so login/register responds instantly. */
export const queueVerificationEmail = (user, token, verificationCode, toEmail = user.email) => {
  if (!getTransporter()) {
    return false;
  }

  void sendVerificationEmail(user, token, verificationCode, toEmail).catch((error) => {
    console.error("Background verification email failed:", error.message);
  });

  return true;
};

/** Queue booking email so the API responds immediately. */
export const queueBookingConfirmationEmail = (user, booking, event, ticketLink) => {
  if (!getTransporter()) {
    return false;
  }

  void sendBookingConfirmationEmail(user, booking, event, ticketLink).catch((error) => {
    console.error("Background booking confirmation email failed:", error.message);
  });

  return true;
};

/** Queue password reset email so forgot-password responds instantly. */
export const queueResetPasswordEmail = (user, token) => {
  const link = `${getClientUrl()}/reset-password/${token}`;

  if (!getTransporter()) {
    console.log(`\n[Eventra] Password reset link for ${user.email}: ${link}\n`);
    return false;
  }

  void sendResetPasswordEmail(user, token).catch((error) => {
    console.error("Background reset password email failed:", error.message);
  });

  return true;
};

export const sendVerificationEmail = async (user, token, verificationCode, toEmail = user.email) => {
  const link = `${getClientUrl()}/verify-email/${token}`;
  const recipient = toEmail || user.email;
  const plainText = `Hello ${user.name},\n\nYour Eventra verification code is: ${verificationCode}\n\nEnter this code on the verification page to activate your account.\n\nThis code expires in 24 hours.\n\nVerify link: ${link}\n\n— Eventra Team`;

  const html = formalLayout({
    title: "Verify Your Eventra Account",
    preheader: `Your Eventra verification code is ${verificationCode}`,
    greeting: `Dear ${user.name},`,
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#c5cdc8;font-family:Arial,sans-serif;">
        Welcome to <strong style="color:#ffffff;">Eventra</strong>. To complete your registration and secure your account,
        please verify your email address using the code below or click the verification button.
      </p>
      ${verificationCodeBlock(verificationCode)}
      <p style="margin:0;font-size:14px;line-height:1.75;color:#8a968f;font-family:Arial,sans-serif;">
        If you did not create an Eventra account, you can safely ignore this message.
        For your security, never share this code with anyone.
      </p>`,
    ctaLabel: "Verify Email Address",
    ctaLink: link,
    footerNote: "Eventra will never ask for your password by email. This message was sent automatically from our secure platform.",
  });

  return sendOrLog({
    to: recipient,
    subject: `Eventra — Your verification code: ${verificationCode}`,
    text: plainText,
    devLink: link,
    verificationCode,
    html,
  });
};

export const sendResetPasswordEmail = async (user, token) => {
  const link = `${getClientUrl()}/reset-password/${token}`;

  const html = formalLayout({
    title: "Reset Your Eventra Password",
    greeting: `Dear ${user.name},`,
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#c5cdc8;font-family:Arial,sans-serif;">
        We received a request to reset the password for your Eventra account.
        Click the button below to choose a new password.
      </p>
      <p style="margin:0;font-size:14px;line-height:1.75;color:#8a968f;font-family:Arial,sans-serif;">
        This link expires in <strong style="color:#00e676;">15 minutes</strong>.
        If you did not request a password reset, you may safely ignore this email.
      </p>`,
    ctaLabel: "Reset Password",
    ctaLink: link,
    footerNote: "If you continue to receive unexpected reset emails, contact Eventra support immediately.",
  });

  return sendOrLog({
    to: user.email,
    subject: "Eventra — Password Reset Request",
    devLink: link,
    html,
  });
};

export const sendBookingConfirmationEmail = async (user, booking, event, ticketLink) => {
  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const html = formalLayout({
    title: "Your Eventra Ticket Confirmation",
    greeting: `Dear ${user.name},`,
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#c5cdc8;font-family:Arial,sans-serif;">
        Your booking has been confirmed. We look forward to welcoming you to the event.
        Present your digital ticket with QR code at the venue entrance.
      </p>
      ${infoPanel(`
        ${infoRow("Event", event.title)}
        ${infoRow("Date & Time", `${eventDate} · ${event.time || ""}`)}
        ${infoRow("Venue", `${event.venue || ""}, ${event.city || ""}`)}
        ${infoRow("Tickets", `${booking.ticketTierName} · ${booking.tickets} ticket(s)`)}
        ${infoRow("Booking Reference", booking.bookingRef, true)}
      `)}`,
    ctaLabel: "View Digital Ticket",
    ctaLink: ticketLink,
    footerNote: "Please arrive at least 30 minutes before the event start time. Bring a valid ID matching your account name.",
  });

  return sendOrLog({
    to: user.email,
    subject: `Eventra — Ticket Confirmation · ${event.title}`,
    devLink: ticketLink,
    html,
  });
};
