const nodemailer = require("nodemailer");

let cachedTransporter;
let cachedTransportKey;

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return TRUE_VALUES.has(String(value).trim().toLowerCase());
}

function getMailerConfig() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = toBoolean(process.env.SMTP_SECURE, port === 465);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.CONTACT_FROM_EMAIL || user;
  const to = process.env.CONTACT_RECEIVER_EMAIL || process.env.CONTACT_EMAIL || user;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    to
  };
}

function isMailerConfigured() {
  const config = getMailerConfig();
  return Boolean(config.host && config.port && config.user && config.pass && config.from && config.to);
}

function createTransporter(config) {
  const key = [config.host, config.port, config.secure, config.user, config.from, config.to].join("|");
  if (cachedTransporter && cachedTransportKey === key) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  });

  cachedTransportKey = key;
  return cachedTransporter;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSingleLine(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

async function sendContactEmail(payload) {
  if (!isMailerConfigured()) {
    const error = new Error("Mailer not configured");
    error.code = "MAILER_NOT_CONFIGURED";
    throw error;
  }

  const config = getMailerConfig();
  const transporter = createTransporter(config);

  const safeName = toSingleLine(payload.name);
  const safeEmail = toSingleLine(payload.email);
  const safeProjectType = toSingleLine(payload.projectType);
  const safeBudget = toSingleLine(payload.budget || "Not provided");
  const safeTimeline = toSingleLine(payload.timeline || "Not provided");
  const safeMessage = String(payload.message || "").trim();

  const subject = `New inquiry from ${safeName}`;

  const text = [
    "New portfolio inquiry",
    "",
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    `Project Type: ${safeProjectType}`,
    `Budget: ${safeBudget}`,
    `Timeline: ${safeTimeline}`,
    "",
    "Message:",
    safeMessage
  ].join("\n");

  const html = [
    "<h2>New portfolio inquiry</h2>",
    `<p><strong>Name:</strong> ${escapeHtml(safeName)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>`,
    `<p><strong>Project Type:</strong> ${escapeHtml(safeProjectType)}</p>`,
    `<p><strong>Budget:</strong> ${escapeHtml(safeBudget)}</p>`,
    `<p><strong>Timeline:</strong> ${escapeHtml(safeTimeline)}</p>`,
    `<p><strong>Message:</strong></p>`,
    `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(safeMessage)}</pre>`
  ].join("");

  return transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: safeEmail,
    subject,
    text,
    html
  });
}

async function sendToolSuggestionEmail(payload) {
  if (!isMailerConfigured()) {
    const error = new Error("Mailer not configured");
    error.code = "MAILER_NOT_CONFIGURED";
    throw error;
  }

  const config = getMailerConfig();
  const transporter = createTransporter(config);

  const hasName = typeof payload.name === "string" && payload.name.trim().length > 0;
  const hasEmail = typeof payload.email === "string" && payload.email.trim().length > 0;
  const safeName = hasName ? toSingleLine(payload.name) : "Anonymous visitor";
  const safeEmail = hasEmail ? toSingleLine(payload.email) : "Not provided";
  const safeCategory = toSingleLine(payload.category || "Not specified");
  const safeToolName = toSingleLine(payload.toolName);
  const safeDetails = String(payload.details || "").trim();
  const safeSource = toSingleLine(payload.sourcePage || "Not provided");

  const subject = `Tool suggestion: ${safeToolName}`;

  const text = [
    "New public tool suggestion",
    "",
    `Suggested tool: ${safeToolName}`,
    `Category: ${safeCategory}`,
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    `Submitted from: ${safeSource}`,
    "",
    "Details:",
    safeDetails
  ].join("\n");

  const html = [
    "<h2>New public tool suggestion</h2>",
    `<p><strong>Suggested tool:</strong> ${escapeHtml(safeToolName)}</p>`,
    `<p><strong>Category:</strong> ${escapeHtml(safeCategory)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(safeName)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>`,
    `<p><strong>Submitted from:</strong> ${escapeHtml(safeSource)}</p>`,
    `<p><strong>Details:</strong></p>`,
    `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(safeDetails)}</pre>`
  ].join("");

  const mailOptions = {
    from: config.from,
    to: config.to,
    subject,
    text,
    html
  };

  if (hasEmail) {
    mailOptions.replyTo = toSingleLine(payload.email);
  }

  return transporter.sendMail(mailOptions);
}

module.exports = {
  isMailerConfigured,
  sendContactEmail,
  sendToolSuggestionEmail
};
