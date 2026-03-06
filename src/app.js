const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");

const siteData = require("./data/siteData");
const { sendContactEmail, isMailerConfigured } = require("./services/contactMailer");

const app = express();
const publicDir = path.join(__dirname, "..", "public");
const contactAttempts = new Map();

const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_RATE_LIMIT_MAX = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.disable("x-powered-by");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

function cleanString(value, maxLength = 5000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - CONTACT_RATE_LIMIT_WINDOW_MS;
  const recentAttempts = (contactAttempts.get(ip) || []).filter((timestamp) => timestamp > windowStart);

  if (recentAttempts.length >= CONTACT_RATE_LIMIT_MAX) {
    contactAttempts.set(ip, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  contactAttempts.set(ip, recentAttempts);
  return false;
}

function getBaseUrl(req) {
  const configured = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");
  if (configured) return configured;

  const protoHeader = req.get("x-forwarded-proto");
  const proto = protoHeader ? protoHeader.split(",")[0].trim() : req.protocol;
  return `${proto}://${req.get("host")}`;
}

app.get("/", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = `${baseUrl}/`;
  const ogImageUrl = `${baseUrl}${siteData.seo.ogImagePath}`;
  const structuredDataJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteData.brand.name,
    jobTitle: siteData.brand.role,
    description: siteData.seo.description,
    url: canonicalUrl,
    email: siteData.contact.email,
    telephone: siteData.contact.phone,
    sameAs: [siteData.contact.fiverrUrl],
    knowsAbout: ["Website Development", "Dashboard Development", "Custom Web Applications"]
  });

  res.render("index", {
    siteData,
    year: new Date().getFullYear(),
    baseUrl,
    canonicalUrl,
    ogImageUrl,
    structuredDataJson
  });
});

app.get("/index.html", (req, res) => {
  res.redirect(301, "/");
});

app.get("/designs", (req, res) => {
  res.redirect(302, "/design-selector.html");
});

app.get("/api/profile", (req, res) => {
  res.json(siteData);
});

app.post("/contact", async (req, res) => {
  const trapField = cleanString(req.body?.website, 200);
  if (trapField) {
    return res.status(400).json({
      ok: false,
      error: "Invalid submission."
    });
  }

  const name = cleanString(req.body?.name, 120);
  const email = cleanString(req.body?.email, 160).toLowerCase();
  const projectType = cleanString(req.body?.projectType, 120);
  const budget = cleanString(req.body?.budget, 120);
  const timeline = cleanString(req.body?.timeline, 120);
  const message = cleanString(req.body?.message, 3000);

  if (name.length < 2) {
    return res.status(400).json({ ok: false, error: "Please enter your name." });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email." });
  }

  if (projectType.length < 2) {
    return res.status(400).json({ ok: false, error: "Please enter project type." });
  }

  if (message.length < 20) {
    return res.status(400).json({ ok: false, error: "Please add a bit more project detail." });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      ok: false,
      error: "Too many requests. Please wait a few minutes and try again."
    });
  }

  try {
    const info = await sendContactEmail({
      name,
      email,
      projectType,
      budget,
      timeline,
      message
    });

    return res.status(200).json({
      ok: true,
      message: "Thanks. Your project inquiry has been sent.",
      messageId: info.messageId
    });
  } catch (error) {
    if (error.code === "MAILER_NOT_CONFIGURED" || !isMailerConfigured()) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Contact form send skipped: mailer not configured.");
      }
      return res.status(503).json({
        ok: false,
        error: "Email delivery is not configured yet. Please use direct email for now."
      });
    }

    console.error("Contact form send failed:", error);

    return res.status(500).json({
      ok: false,
      error: "Could not send your message right now. Please try again shortly."
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/robots.txt", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const content = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
  res.type("text/plain").send(content);
});

app.get("/sitemap.xml", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const urls = ["/", "/designs"];
  const now = new Date().toISOString();
  const xml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${urls
    .map(
      (route) =>
        `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${route === "/" ? "1.0" : "0.6"}</priority>\n  </url>`
    )
    .join("\n")}\n</urlset>\n`;
  res.type("application/xml").send(xml);
});

app.use(express.static(publicDir, { index: false }));

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
