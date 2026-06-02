const siteData = {
  brand: {
    name: "Debajit Shil",
    role: "Website and Web App Developer",
    location: "Kolkata, India",
    logoIconPath: "/brand/logo-icon",
    logoWidePath: "/brand/logo-dark"
  },
  seo: {
    siteName: "Student Dev",
    title: "Student Dev | Debajit Shil - Website and Web App Developer",
    description:
      "Student Dev is the portfolio of Debajit Shil, building professional websites, dashboards, and custom web applications with a minimal, polished, and SEO-aware approach.",
    keywords:
      "student dev, debajit shil, website developer india, dashboard developer, custom web app developer, freelance web developer",
    ogImagePath: "/brand/logo-dark"
  },
  hero: {
    eyebrow: "Student Dev • Available for focused freelance work",
    heading: "Minimal, professional web products for brands and internal teams.",
    subline:
      "I design and build websites, dashboards, and internal tools that stay clear, fast, and maintainable after launch.",
    intro:
      "The goal is simple: deliver a stronger front-end impression and a cleaner product underneath without turning the process into agency-style noise.",
    imagePath: "/assests/hero-stitch-remote.png",
    imageAlt: "Minimal desk setup with a laptop, pencils, and books",
    imageMetric: "99.9%",
    imageMetricLabel: "Performance score",
    primaryCtaLabel: "Start a Project",
    secondaryCtaLabel: "Selected Work",
    highlights: [
      "Portfolio websites with stronger positioning",
      "Dashboards built around real workflows",
      "Custom web apps with clean implementation"
    ]
  },
  capabilities: [
    {
      title: "Websites",
      description: "Professional marketing and portfolio websites with stronger hierarchy, SEO foundations, and a calmer visual system."
    },
    {
      title: "Dashboards",
      description: "Operational interfaces that make reporting, management, and internal processes easier to use without clutter."
    },
    {
      title: "Custom Tools",
      description: "Purpose-built internal products designed around the exact workflow instead of a generic template."
    }
  ],
  servicesIntro:
    "Each engagement stays focused on practical outcomes: better messaging on the surface, clearer systems underneath, and a handoff that does not create future friction.",
  services: [
    {
      title: "Business & Portfolio Websites",
      description:
        "Professional websites with sharper positioning, cleaner UI, responsive layouts, and a structure that supports SEO from the start.",
      deliverables: ["Content structure", "Responsive UI", "Performance-minded build"]
    },
    {
      title: "Dashboards & Admin Panels",
      description:
        "Back-office products that reduce day-to-day friction and keep complex workflows readable for the people actually using them.",
      deliverables: ["Task-focused flows", "Role-aware interfaces", "Clean information hierarchy"]
    },
    {
      title: "Custom Web Applications",
      description:
        "Lean internal SaaS tools and workflow systems with maintainable architecture, clear states, and room to grow after launch.",
      deliverables: ["Tailored feature planning", "Maintainable implementation", "Launch-ready delivery"]
    }
  ],
  workIntro:
    "Two recent projects that show both ends of the work: polished public-facing design and heavier internal product systems.",
  projects: [
    {
      name: "Cadeus.in",
      year: "2026",
      category: "Brand Website",
      imagePath: "/assests/work-cadeus.png",
      imageAlt: "CADEUS antifragility consulting website preview",
      summary:
        "A structured boutique consulting website for organisations and individuals navigating stress, with a clear first-screen narrative and dedicated paths for antifragility, restoration, neuro consulting, and advocacy.",
      outcome: "A focused consulting presence that turns a complex five-service model into a clear, credible path for engagement.",
      tags: ["Brand Website", "Responsive Build", "Content Structure"]
    },
    {
      name: "Margawellness.in",
      year: "2026",
      category: "Operations Dashboard",
      imagePath: "/assests/work-marga.png",
      imageAlt: "Margawellness dashboard preview",
      summary:
        "An internal system for appointments, reporting, finance, and staff operations, designed to keep day-to-day work readable inside one interface.",
      outcome: "A more usable internal workflow with clearer reporting views and less operational fragmentation.",
      tags: ["Dashboard", "Reporting", "Internal SaaS"]
    }
  ],
  approachIntro:
    "The work is intentionally restrained. The point is not decoration. The point is clarity, control, and fewer decisions left unresolved during build.",
  principles: [
    {
      title: "Minimal by default",
      description: "Every screen should make the next action obvious and remove avoidable visual noise."
    },
    {
      title: "Concrete communication",
      description: "Scope, decisions, and tradeoffs are written clearly so the project stays predictable."
    },
    {
      title: "Built for handoff",
      description: "The finished product should be maintainable, extendable, and usable without constant developer support."
    }
  ],
  processSteps: [
    {
      step: "01",
      title: "Align",
      description: "Clarify the goal, the audience, and the non-negotiables before the interface starts taking shape."
    },
    {
      step: "02",
      title: "Design the system",
      description: "Set the visual direction, page structure, and interaction rhythm with a minimal, consistent language."
    },
    {
      step: "03",
      title: "Build carefully",
      description: "Develop the product with maintainable structure, responsive behavior, and practical implementation choices."
    },
    {
      step: "04",
      title: "Launch cleanly",
      description: "Deploy, verify, and hand over a system that can be managed with confidence after release."
    }
  ],
  contact: {
    email: process.env.CONTACT_EMAIL || "services@student-dev.in",
    phone: process.env.CONTACT_PHONE || "+91 8697378521",
    phoneHref: `tel:${(process.env.CONTACT_PHONE || "+91 8697378521").replace(/\s+/g, "")}`,
    fiverrUsername: process.env.FIVERR_USERNAME || "appr_radio",
    fiverrUrl: process.env.FIVERR_URL || "https://www.fiverr.com/appr_radio",
    ctaTitle: "Let’s build something cleaner, sharper, and easier to use.",
    ctaText:
      "Send the scope, timeline, or even a rough brief. I will reply with a direct next step instead of a vague pitch.",
    ctaLabel: "Send Inquiry",
    responseTime: "Usually replies within 24 hours on business days."
  }
};

module.exports = siteData;
