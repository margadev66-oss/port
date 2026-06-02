const fs = require("fs");
const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const QRCode = require("qrcode");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const heicConvert = require("heic-convert");
const { Document, Packer, Paragraph, TextRun } = require("docx");

require("./loadEnv");

const siteData = require("./data/siteData");
const toolsData = require("./data/toolsData");
const { sendContactEmail, sendToolSuggestionEmail, isMailerConfigured } = require("./services/contactMailer");

const app = express();
const rootDir = path.join(__dirname, "..");
const publicDir = path.join(__dirname, "..", "public");
const contactAttempts = new Map();
const toolSuggestionAttempts = new Map();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});
const assetRoutes = {
  showcaseCss: "/showcase-style",
  logoIcon: "/brand/logo-icon",
  logoDark: "/brand/logo-dark",
  logoLight: "/brand/logo-light"
};
const retiredRoutes = [
  "/designs",
  "/design-selector.html",
  "/concepts/classic",
  "/concepts/dark",
  "/concepts/editorial",
  "/concepts/classic-premium.html",
  "/concepts/dark-product.html",
  "/concepts/editorial-personal.html"
];

const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_RATE_LIMIT_MAX = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const HOME_SEO_SOURCE_FILES = [
  "src/app.js",
  "src/data/siteData.js",
  "views/index.ejs",
  "public/css/showcase.css"
];
const TOOLS_SEO_SOURCE_FILES = [
  "src/app.js",
  "src/data/toolsData.js",
  "views/tools-index.ejs",
  "views/tool-category.ejs",
  "views/tool-page.ejs",
  "views/tool-static.ejs",
  "views/partials/tools-head.ejs",
  "views/partials/tools-header.ejs",
  "views/partials/tools-footer.ejs",
  "views/partials/adsense-unit.ejs",
  "public/css/tools.css",
  "public/js/tools.js",
  "src/client/backgroundRemovalEntry.js"
];

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

function isRateLimited(store, ip) {
  const now = Date.now();
  const windowStart = now - CONTACT_RATE_LIMIT_WINDOW_MS;
  const recentAttempts = (store.get(ip) || []).filter((timestamp) => timestamp > windowStart);

  if (recentAttempts.length >= CONTACT_RATE_LIMIT_MAX) {
    store.set(ip, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  store.set(ip, recentAttempts);
  return false;
}

function getBaseUrl(req) {
  const configured = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");
  if (configured) return configured;

  const protoHeader = req.get("x-forwarded-proto");
  const proto = protoHeader ? protoHeader.split(",")[0].trim() : req.protocol;
  return `${proto}://${req.get("host")}`;
}

function buildAbsoluteUrl(baseUrl, relativePath = "/") {
  try {
    return new URL(relativePath, `${baseUrl}/`).toString();
  } catch (error) {
    const normalizedPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
    return `${baseUrl}${normalizedPath}`;
  }
}

function getHostname(baseUrl) {
  try {
    return new URL(baseUrl).host;
  } catch (error) {
    return baseUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

function getLatestModifiedTime(relativePaths) {
  const latestTimestamp = relativePaths.reduce((latest, relativePath) => {
    try {
      const stats = fs.statSync(path.join(rootDir, relativePath));
      return Math.max(latest, stats.mtimeMs);
    } catch (error) {
      return latest;
    }
  }, 0);

  return latestTimestamp ? new Date(latestTimestamp).toISOString() : new Date().toISOString();
}

const HOME_LAST_MODIFIED = getLatestModifiedTime(HOME_SEO_SOURCE_FILES);
const TOOLS_LAST_MODIFIED = getLatestModifiedTime(TOOLS_SEO_SOURCE_FILES);

function buildBreadcrumbStructuredData(canonicalUrl, entries) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    itemListElement: entries.map((entry, index) => {
      const item = {
        "@type": "ListItem",
        position: index + 1,
        name: entry.name
      };

      if (entry.url) {
        item.item = entry.url;
      }

      return item;
    })
  };
}

function buildToolsWebsiteStructuredData(baseUrl) {
  const toolsUrl = buildAbsoluteUrl(baseUrl, "/tools");
  return {
    "@type": "WebSite",
    "@id": `${toolsUrl}#website`,
    url: toolsUrl,
    name: toolsData.hub.title,
    description: toolsData.hub.seoDescription,
    inLanguage: "en"
  };
}

function buildToolApplicationStructuredData(canonicalUrl, tool) {
  return {
    "@type": "WebApplication",
    "@id": `${canonicalUrl}#application`,
    name: tool.name,
    url: canonicalUrl,
    description: tool.description,
    applicationCategory: tool.categoryData.name,
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern browser.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    featureList: [
      tool.helperText,
      ...tool.steps.map((step) => `${step.title}: ${step.body}`)
    ].filter(Boolean)
  };
}

function getSitemapEntries(baseUrl) {
  const baseEntries = [
    { route: "/", lastmod: HOME_LAST_MODIFIED, changefreq: "monthly", priority: "1.0" },
    { route: "/tools", lastmod: TOOLS_LAST_MODIFIED, changefreq: "weekly", priority: "0.95" },
    { route: "/about-tools", lastmod: TOOLS_LAST_MODIFIED, changefreq: "monthly", priority: "0.55" },
    { route: "/privacy", lastmod: TOOLS_LAST_MODIFIED, changefreq: "yearly", priority: "0.35" },
    { route: "/terms", lastmod: TOOLS_LAST_MODIFIED, changefreq: "yearly", priority: "0.35" }
  ];
  const categoryEntries = toolsData.categories.map((category) => ({
    route: category.path,
    lastmod: TOOLS_LAST_MODIFIED,
    changefreq: "weekly",
    priority: "0.8"
  }));
  const toolEntries = toolsData.tools.map((tool) => ({
    route: tool.path,
    lastmod: TOOLS_LAST_MODIFIED,
    changefreq: "weekly",
    priority: "0.72"
  }));

  return [...baseEntries, ...categoryEntries, ...toolEntries].map((entry) => ({
    ...entry,
    loc: buildAbsoluteUrl(baseUrl, entry.route)
  }));
}

function sendPublicFile(res, relativePath, contentType) {
  if (contentType) {
    res.type(contentType);
  }
  res.sendFile(path.join(publicDir, relativePath));
}

function buildDataUrl(mimeType, buffer) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function createDownloadName(name, extension) {
  const stem = cleanString(name || "file", 120).replace(/\.[^/.]+$/, "") || "file";
  return `${stem}${extension}`;
}

function getGeminiApiKey() {
  return (
    cleanString(process.env.GEMINI_API_KEY || "", 400) ||
    cleanString(process.env.GOOGLE_AI_API_KEY || "", 400) ||
    cleanString(process.env.GEMINI || "", 400)
  );
}

function parseDataUrl(dataUrl) {
  const match = cleanString(dataUrl, 10_000_000).match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    data: match[2]
  };
}

function extractGeminiText(payload) {
  return (payload?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

async function generateGeminiContent(parts, options = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: options.temperature ?? 0.35,
          maxOutputTokens: options.maxOutputTokens ?? 900
        }
      })
    }
  );

  const json = await response.json();
  if (!response.ok) {
    const message = json?.error?.message || "Could not generate AI output right now.";
    throw new Error(message);
  }

  const text = extractGeminiText(json);
  if (!text) {
    throw new Error("The AI model did not return usable text.");
  }

  return text;
}

function buildAiPrompt(toolSlug, input, secondary) {
  const mainInput = cleanString(input, 25_000);
  const sideInput = cleanString(secondary, 500);

  if (toolSlug === "ai-prompt-formatter") {
    return [
      "You improve rough prompts into tighter reusable prompts.",
      "Preserve the user's real requirements, constraints, and tone.",
      "Return markdown with these headings only:",
      "## Task",
      "## Context",
      "## Constraints",
      "## Output Format",
      "## Improved Prompt",
      sideInput ? `Additional focus: ${sideInput}` : "",
      "Source prompt:",
      mainInput
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (toolSlug === "seo-meta-generator") {
    return [
      "You generate SEO metadata for a single page.",
      "Return markdown with these sections only:",
      "## Title Options",
      "3 options, each under 60 characters.",
      "## Meta Description Options",
      "3 options, each under 155 characters.",
      "## Suggested H1",
      sideInput ? `Primary keyword: ${sideInput}` : "Primary keyword: none provided",
      "Page copy or summary:",
      mainInput
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (toolSlug === "transcript-summarizer") {
    return [
      "You summarize transcripts into useful working notes.",
      "Return markdown with these sections only:",
      "## Short Summary",
      "## Key Points",
      "## Action Items",
      "## Reusable Content Angles",
      sideInput ? `Summary focus: ${sideInput}` : "",
      "Transcript:",
      mainInput
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (toolSlug === "blog-outline-generator") {
    return [
      "You generate SEO-aware article outlines from rough notes, a topic, or source copy.",
      "Return markdown with these sections only:",
      "## Title Ideas",
      "3 options.",
      "## Recommended Angle",
      "## Outline",
      "Use H2 and H3 bullet structure.",
      "## FAQ Ideas",
      "## CTA Ideas",
      sideInput ? `Primary keyword: ${sideInput}` : "Primary keyword: none provided",
      "Source topic or notes:",
      mainInput
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (toolSlug === "faq-schema-generator") {
    return [
      "You generate concise FAQ copy and matching JSON-LD schema.",
      "Return markdown with these sections only:",
      "## FAQ Copy",
      "Write 5 question and answer pairs.",
      "## JSON-LD",
      "Return valid FAQPage schema inside one fenced json code block.",
      sideInput ? `Primary keyword: ${sideInput}` : "Primary keyword: none provided",
      "Page summary or topic:",
      mainInput
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (toolSlug === "image-alt-text-generator") {
    return [
      "You describe an image for accessibility and content reuse.",
      "Return markdown with these sections only:",
      "## Alt Text",
      "1 concise option under 125 characters.",
      "## Extended Description",
      "2 to 4 sentences.",
      "## Caption Ideas",
      "3 short caption options.",
      sideInput ? `Tone or intent: ${sideInput}` : "",
      mainInput ? `Extra context from the user:\n${mainInput}` : "Extra context from the user: none"
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  throw new Error("Unsupported AI tool.");
}

let youtubeTranscriptModulePromise;

async function getYoutubeTranscriptModule() {
  if (!youtubeTranscriptModulePromise) {
    youtubeTranscriptModulePromise = import("youtube-transcript/dist/youtube-transcript.esm.js");
  }

  return youtubeTranscriptModulePromise;
}

function extractYouTubeId(input) {
  const value = cleanString(input, 500);
  if (!value) return "";

  const directId = value.match(/^[A-Za-z0-9_-]{11}$/);
  if (directId) return directId[0];

  const watchMatch = value.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  const shortMatch = value.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  const embedMatch = value.match(/embed\/([A-Za-z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return "";
}

function buildStructuredData(items) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": items
  });
}

function renderToolPage(res, req, view, pageMeta) {
  const baseUrl = getBaseUrl(req);
  const ogImageUrl = `${baseUrl}${siteData.seo.ogImagePath}`;
  const canonicalUrl = `${baseUrl}${req.path}`;

  if (pageMeta.lastModified) {
    res.set("Last-Modified", new Date(pageMeta.lastModified).toUTCString());
  }

  res.render(view, {
    ...pageMeta,
    siteData,
    assetRoutes,
    toolsCategories: toolsData.categories,
    year: new Date().getFullYear(),
    baseUrl,
    canonicalUrl,
    ogImageUrl
  });
}

app.get("/", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = `${baseUrl}/`;
  const ogImageUrl = `${baseUrl}${siteData.seo.ogImagePath}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: siteData.seo.siteName,
        description: siteData.seo.description,
        inLanguage: "en",
        potentialAction: {
          "@type": "ContactAction",
          target: `${canonicalUrl}#contact`
        }
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: siteData.seo.title,
        isPartOf: {
          "@id": `${canonicalUrl}#website`
        },
        about: {
          "@id": `${canonicalUrl}#person`
        },
        description: siteData.seo.description,
        primaryImageOfPage: ogImageUrl,
        inLanguage: "en"
      },
      {
        "@type": "Person",
        "@id": `${canonicalUrl}#person`,
        name: siteData.brand.name,
        alternateName: siteData.seo.siteName,
        jobTitle: siteData.brand.role,
        description: siteData.seo.description,
        url: canonicalUrl,
        email: siteData.contact.email,
        telephone: siteData.contact.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Kolkata",
          addressCountry: "IN"
        },
        image: ogImageUrl,
        knowsAbout: ["Website Development", "Dashboard Development", "Custom Web Applications"]
      },
      {
        "@type": "ContactPoint",
        "@id": `${canonicalUrl}#contact-point`,
        contactType: "sales",
        email: siteData.contact.email,
        telephone: siteData.contact.phone,
        availableLanguage: ["en"]
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#projects`,
        name: "Selected projects",
        itemListElement: siteData.projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: project.name,
          description: project.summary
        }))
      }
    ]
  };

  if (siteData.contact.fiverrUrl) {
    structuredData["@graph"][2].sameAs = [siteData.contact.fiverrUrl];
  }

  structuredData["@graph"].push(
    ...siteData.services.map((service, index) => ({
      "@type": "Service",
      "@id": `${canonicalUrl}#service-${index + 1}`,
      name: service.title,
      description: service.description,
      provider: {
        "@id": `${canonicalUrl}#person`
      },
      serviceType: service.title,
      areaServed: "Worldwide"
    }))
  );

  const structuredDataJson = JSON.stringify(structuredData);

  res.set("Last-Modified", new Date(HOME_LAST_MODIFIED).toUTCString());
  res.render("index", {
    siteData,
    assetRoutes,
    year: new Date().getFullYear(),
    baseUrl,
    canonicalUrl,
    ogImageUrl,
    structuredDataJson
  });
});

app.get("/tools", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = buildAbsoluteUrl(baseUrl, req.path);
  const collectionId = `${canonicalUrl}#collection`;
  const structuredDataJson = buildStructuredData([
    buildToolsWebsiteStructuredData(baseUrl),
    {
      "@type": "CollectionPage",
      "@id": collectionId,
      url: canonicalUrl,
      name: toolsData.hub.title,
      description: toolsData.hub.seoDescription,
      inLanguage: "en",
      isPartOf: {
        "@id": `${buildAbsoluteUrl(baseUrl, "/tools")}#website`
      },
      breadcrumb: {
        "@id": `${canonicalUrl}#breadcrumb`
      }
    },
    {
      "@type": "ItemList",
      "@id": `${canonicalUrl}#popular-tools`,
      itemListElement: toolsData.hub.popularTools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: buildAbsoluteUrl(baseUrl, tool.path)
      }))
    },
    buildBreadcrumbStructuredData(canonicalUrl, [
      { name: siteData.seo.siteName, url: buildAbsoluteUrl(baseUrl, "/") },
      { name: "Tools", url: canonicalUrl }
    ])
  ]);

  renderToolPage(res, req, "tools-index", {
    pageTitle: toolsData.hub.seoTitle,
    pageDescription: toolsData.hub.seoDescription,
    pageKeywords: toolsData.hub.seoKeywords,
    toolsHub: toolsData.hub,
    structuredDataJson,
    lastModified: TOOLS_LAST_MODIFIED
  });
});

app.get("/tools/:category", (req, res, next) => {
  const category = toolsData.getCategory(req.params.category);
  if (!category) return next();
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = buildAbsoluteUrl(baseUrl, req.path);

  const structuredDataJson = buildStructuredData([
    buildToolsWebsiteStructuredData(baseUrl),
    {
      "@type": "CollectionPage",
      "@id": `${canonicalUrl}#collection`,
      url: canonicalUrl,
      name: category.name,
      description: category.seoDescription,
      inLanguage: "en",
      isPartOf: {
        "@id": `${buildAbsoluteUrl(baseUrl, "/tools")}#website`
      },
      breadcrumb: {
        "@id": `${canonicalUrl}#breadcrumb`
      }
    },
    {
      "@type": "ItemList",
      "@id": `${canonicalUrl}#item-list`,
      itemListElement: category.tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: buildAbsoluteUrl(baseUrl, tool.path)
      }))
    },
    buildBreadcrumbStructuredData(canonicalUrl, [
      { name: siteData.seo.siteName, url: buildAbsoluteUrl(baseUrl, "/") },
      { name: "Tools", url: buildAbsoluteUrl(baseUrl, "/tools") },
      { name: category.name, url: canonicalUrl }
    ])
  ]);

  renderToolPage(res, req, "tool-category", {
    pageTitle: category.seoTitle,
    pageDescription: category.seoDescription,
    pageKeywords: category.seoKeywords,
    category,
    structuredDataJson,
    lastModified: TOOLS_LAST_MODIFIED
  });
});

app.get("/tools/:category/:toolSlug", (req, res, next) => {
  const tool = toolsData.getTool(req.params.category, req.params.toolSlug);
  if (!tool) return next();
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = buildAbsoluteUrl(baseUrl, req.path);

  const graph = [
    {
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      name: tool.h1,
      url: canonicalUrl,
      description: tool.description,
      isPartOf: {
        "@id": `${buildAbsoluteUrl(baseUrl, "/tools")}#website`
      },
      breadcrumb: {
        "@id": `${canonicalUrl}#breadcrumb`
      },
      about: {
        "@id": `${canonicalUrl}#application`
      },
      inLanguage: "en"
    },
    buildToolsWebsiteStructuredData(baseUrl),
    buildToolApplicationStructuredData(canonicalUrl, tool),
    buildBreadcrumbStructuredData(canonicalUrl, [
      { name: siteData.seo.siteName, url: buildAbsoluteUrl(baseUrl, "/") },
      { name: "Tools", url: buildAbsoluteUrl(baseUrl, "/tools") },
      { name: tool.categoryData.name, url: buildAbsoluteUrl(baseUrl, tool.categoryPath) },
      { name: tool.name, url: canonicalUrl }
    ])
  ];

  if (tool.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: tool.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    });
  }

  renderToolPage(res, req, "tool-page", {
    pageTitle: tool.seoTitle,
    pageDescription: tool.seoDescription,
    pageKeywords: tool.seoKeywords,
    tool,
    toolConfigJson: JSON.stringify({
      slug: tool.slug,
      type: tool.type,
      mode: tool.mode || "",
      targetKB: tool.targetKB || null,
      outputFormat: tool.outputFormat || "image/jpeg",
      supportsDimensions: tool.supportsDimensions !== false,
      supportsFormatSwitch: tool.supportsFormatSwitch !== false,
      inputLabel: tool.inputLabel || "",
      outputLabel: tool.outputLabel || "",
      actionLabel: tool.actionLabel || "",
      secondaryLabel: tool.secondaryLabel || "",
      secondaryPlaceholder: tool.secondaryPlaceholder || "",
      inputPlaceholder: tool.inputPlaceholder || "",
      imageInput: tool.imageInput === true,
      accept: tool.accept || ""
    }),
    needsPdfLib: tool.type === "pdf",
    needsBackgroundRemoval: tool.mode === "background-remover",
    structuredDataJson: buildStructuredData(graph),
    lastModified: TOOLS_LAST_MODIFIED
  });
});

app.get("/about-tools", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = buildAbsoluteUrl(baseUrl, "/about-tools");
  renderToolPage(res, req, "tool-static", {
    pageTitle: toolsData.aboutPage.seoTitle,
    pageDescription: toolsData.aboutPage.seoDescription,
    pageKeywords: "about student dev tools, utility tools platform, no login tools",
    page: toolsData.aboutPage,
    structuredDataJson: buildStructuredData([
      {
        "@type": "AboutPage",
        "@id": `${canonicalUrl}#webpage`,
        name: toolsData.aboutPage.title,
        url: canonicalUrl,
        description: toolsData.aboutPage.seoDescription,
        isPartOf: {
          "@id": `${buildAbsoluteUrl(baseUrl, "/tools")}#website`
        },
        inLanguage: "en"
      },
      buildToolsWebsiteStructuredData(baseUrl),
      buildBreadcrumbStructuredData(canonicalUrl, [
        { name: siteData.seo.siteName, url: buildAbsoluteUrl(baseUrl, "/") },
        { name: "Tools", url: buildAbsoluteUrl(baseUrl, "/tools") },
        { name: toolsData.aboutPage.title, url: canonicalUrl }
      ])
    ]),
    lastModified: TOOLS_LAST_MODIFIED
  });
});

app.get("/privacy", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = buildAbsoluteUrl(baseUrl, "/privacy");
  renderToolPage(res, req, "tool-static", {
    pageTitle: toolsData.privacyPage.seoTitle,
    pageDescription: toolsData.privacyPage.seoDescription,
    pageKeywords: "privacy policy, student dev tools privacy",
    page: toolsData.privacyPage,
    structuredDataJson: buildStructuredData([
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        name: toolsData.privacyPage.title,
        url: canonicalUrl,
        description: toolsData.privacyPage.seoDescription,
        isPartOf: {
          "@id": `${buildAbsoluteUrl(baseUrl, "/tools")}#website`
        },
        inLanguage: "en"
      },
      buildToolsWebsiteStructuredData(baseUrl),
      buildBreadcrumbStructuredData(canonicalUrl, [
        { name: siteData.seo.siteName, url: buildAbsoluteUrl(baseUrl, "/") },
        { name: "Tools", url: buildAbsoluteUrl(baseUrl, "/tools") },
        { name: toolsData.privacyPage.title, url: canonicalUrl }
      ])
    ]),
    lastModified: TOOLS_LAST_MODIFIED
  });
});

app.get("/terms", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = buildAbsoluteUrl(baseUrl, "/terms");
  renderToolPage(res, req, "tool-static", {
    pageTitle: toolsData.termsPage.seoTitle,
    pageDescription: toolsData.termsPage.seoDescription,
    pageKeywords: "terms of service, student dev tools terms",
    page: toolsData.termsPage,
    structuredDataJson: buildStructuredData([
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        name: toolsData.termsPage.title,
        url: canonicalUrl,
        description: toolsData.termsPage.seoDescription,
        isPartOf: {
          "@id": `${buildAbsoluteUrl(baseUrl, "/tools")}#website`
        },
        inLanguage: "en"
      },
      buildToolsWebsiteStructuredData(baseUrl),
      buildBreadcrumbStructuredData(canonicalUrl, [
        { name: siteData.seo.siteName, url: buildAbsoluteUrl(baseUrl, "/") },
        { name: "Tools", url: buildAbsoluteUrl(baseUrl, "/tools") },
        { name: toolsData.termsPage.title, url: canonicalUrl }
      ])
    ]),
    lastModified: TOOLS_LAST_MODIFIED
  });
});

app.get("/index.html", (req, res) => {
  res.redirect(301, "/");
});

retiredRoutes.forEach((route) => {
  app.all(route, (req, res) => {
    res.redirect(301, "/");
  });
});

app.get(assetRoutes.showcaseCss, (req, res) => {
  sendPublicFile(res, path.join("css", "showcase.css"), "text/css");
});

app.get(assetRoutes.logoIcon, (req, res) => {
  sendPublicFile(res, path.join("assests", "logo-v3-premium-icon.png"), "image/png");
});

app.get(assetRoutes.logoDark, (req, res) => {
  sendPublicFile(res, path.join("assests", "logo-v3-premium-dark.png"), "image/png");
});

app.get(assetRoutes.logoLight, (req, res) => {
  sendPublicFile(res, path.join("assests", "logo-v3-premium-light.png"), "image/png");
});

app.get("/api/profile", (req, res) => {
  res.set("X-Robots-Tag", "noindex, nofollow");
  res.json({
    ...siteData,
    assetRoutes
  });
});

app.post("/api/tools/qr", async (req, res) => {
  const text = cleanString(req.body?.text, 4000);
  const requestedSize = Number(req.body?.size);
  const size = Number.isFinite(requestedSize) ? Math.max(128, Math.min(1024, requestedSize)) : 512;

  if (!text) {
    return res.status(400).json({
      ok: false,
      error: "QR content is required."
    });
  }

  try {
    const [dataUrl, svg] = await Promise.all([
      QRCode.toDataURL(text, {
        width: size,
        margin: 1,
        errorCorrectionLevel: "M",
        color: {
          dark: "#0b1220",
          light: "#ffffff"
        }
      }),
      QRCode.toString(text, {
        type: "svg",
        width: size,
        margin: 1,
        errorCorrectionLevel: "M",
        color: {
          dark: "#0b1220",
          light: "#ffffff"
        }
      })
    ]);

    return res.status(200).json({
      ok: true,
      dataUrl,
      svg
    });
  } catch (error) {
    console.error("QR generation failed:", error);
    return res.status(500).json({
      ok: false,
      error: "Could not generate the QR code."
    });
  }
});

app.post("/api/tools/pdf-to-word", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file || !file.buffer) {
    return res.status(400).json({
      ok: false,
      error: "Upload one PDF file first."
    });
  }

  if (file.mimetype !== "application/pdf") {
    return res.status(400).json({
      ok: false,
      error: "Please upload a valid PDF file."
    });
  }

  try {
    const parser = new PDFParse({ data: file.buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const text = cleanString(parsed.text || "", 200000);

    if (!text) {
      return res.status(422).json({
        ok: false,
        error: "No readable text was found in this PDF."
      });
    }

    const paragraphs = text
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => new Paragraph({ children: [new TextRun(chunk)] }));

    const document = new Document({
      sections: [
        {
          children: paragraphs.length ? paragraphs : [new Paragraph(text)]
        }
      ]
    });

    const buffer = await Packer.toBuffer(document);
    return res.status(200).json({
      ok: true,
      fileName: createDownloadName(file.originalname, ".docx"),
      textLength: text.length,
      dataUrl: buildDataUrl(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        buffer
      )
    });
  } catch (error) {
    console.error("PDF to Word failed:", error);
    return res.status(500).json({
      ok: false,
      error: "Could not convert the PDF right now."
    });
  }
});

app.post("/api/tools/heic-to-jpg", upload.array("files", 20), async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];
  if (!files.length) {
    return res.status(400).json({
      ok: false,
      error: "Upload at least one HEIC file first."
    });
  }

  try {
    const outputs = await Promise.all(
      files.map(async (file) => {
        const outputBuffer = Buffer.from(
          await heicConvert({
            buffer: file.buffer,
            format: "JPEG",
            quality: 0.92
          })
        );

        return {
          fileName: createDownloadName(file.originalname, ".jpg"),
          size: outputBuffer.length,
          dataUrl: buildDataUrl("image/jpeg", outputBuffer)
        };
      })
    );

    return res.status(200).json({
      ok: true,
      files: outputs
    });
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    return res.status(500).json({
      ok: false,
      error: "Could not convert the HEIC file right now."
    });
  }
});

app.post("/api/tools/youtube-transcript", async (req, res) => {
  const videoId = extractYouTubeId(req.body?.input);
  if (!videoId) {
    return res.status(400).json({
      ok: false,
      error: "Enter a valid YouTube URL or video ID."
    });
  }

  try {
    const { YoutubeTranscript } = await getYoutubeTranscriptModule();
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const text = transcript
      .map((item) => cleanString(item.text || "", 3000))
      .filter(Boolean)
      .join("\n");

    if (!text) {
      return res.status(422).json({
        ok: false,
        error: "No transcript was available for that video."
      });
    }

    return res.status(200).json({
      ok: true,
      text
    });
  } catch (error) {
    console.error("YouTube transcript fetch failed:", error);
    return res.status(500).json({
      ok: false,
      error: "Could not fetch the transcript for that video."
    });
  }
});

app.post("/api/tools/ai", async (req, res) => {
  const toolSlug = cleanString(req.body?.tool, 120);
  const input = cleanString(req.body?.input, 25_000);
  const secondary = cleanString(req.body?.secondary, 500);
  const image = typeof req.body?.image === "string" ? parseDataUrl(req.body.image) : null;
  const aiTool = toolsData.tools.find((tool) => tool.slug === toolSlug && tool.type === "ai");

  if (!toolSlug) {
    return res.status(400).json({
      ok: false,
      error: "AI tool identifier is required."
    });
  }

  if (!aiTool) {
    return res.status(404).json({
      ok: false,
      error: "The requested AI tool does not exist."
    });
  }

  if (!input && !image) {
    return res.status(400).json({
      ok: false,
      error: "Provide text or an image before running the AI tool."
    });
  }

  try {
    const prompt = buildAiPrompt(toolSlug, input, secondary);
    const parts = [{ text: prompt }];

    if (image) {
      parts.push({
        inline_data: {
          mime_type: image.mimeType,
          data: image.data
        }
      });
    }

    const text = await generateGeminiContent(parts, {
      temperature: toolSlug === "seo-meta-generator" ? 0.55 : 0.35,
      maxOutputTokens: toolSlug === "image-alt-text-generator" ? 700 : 1000
    });

    return res.status(200).json({
      ok: true,
      text
    });
  } catch (error) {
    console.error("AI tool generation failed:", error);
    const statusCode = /configured|api key/i.test(error.message) ? 503 : 500;
    return res.status(statusCode).json({
      ok: false,
      error: error.message || "Could not generate the AI output."
    });
  }
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
  if (isRateLimited(contactAttempts, clientIp)) {
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

app.post("/api/tools/suggestions", async (req, res) => {
  const trapField = cleanString(req.body?.website, 200);
  if (trapField) {
    return res.status(400).json({
      ok: false,
      error: "Invalid submission."
    });
  }

  const name = cleanString(req.body?.name, 120);
  const email = cleanString(req.body?.email, 160).toLowerCase();
  const category = cleanString(req.body?.category, 120);
  const toolName = cleanString(req.body?.toolName, 160);
  const details = cleanString(req.body?.details, 3000);
  const sourcePage = cleanString(req.body?.sourcePage, 500) || buildAbsoluteUrl(getBaseUrl(req), "/tools#suggest-tool");

  if (name && name.length < 2) {
    return res.status(400).json({ ok: false, error: "Please enter a valid name or leave it blank." });
  }

  if (email && !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email or leave it blank." });
  }

  if (toolName.length < 3) {
    return res.status(400).json({ ok: false, error: "Please enter the tool you want to suggest." });
  }

  if (details.length < 20) {
    return res.status(400).json({ ok: false, error: "Please add a bit more detail about the tool idea." });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(toolSuggestionAttempts, clientIp)) {
    return res.status(429).json({
      ok: false,
      error: "Too many requests. Please wait a few minutes and try again."
    });
  }

  try {
    const info = await sendToolSuggestionEmail({
      name,
      email,
      category,
      toolName,
      details,
      sourcePage
    });

    return res.status(200).json({
      ok: true,
      message: "Thanks. Your tool suggestion has been sent.",
      messageId: info.messageId
    });
  } catch (error) {
    if (error.code === "MAILER_NOT_CONFIGURED" || !isMailerConfigured()) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Tool suggestion send skipped: mailer not configured.");
      }
      return res.status(503).json({
        ok: false,
        error: "Email delivery is not configured yet. Please try again later."
      });
    }

    console.error("Tool suggestion send failed:", error);

    return res.status(500).json({
      ok: false,
      error: "Could not send the tool suggestion right now. Please try again shortly."
    });
  }
});

app.get("/health", (req, res) => {
  res.set("X-Robots-Tag", "noindex, nofollow");
  res.status(200).json({ status: "ok" });
});

app.get("/robots.txt", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const content = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /health\n\nHost: ${getHostname(baseUrl)}\nSitemap: ${buildAbsoluteUrl(baseUrl, "/sitemap.xml")}\n`;
  res.type("text/plain").send(content);
});

app.get("/sitemap.xml", (req, res) => {
  const baseUrl = getBaseUrl(req);
  const urls = getSitemapEntries(baseUrl);
  const xml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${urls
    .map(
      (entry) =>
        `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
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
