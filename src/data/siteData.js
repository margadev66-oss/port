const siteData = {
  brand: {
    name: "Debajit Shil",
    role: "Student Developer",
    logoIconPath: "/brand/logo-icon",
    logoWidePath: "/brand/logo-dark"
  },
  seo: {
    title: "Debajit Shil | Student Developer",
    description:
      "Student developer building professional websites, dashboards, and custom web applications at affordable pricing.",
    keywords:
      "student developer, web developer india, affordable website developer, custom web app developer, dashboard development, freelance web developer",
    ogImagePath: "/brand/logo-light"
  },
  hero: {
    heading: "Professional Websites and Web Apps at Affordable Pricing",
    subline: "Clean systems. Clear communication. Reliable delivery.",
    intro:
      "I am a student developer who builds practical websites and web applications that clients can manage easily. If you need a modern website, dashboard, or custom web app without agency-level pricing, I can help.",
    primaryCtaLabel: "Start a Project"
  },
  stats: [
    {
      value: "2+",
      label: "Production projects highlighted with real business use-cases"
    },
    {
      value: "End-to-End",
      label: "From visual direction to admin-ready, maintainable systems"
    },
    {
      value: "Affordable",
      label: "Custom development without high agency overhead"
    }
  ],
  services: [
    {
      title: "Business Websites",
      description:
        "Conversion-focused websites with premium visual identity and clear content structure for your clients."
    },
    {
      title: "Dashboards & Admin Panels",
      description:
        "Back-office interfaces for managing content, users, and operations without developer dependency."
    },
    {
      title: "Custom Web Applications",
      description:
        "Full-stack web apps designed around your real workflow, with maintainable architecture."
    }
  ],
  projects: [
    {
      name: "Vivartana.com",
      summary:
        "Portfolio website with a custom admin panel to keep content updates smooth while preserving a curated premium look.",
      tags: ["Portfolio Site", "Custom Admin", "Content Control"],
      url: "https://vivartana.com"
    },
    {
      name: "Margawellness.in",
      summary:
        "Full management web app for a mental health organization, supporting practical internal workflows and day-to-day operations.",
      tags: ["Web App", "Operations", "Healthcare Org"],
      url: "https://margawellness.in"
    }
  ],
  processSteps: [
    {
      step: "Step 01",
      title: "Requirement Clarity",
      description: "Understand business goals, users, and feature priorities."
    },
    {
      step: "Step 02",
      title: "Structure & UI Direction",
      description: "Define layout and interaction decisions before heavy development."
    },
    {
      step: "Step 03",
      title: "Build & Integrate",
      description: "Develop pages and systems with practical and maintainable structure."
    },
    {
      step: "Step 04",
      title: "Launch & Handover",
      description: "Deploy cleanly and ensure your team can confidently manage the system."
    }
  ],
  contact: {
    email: process.env.CONTACT_EMAIL || "margadev66@gmail.com",
    phone: process.env.CONTACT_PHONE || "+91 8697378521",
    fiverrUsername: process.env.FIVERR_USERNAME || "appr_radio",
    fiverrUrl: process.env.FIVERR_URL || "https://www.fiverr.com/appr_radio",
    ctaTitle: "Need a modern website, dashboard, or custom web app?",
    ctaText: "Send your scope and timeline, and I will reply with a clear execution plan.",
    ctaLabel: "Send Inquiry"
  }
};

module.exports = siteData;
