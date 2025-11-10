import { Resend } from "resend";
import nodemailer from "nodemailer";

// Lazy initialization of Resend
let resend = null;
let smtpTransporter = null;

const getResendInstance = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log("✅ Email service configured with Resend");
  }
  return resend;
};

const canUseResend = () => Boolean(process.env.RESEND_API_KEY);

const canUseSmtp = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      (process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS)
  );

const getSmtpTransporter = () => {
  if (smtpTransporter || !canUseSmtp()) {
    return smtpTransporter;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure:
      typeof process.env.SMTP_SECURE !== "undefined"
        ? process.env.SMTP_SECURE === "true"
        : port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log("✅ Email service configured with Nodemailer SMTP");
  return smtpTransporter;
};

const getProviderOrder = () => {
  const preferred = process.env.EMAIL_PROVIDER?.toLowerCase();
  const providers = [];

  const add = (provider) => {
    if (!providers.includes(provider)) {
      providers.push(provider);
    }
  };

  if (preferred === "nodemailer" || preferred === "smtp") {
    if (canUseSmtp()) add("nodemailer");
    if (canUseResend()) add("resend");
  } else if (preferred === "resend") {
    if (canUseResend()) add("resend");
    if (canUseSmtp()) add("nodemailer");
  } else {
    if (canUseSmtp()) add("nodemailer");
    if (canUseResend()) add("resend");
  }

  return providers;
};

const sendWithResend = async ({ to, subject, html }) => {
  const resendInstance = getResendInstance();
  if (!resendInstance) {
    throw new Error("Resend is not configured (missing RESEND_API_KEY).");
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM_ADDRESS ||
    "Degree Plan Assistant <onboarding@resend.dev>";

  if (!process.env.RESEND_FROM_EMAIL) {
    console.warn(
      "⚠️ RESEND_FROM_EMAIL is not configured. Resend may reject emails unless the default onboarding domain is allowed for your account."
    );
  }

  const { data, error } = await resendInstance.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("❌ Resend error:", error);

    if (error.statusCode === 403 && error.name === "validation_error") {
      throw new Error(
        "Resend validation error: You must verify a sending domain and use a matching `RESEND_FROM_EMAIL`, or send only to the test address linked to your Resend account."
      );
    }

    throw new Error(`Resend failed: ${error.message}`);
  }

  return data;
};

const sendWithSmtp = async ({ to, subject, html }) => {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    throw new Error(
      "SMTP transport is not configured. Please provide SMTP_* environment variables."
    );
  }

  const fromEmail =
    process.env.SMTP_FROM_EMAIL ||
    process.env.EMAIL_FROM_ADDRESS ||
    process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error(
      "Missing SMTP_FROM_EMAIL/EMAIL_FROM_ADDRESS value for Nodemailer."
    );
  }

  const info = await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    html,
  });

  return info;
};

/**
 * Sends a confirmation email with a 6-digit code to the user.
 * @param {string} to - The recipient email address.
 * @param {string} code - The 6-digit confirmation code.
 */
export const sendConfirmationEmail = async (to, code) => {
  const emailHTML = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0345A0;">Degree Plan Assistant</h2>
      <p>Hello 👋,</p>
      <p>Thank you for signing up! To complete your registration, please use the confirmation code below:</p>
      <h1 style="color: #0345A0; letter-spacing: 2px;">${code}</h1>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, you can safely ignore this message.</p>
      <hr />
      <p style="font-size: 12px; color: #888;">This email was sent automatically by the Degree Plan Assistant System.</p>
    </div>
  `;

  try {
    const providers = getProviderOrder();

    if (!providers.length) {
      throw new Error(
        "No email provider configured. Set Resend or SMTP environment variables."
      );
    }

    const subject = "Confirm your Degree Plan Assistant account";
    const errors = [];

    for (const provider of providers) {
      try {
        if (provider === "nodemailer") {
          const info = await sendWithSmtp({ to, subject, html: emailHTML });
          console.log(
            `📧 Confirmation email sent via Nodemailer to ${to} (messageId: ${info.messageId})`
          );
          return info;
        }

        if (provider === "resend") {
          const data = await sendWithResend({ to, subject, html: emailHTML });
          console.log(
            `📧 Confirmation email sent via Resend to ${to} (id: ${data?.id ?? "n/a"})`
          );
          return data;
        }
      } catch (providerError) {
        const providerMessage =
          providerError?.message ||
          (typeof providerError === "string"
            ? providerError
            : "Unknown error sending email.");
        errors.push(`${provider}: ${providerMessage}`);
        console.warn(
          `⚠️ Email attempt with ${provider} failed: ${providerMessage}`
        );
      }
    }

    throw new Error(errors.join(" | "));
  } catch (error) {
    const message =
      error?.message ||
      (typeof error === "string"
        ? error
        : "Failed to send confirmation email due to an unknown error.");
    console.error("❌ Error sending confirmation email:", message);
    throw new Error(message);
  }
};
