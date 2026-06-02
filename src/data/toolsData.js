const categoryDefinitions = {
  image: {
    slug: "image",
    name: "Image Tools",
    icon: "image",
    shortDescription: "Resize, compress, and convert images with faster browser workflows.",
    description:
      "Image utilities for size-sensitive uploads, quick format changes, and basic compression. These tools are optimized for the common exact-intent searches that tend to drive repeat traffic.",
    heroEyebrow: "Browser-first image utilities",
    heroTitle: "Resize and optimize images without leaving the browser.",
    heroCopy:
      "Use exact-size presets, convert formats, and generate lighter files for forms, portals, and faster websites.",
    seoTitle: "Image Tools | Student Dev Tools",
    seoDescription:
      "Free image tools for resizing, target-size compression, and format conversion. Works directly in your browser.",
    seoKeywords:
      "image tools, image resizer, resize image to 100kb, compress jpeg, png to jpg, browser image tools"
  },
  pdf: {
    slug: "pdf",
    name: "PDF Tools",
    icon: "picture_as_pdf",
    shortDescription: "Merge PDFs and turn image files into PDFs with simple browser workflows.",
    description:
      "Lightweight PDF workflows focused on common search intent. The first batch covers merging files and converting images into PDFs with a cleaner workflow.",
    heroEyebrow: "Practical PDF workflows",
    heroTitle: "Handle everyday PDF tasks with a cleaner workflow.",
    heroCopy:
      "Merge PDFs and build PDFs from images with fast tools that keep the interaction straightforward.",
    seoTitle: "PDF Tools | Student Dev Tools",
    seoDescription:
      "Free PDF tools for merging PDFs and converting images to PDF. Clean workflow, no account required.",
    seoKeywords:
      "pdf tools, merge pdf, jpg to pdf, free pdf tools, browser pdf tools"
  },
  qr: {
    slug: "qr",
    name: "QR Tools",
    icon: "qr_code_2",
    shortDescription: "Generate QR codes for links, Wi-Fi, and WhatsApp in a few seconds.",
    description:
      "Quick QR generators for the most common use cases: plain URLs, Wi-Fi access, and WhatsApp click-to-chat links.",
    heroEyebrow: "Shareable QR utilities",
    heroTitle: "Generate QR codes for the exact thing you need to share.",
    heroCopy:
      "Make clean QR codes for URLs, Wi-Fi credentials, or WhatsApp outreach without logging in or entering a longer workflow.",
    seoTitle: "QR Tools | Student Dev Tools",
    seoDescription:
      "Free QR generators for links, Wi-Fi QR codes, and WhatsApp links. Instant export and clean output.",
    seoKeywords:
      "qr code generator, wifi qr code generator, whatsapp link generator, free qr tools"
  },
  dev: {
    slug: "dev",
    name: "Developer Tools",
    icon: "code",
    shortDescription: "Format, validate, convert, and transform JSON, text, markdown, regex, and utility data.",
    description:
      "Utility pages for formatting payloads, converting data, writing cleaner markdown, decoding tokens, testing regex patterns, and handling common text workflows with less clutter.",
    heroEyebrow: "Fast format and conversion helpers",
    heroTitle: "Developer and text utilities with less friction and clearer output.",
    heroCopy:
      "Use focused pages for JSON, XML, CSV, markdown, regex, token inspection, text metrics, and encoding workflows without loading a bulky editor.",
    seoTitle: "Developer Tools | Student Dev Tools",
    seoDescription:
      "Free online JSON, XML, CSV, markdown, regex, Base64, JWT, word counter, URL encode/decode, and timestamp tools with a faster, cleaner interface.",
    seoKeywords:
      "developer tools, json formatter, markdown editor, regex tester, jwt decoder, csv to json, base64 decode, url encode, epoch converter"
  },
  ai: {
    slug: "ai",
    name: "AI Tools",
    icon: "auto_awesome",
    shortDescription: "AI-assisted writing, SEO, transcript, and image-description tools for focused tasks.",
    description:
      "AI utilities for prompt cleanup, transcript summarization, metadata generation, and image-to-text assistance. These pages use a lightweight server-side AI call but keep the interaction focused and task-specific.",
    heroEyebrow: "Focused AI utilities",
    heroTitle: "Use AI for the exact content task you are trying to finish.",
    heroCopy:
      "Generate tighter prompts, summaries, SEO metadata, and accessibility copy with smaller, task-first pages instead of broad chat interfaces.",
    seoTitle: "AI Tools | Student Dev Tools",
    seoDescription:
      "Free AI tools for prompt formatting, transcript summarization, alt text generation, and SEO metadata creation.",
    seoKeywords:
      "ai tools, ai prompt formatter, transcript summarizer, alt text generator, seo meta generator"
  },
  assets: {
    slug: "assets",
    name: "Asset Tools",
    icon: "deployed_code",
    shortDescription: "Customize icons, create simple mockups, and build creator-friendly exports.",
    description:
      "Asset utilities for creators and front-end teams, focused on open-safe icon workflows and basic presentation outputs.",
    heroEyebrow: "Creator-side utility pages",
    heroTitle: "Asset helpers for icons, mockups, and visual output.",
    heroCopy:
      "Build small but useful design-side workflows with cleaner export options and simpler output.",
    seoTitle: "Asset Tools | Student Dev Tools",
    seoDescription:
      "Free asset and creator tools for SVG icon customization, mockups, and visual export workflows.",
    seoKeywords:
      "asset tools, svg icon customizer, device mockup generator, creator tools"
  }
};

const commonBrowserPromises = [
  "Free",
  "Runs in your browser"
];

const commonInstantPromises = [
  "Free",
  "Instant export"
];

const hubCopy = {
  title: "Student Dev Tools",
  seoTitle: "Free Micro Tools | Student Dev Tools",
  seoDescription:
    "A growing set of free tools for images, PDFs, QR codes, developer workflows, and focused AI tasks. Designed for speed, privacy, and high-intent search use cases.",
  seoKeywords:
    "free micro tools, image resizer, merge pdf, qr code generator, json formatter, ai tools",
  eyebrow: "Utility pages for high-intent workflows",
  heading: "Tools for images, PDFs, QR, developer, and AI workflows.",
  intro:
    "The platform is designed around direct utility: open the page, solve the task, and leave with the finished file or cleaned output. Clear workflows, direct exports, and less clutter.",
  primaryCtaLabel: "Browse categories",
  primaryCtaHref: "#tool-categories",
  secondaryCtaLabel: "Open popular tools",
  secondaryCtaHref: "#popular-tools",
  trustPoints: [
    "Browser processing where it makes sense",
    "Fast pages built for repeat searches",
    "Clear privacy notes on every tool page"
  ]
};

function makeImageTool({
  slug,
  name,
  keyword,
  description,
  intro,
  targetKB = null,
  outputFormat = "image/jpeg",
  supportsDimensions = true,
  supportsFormatSwitch = true,
  relatedSlugs = [],
  faqExtra = []
}) {
  const title = targetKB ? `Resize Image to ${targetKB}KB` : name;
  return {
    slug,
    category: "image",
    name,
    h1: title,
    icon: "image",
    type: "image",
    variant: targetKB ? "target-size" : "general",
    targetKeyword: keyword,
    description,
    intro,
    helperText: targetKB
      ? `This preset tries to bring the exported file close to ${targetKB}KB while keeping the image readable for upload forms and portals.`
      : "Resize dimensions, reduce the file size, and export a lighter image with fewer clicks.",
    promises: commonBrowserPromises,
    processingMode: "browser",
    outputFormat,
    supportsDimensions,
    supportsFormatSwitch,
    targetKB,
    accept: "image/png,image/jpeg,image/webp",
    maxFileSizeLabel: "20MB per image",
    relatedSlugs,
    steps: [
      {
        title: "Select an image",
        body: "Upload a JPG, PNG, or WebP file from your device."
      },
      {
        title: targetKB ? "Apply the target preset" : "Adjust the settings",
        body: targetKB
          ? `The page will try to compress the export toward ${targetKB}KB automatically.`
          : "Set the width, height, output format, and quality based on what you need."
      },
      {
        title: "Download the result",
        body: "Preview the processed image, check the new file size, and download it instantly."
      }
    ],
    faq: [
      {
        question: "Does this tool upload my image?",
        answer:
          "No. Image processing happens in your browser on this page, so your file does not get uploaded to Student Dev servers."
      },
      {
        question: "Why is hitting an exact KB target sometimes difficult?",
        answer:
          "Image compression depends on the original resolution, colors, and detail level. The tool aims for the target size, but highly detailed images may require lower quality or smaller dimensions."
      },
      {
        question: "Which formats can I use?",
        answer:
          "You can upload JPG, PNG, and WebP files. Most resize presets export to JPEG because it reaches target sizes more reliably."
      },
      ...faqExtra
    ]
  };
}

function makeQrTool({
  slug,
  name,
  keyword,
  description,
  intro,
  mode = "generic",
  relatedSlugs = []
}) {
  return {
    slug,
    category: "qr",
    name,
    h1: name,
    icon: "qr_code_2",
    type: "qr",
    mode,
    targetKeyword: keyword,
    description,
    intro,
    helperText:
      mode === "wifi"
        ? "Enter your network details and generate a QR code guests can scan instantly."
        : mode === "whatsapp"
          ? "Create a click-to-chat link and matching QR code for faster outreach."
          : "Generate a clean QR code for a URL, text snippet, or another quick-share target.",
    promises: commonInstantPromises,
    processingMode: "server",
    relatedSlugs,
    steps: [
      {
        title: "Enter the content",
        body:
          mode === "wifi"
            ? "Add the Wi-Fi name, password, and security type."
            : mode === "whatsapp"
              ? "Enter the phone number and optional prefilled message."
              : "Paste the URL or text you want encoded."
      },
      {
        title: "Generate the QR code",
        body: "Click generate to render the QR preview with the current content."
      },
      {
        title: "Download and share",
        body: "Export the QR as PNG or SVG and use it on print or digital surfaces."
      }
    ],
    faq: [
      {
        question: "Can I download the QR code as an image?",
        answer: "Yes. You can export the generated QR as PNG or SVG from the result panel."
      },
      {
        question: "Can I update the content and generate again?",
        answer: "Yes. Change the content, generate again, and export the next version from the same page."
      },
      {
        question: "Does Student Dev store my QR content?",
        answer:
          "No saved history is attached to your session. The QR payload is used only to generate the current output."
      }
    ]
  };
}

function makeDevTool({
  slug,
  name,
  keyword,
  description,
  intro,
  mode,
  inputLabel,
  outputLabel,
  helperText,
  relatedSlugs = []
}) {
  return {
    slug,
    category: "dev",
    name,
    h1: name,
    icon: "data_object",
    type: "dev",
    mode,
    targetKeyword: keyword,
    description,
    intro,
    helperText,
    promises: commonBrowserPromises,
    processingMode: "browser",
    inputLabel,
    outputLabel,
    relatedSlugs,
    steps: [
      {
        title: "Paste your input",
        body: "Add the JSON, XML, CSV, encoded string, or timestamp into the input panel."
      },
      {
        title: "Run the transformation",
        body: "Click the primary action to format, convert, decode, or encode the content."
      },
      {
        title: "Copy or download the result",
        body: "Review the output, then copy it directly or download the generated file if needed."
      }
    ],
    faq: [
      {
        question: "Does this tool store my data?",
        answer:
          "No. Developer tool transformations happen in the browser for the tools in this batch, so the content is not submitted to a backend service."
      },
      {
        question: "Can I paste large payloads?",
        answer:
          "Yes, but very large payloads may feel slower on older devices because formatting and conversion happen locally."
      },
      {
        question: "Can I copy the output directly?",
        answer: "Yes. Each developer tool page includes a copy action for the output panel."
      }
    ]
  };
}

function makePdfTool({
  slug,
  name,
  keyword,
  description,
  intro,
  mode,
  helperText,
  relatedSlugs = []
}) {
  return {
    slug,
    category: "pdf",
    name,
    h1: name,
    icon: "picture_as_pdf",
    type: "pdf",
    mode,
    targetKeyword: keyword,
    description,
    intro,
    helperText,
    promises: commonBrowserPromises,
    processingMode: "browser",
    relatedSlugs,
    steps: [
      {
        title: "Select files",
        body:
          mode === "merge"
            ? "Upload the PDF files you want to combine."
            : "Upload the JPG or PNG images you want to place into a PDF."
      },
      {
        title: mode === "merge" ? "Arrange the order" : "Generate the PDF",
        body:
          mode === "merge"
            ? "Move files up or down until the order is correct."
            : "Choose the page style and generate the PDF document."
      },
      {
        title: "Download the output",
        body: "Wait for the browser-side export to finish, then download the generated PDF."
      }
    ],
    faq: [
      {
        question: "Does this upload my PDF or image files?",
        answer:
          "No. The current PDF batch runs in your browser, so your files stay on your device while the document is created."
      },
      {
        question: "Can I reorder the files before exporting?",
        answer:
          mode === "merge"
            ? "Yes. Use the reorder controls in the file list before you merge."
            : "The image list preserves your upload order, and you can remove images before exporting."
      },
      {
        question: "What if my browser feels slow on very large files?",
        answer:
          "Large PDFs or high-resolution images use more memory in the browser. For best results, keep the batch smaller and avoid opening many heavy tabs at the same time."
      }
    ]
  };
}

function makeAssetTool({
  slug,
  name,
  keyword,
  description,
  intro,
  mode,
  helperText,
  relatedSlugs = []
}) {
  return {
    slug,
    category: "assets",
    name,
    h1: name,
    icon: "deployed_code",
    type: "assets",
    mode,
    targetKeyword: keyword,
    description,
    intro,
    helperText,
    promises: commonBrowserPromises,
    processingMode: "browser",
    relatedSlugs,
    steps: [
      {
        title: "Choose the asset setup",
        body: "Select the icon, frame, or source configuration you want to start from."
      },
      {
        title: "Adjust the presentation",
        body: "Tune the colors, size, or layout until the visual matches what you need."
      },
      {
        title: "Export the result",
        body: "Download the output as an SVG or PNG without moving through an account flow."
      }
    ],
    faq: [
      {
        question: "Do I need design software to use it?",
        answer: "No. These asset tools run directly on the page and export the result from the current workflow."
      },
      {
        question: "Can I export the result after customizing it?",
        answer: "Yes. The tool exports the finished output directly from the current page."
      },
      {
        question: "Are the edits saved anywhere?",
        answer: "No persistent save state is attached to these tools in the current build."
      }
    ]
  };
}

function makeAiTool({
  slug,
  name,
  keyword,
  description,
  intro,
  mode,
  helperText,
  inputLabel,
  outputLabel,
  actionLabel = "Generate output",
  secondaryLabel = "",
  secondaryPlaceholder = "",
  inputPlaceholder = "",
  imageInput = false,
  accept = "image/png,image/jpeg,image/webp",
  icon = "auto_awesome",
  relatedSlugs = []
}) {
  return {
    slug,
    category: "ai",
    name,
    h1: name,
    icon,
    type: "ai",
    mode,
    targetKeyword: keyword,
    description,
    intro,
    helperText,
    promises: ["AI-assisted", "Focused workflow"],
    processingMode: "server",
    inputLabel,
    outputLabel,
    actionLabel,
    secondaryLabel,
    secondaryPlaceholder,
    inputPlaceholder,
    imageInput,
    accept,
    relatedSlugs,
    steps: [
      {
        title: imageInput ? "Add the source image or text" : "Paste the source material",
        body: imageInput
          ? "Upload the image, then add any short context that helps the AI understand what you need."
          : "Paste the notes, transcript, draft, or copy you want the AI to transform."
      },
      {
        title: "Run the AI action",
        body: "The page sends the current request to the model with instructions tailored to this exact tool."
      },
      {
        title: "Copy and refine the result",
        body: "Review the generated output, then copy it directly or download it as a text file."
      }
    ],
    faq: [
      {
        question: "What kind of input works best?",
        answer: "Clear source text, a defined goal, and short context notes usually produce the best result."
      },
      {
        question: "Are these general chat pages?",
        answer:
          "No. Each page is designed around one specific job so the interface and prompt stay tighter than a broad chat tool."
      },
      {
        question: "Can I edit the output afterward?",
        answer: "Yes. The result is plain text that you can copy, refine, and reuse anywhere you need."
      }
    ]
  };
}

const toolRecords = [
  makeImageTool({
    slug: "image-resizer",
    name: "Image Resizer",
    keyword: "image resizer",
    description: "Resize JPG, PNG, or WebP images to exact dimensions and export a lighter file.",
    intro:
      "Use this image resizer when you need a faster, cleaner workflow than the usual ad-heavy resize pages.",
    outputFormat: "image/jpeg",
    relatedSlugs: ["resize-image-to-100kb", "compress-jpeg", "png-to-jpg"]
  }),
  makeImageTool({
    slug: "resize-image-to-50kb",
    name: "Resize Image to 50KB",
    keyword: "resize image to 50kb",
    description: "Try to compress an image close to 50KB for portal, form, or exam uploads.",
    intro:
      "This preset is built for strict upload limits where you need a best-effort result around 50KB without trial-and-error across multiple tools.",
    targetKB: 50,
    supportsFormatSwitch: false,
    relatedSlugs: ["resize-image-to-100kb", "resize-image-to-200kb", "compress-jpeg"]
  }),
  makeImageTool({
    slug: "resize-image-to-100kb",
    name: "Resize Image to 100KB",
    keyword: "resize image to 100kb",
    description: "Reduce an image toward 100KB for online forms, admissions, and profile uploads.",
    intro:
      "If a portal asks for a 100KB file limit, this preset gives you the direct workflow instead of making you guess the right quality setting.",
    targetKB: 100,
    supportsFormatSwitch: false,
    relatedSlugs: ["resize-image-to-50kb", "resize-image-to-200kb", "image-resizer"]
  }),
  makeImageTool({
    slug: "resize-image-to-200kb",
    name: "Resize Image to 200KB",
    keyword: "resize image to 200kb",
    description: "Bring large images closer to 200KB while keeping them suitable for upload portals.",
    intro:
      "Use the 200KB preset when you need a softer compression target than the stricter 50KB or 100KB variants.",
    targetKB: 200,
    supportsFormatSwitch: false,
    relatedSlugs: ["resize-image-to-100kb", "compress-jpeg", "image-resizer"]
  }),
  makeImageTool({
    slug: "compress-jpeg",
    name: "Compress JPEG",
    keyword: "compress jpeg",
    description: "Shrink JPG and JPEG files with adjustable quality and download the lighter export.",
    intro:
      "A straightforward JPEG compressor for website images, uploads, and file-size cleanup without a cluttered interface.",
    supportsFormatSwitch: false,
    relatedSlugs: ["image-resizer", "resize-image-to-100kb", "png-to-jpg"]
  }),
  makeImageTool({
    slug: "png-to-jpg",
    name: "PNG to JPG Converter",
    keyword: "png to jpg",
    description: "Convert a PNG image into a JPG file for lighter uploads and broader compatibility.",
    intro:
      "When you need a smaller or more widely accepted format than PNG, this converter gives you a direct export path.",
    outputFormat: "image/jpeg",
    supportsDimensions: false,
    relatedSlugs: ["compress-jpeg", "image-resizer", "resize-image-to-100kb"]
  }),
  makePdfTool({
    slug: "merge-pdf",
    name: "Merge PDF",
    keyword: "merge pdf",
    description: "Combine multiple PDF files into one document directly in the browser.",
    intro:
      "Use Merge PDF for the common case: you have several files, need one clean output, and want a straightforward browser workflow.",
    mode: "merge",
    helperText: "Upload PDF files, reorder them, and export a merged document without leaving the page.",
    relatedSlugs: ["jpg-to-pdf"]
  }),
  makePdfTool({
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    keyword: "jpg to pdf",
    description: "Convert one or more images into a PDF for submission, sharing, or printing.",
    intro:
      "This JPG to PDF page is tuned for quick image-to-document conversion when a form, school, or office workflow expects a PDF file.",
    mode: "jpg-to-pdf",
    helperText: "Upload JPG or PNG images, keep the order you want, and export a single PDF file.",
    relatedSlugs: ["merge-pdf"]
  }),
  {
    slug: "pdf-to-word",
    category: "pdf",
    name: "Client-Side PDF to Word",
    h1: "PDF to Word Converter",
    icon: "picture_as_pdf",
    type: "pdf",
    mode: "pdf-to-word",
    targetKeyword: "pdf to word converter no email",
    description: "Convert PDF text into a downloadable Word document with a text-first workflow.",
    intro:
      "This first version focuses on text-first PDF conversion for ordinary documents where the main need is getting editable content into a `.docx` file quickly.",
    helperText: "Upload a PDF file and export a Word document generated from the extracted text.",
    promises: ["Free", "Text-first conversion"],
    processingMode: "server",
    relatedSlugs: ["merge-pdf", "jpg-to-pdf"],
    categoryPath: "/tools/pdf",
    steps: [
      { title: "Upload a PDF", body: "Select one PDF file that contains readable text." },
      { title: "Extract the document text", body: "The tool reads the PDF and converts the extracted text into a Word document." },
      { title: "Download the `.docx` file", body: "Open the Word document and edit the extracted content." }
    ],
    faq: [
      {
        question: "Does this preserve complex layouts perfectly?",
        answer:
          "No. This version is text-first, which means it is strongest for readable text documents rather than graphic-heavy layouts or complex tables."
      },
      {
        question: "Can I download the output directly?",
        answer: "Yes. The converted Word file can be downloaded directly from the page."
      },
      {
        question: "What PDFs work best?",
        answer: "Digitally generated PDFs with selectable text usually convert better than scanned image-only PDFs."
      }
    ]
  },
  makeQrTool({
    slug: "qr-code-generator",
    name: "QR Code Generator",
    keyword: "qr code generator",
    description: "Generate a QR code for a URL or text snippet and export it as PNG or SVG.",
    intro:
      "A QR code generator for the standard use case: quick creation, clean output, and direct download.",
    relatedSlugs: ["wifi-qr-code-generator", "whatsapp-link-generator"]
  }),
  makeQrTool({
    slug: "wifi-qr-code-generator",
    name: "Wi-Fi QR Code Generator",
    keyword: "wifi qr code generator",
    description: "Create a QR code people can scan to join your Wi-Fi network quickly.",
    intro:
      "Use this page for cafes, offices, clinics, events, and homes where guests need a faster Wi-Fi join experience.",
    mode: "wifi",
    relatedSlugs: ["qr-code-generator", "whatsapp-link-generator"]
  }),
  makeQrTool({
    slug: "whatsapp-link-generator",
    name: "WhatsApp Link Generator",
    keyword: "whatsapp link generator",
    description: "Create a click-to-chat WhatsApp URL and matching QR code from a phone number and message.",
    intro:
      "This tool helps you generate a clean WhatsApp contact link for landing pages, bios, business cards, and QR-driven outreach.",
    mode: "whatsapp",
    relatedSlugs: ["qr-code-generator", "wifi-qr-code-generator"]
  }),
  makeDevTool({
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    keyword: "json formatter",
    description: "Format and validate JSON with a cleaner editor-style workflow and clearer error feedback.",
    intro:
      "Paste raw JSON, clean up the spacing, validate the structure, and copy the output without jumping into a larger IDE.",
    mode: "json-format",
    inputLabel: "JSON input",
    outputLabel: "Formatted JSON",
    helperText: "Format and validate JSON with readable indentation and direct copy support.",
    relatedSlugs: ["json-minifier", "json-to-csv", "csv-to-json"]
  }),
  makeDevTool({
    slug: "regex-tester-debugger",
    name: "Regex Tester & Debugger",
    keyword: "regex tester real time",
    description: "Test regular expressions in real time with match highlighting and flags.",
    intro:
      "Use this regex tester to iterate on patterns quickly, inspect matches, and avoid heavy interfaces that slow down simple testing.",
    mode: "regex",
    inputLabel: "Sample text",
    outputLabel: "Matches and debug output",
    helperText: "Enter a regex pattern, choose flags, and test it against the sample text instantly.",
    relatedSlugs: ["json-formatter", "base64-encode-decode", "url-encode-decode"]
  }),
  makeDevTool({
    slug: "markdown-editor-live-preview",
    name: "In-Browser Markdown Editor",
    keyword: "online markdown editor live preview",
    description: "Write markdown with a live preview and export the output in one place.",
    intro:
      "A lighter markdown workspace for notes, docs, changelogs, and README drafts with an immediate preview pane.",
    mode: "markdown",
    inputLabel: "Markdown input",
    outputLabel: "Live preview / exported markdown",
    helperText: "Write markdown on the left and review the rendered output on the right.",
    relatedSlugs: ["ai-prompt-formatter", "advanced-word-counter", "json-formatter"]
  }),
  makeDevTool({
    slug: "json-minifier",
    name: "JSON Minifier",
    keyword: "json minify",
    description: "Remove extra spaces and line breaks from JSON to create a smaller payload.",
    intro:
      "Use this JSON minifier for payload cleanup, API examples, or cases where you need compact output quickly.",
    mode: "json-minify",
    inputLabel: "JSON input",
    outputLabel: "Minified JSON",
    helperText: "Strip indentation and whitespace while keeping the JSON valid.",
    relatedSlugs: ["json-formatter", "json-to-csv", "base64-encode-decode"]
  }),
  makeDevTool({
    slug: "xml-formatter",
    name: "XML Formatter",
    keyword: "xml formatter",
    description: "Indent and clean XML so it is easier to read, inspect, and debug.",
    intro:
      "If you are working with verbose XML responses or documents, this formatter gives you a fast cleanup pass inside the browser.",
    mode: "xml-format",
    inputLabel: "XML input",
    outputLabel: "Formatted XML",
    helperText: "Make nested XML readable again with indentation and clean line breaks.",
    relatedSlugs: ["json-formatter", "json-to-csv", "url-encode-decode"]
  }),
  makeDevTool({
    slug: "json-to-csv",
    name: "JSON to CSV Converter",
    keyword: "json to csv",
    description: "Convert a JSON array of objects into a CSV file you can open in spreadsheet software.",
    intro:
      "Use JSON to CSV when you need to turn API output or structured records into a spreadsheet-friendly format.",
    mode: "json-to-csv",
    inputLabel: "JSON input",
    outputLabel: "CSV output",
    helperText: "Best for arrays of similar objects with consistent keys.",
    relatedSlugs: ["csv-to-json", "json-formatter", "json-minifier"]
  }),
  makeDevTool({
    slug: "csv-to-json",
    name: "CSV to JSON Converter",
    keyword: "csv to json",
    description: "Turn CSV rows into JSON objects for scripts, APIs, and quick data cleanup.",
    intro:
      "This converter is useful when spreadsheet exports need to become JSON again for integrations or development workflows.",
    mode: "csv-to-json",
    inputLabel: "CSV input",
    outputLabel: "JSON output",
    helperText: "The first row is treated as the header row and becomes the object keys.",
    relatedSlugs: ["json-to-csv", "json-formatter", "url-encode-decode"]
  }),
  makeDevTool({
    slug: "jwt-decoder",
    name: "JWT Decoder",
    keyword: "jwt decoder secure local",
    description: "Decode JWT headers and payloads locally in the browser without sending the token to a remote decoder.",
    intro:
      "Use JWT Decoder for quick inspection of token structure, claims, and expiry values while keeping the raw token on the current page.",
    mode: "jwt",
    inputLabel: "JWT token",
    outputLabel: "Decoded header and payload",
    helperText: "Paste a JWT and inspect the decoded header, payload, and expiry information.",
    relatedSlugs: ["base64-encode-decode", "json-formatter", "timestamp-converter"]
  }),
  makeDevTool({
    slug: "advanced-word-counter",
    name: "Advanced Word Counter",
    keyword: "word counter with keyword density",
    description: "Count words, characters, sentences, paragraphs, reading time, and keyword density in one view.",
    intro:
      "A stronger word counter for SEO and content workflows where basic character count is not enough.",
    mode: "word-counter",
    inputLabel: "Text input",
    outputLabel: "Text metrics",
    helperText: "Paste or write your content and see live counts, density, and readability-style metrics.",
    relatedSlugs: ["ai-prompt-formatter", "markdown-editor-live-preview", "json-formatter"]
  }),
  makeDevTool({
    slug: "base64-encode-decode",
    name: "Base64 Encode Decode",
    keyword: "base64 decode",
    description: "Encode plain text to Base64 or decode Base64 back into readable text.",
    intro:
      "A direct Base64 page for debugging tokens, text payloads, and encoded values without opening a larger toolkit.",
    mode: "base64",
    inputLabel: "Text or Base64 input",
    outputLabel: "Encoded or decoded output",
    helperText: "Toggle between encoding and decoding from the control bar.",
    relatedSlugs: ["url-encode-decode", "json-minifier", "timestamp-converter"]
  }),
  makeDevTool({
    slug: "url-encode-decode",
    name: "URL Encode Decode",
    keyword: "url encode",
    description: "Encode or decode query strings and URLs without switching tabs.",
    intro:
      "Use this page when you need to safely encode query parameters or inspect an already encoded URL fragment.",
    mode: "url-encode",
    inputLabel: "Text or URL input",
    outputLabel: "Encoded or decoded output",
    helperText: "Great for query strings, redirect parameters, and debugging escaped characters.",
    relatedSlugs: ["base64-encode-decode", "json-formatter", "timestamp-converter"]
  }),
  makeDevTool({
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    keyword: "epoch converter",
    description: "Convert epoch timestamps into readable dates and convert readable dates back into epoch values.",
    intro:
      "This timestamp converter is built for quick developer checks around Unix timestamps, milliseconds, and ISO date values.",
    mode: "timestamp",
    inputLabel: "Epoch or date input",
    outputLabel: "Converted values",
    helperText: "Supports seconds, milliseconds, and regular date strings.",
    relatedSlugs: ["url-encode-decode", "base64-encode-decode", "json-formatter"]
  }),
  {
    slug: "youtube-transcript-extractor",
    category: "dev",
    name: "YouTube Transcript Extractor",
    h1: "YouTube Transcript Extractor",
    icon: "subtitles",
    type: "dev",
    mode: "youtube-transcript",
    targetKeyword: "youtube transcript generator free",
    description: "Fetch a public YouTube video transcript and export the text for notes, research, or content prep.",
    intro:
      "Paste a YouTube URL or video ID and get the available transcript as readable text you can copy or download.",
    helperText: "Works best for public videos that have captions or transcripts available.",
    promises: ["Free", "Transcript export"],
    processingMode: "server",
    inputLabel: "YouTube URL or video ID",
    outputLabel: "Transcript output",
    relatedSlugs: ["advanced-word-counter", "markdown-editor-live-preview", "ai-prompt-formatter"],
    steps: [
      { title: "Paste the video URL", body: "Use a full YouTube URL or just the video ID." },
      { title: "Fetch the transcript", body: "The tool retrieves the available transcript for the current video." },
      { title: "Copy or download the text", body: "Use the transcript in research, notes, or content prep." }
    ],
    faq: [
      {
        question: "Will every video return a transcript?",
        answer: "No. The video needs captions or transcript data available for extraction."
      },
      {
        question: "Can I use a short YouTube URL?",
        answer: "Yes. Standard watch URLs, short URLs, and plain video IDs are supported."
      },
      {
        question: "Can I download the transcript after fetching it?",
        answer: "Yes. You can copy the text or download the fetched transcript from the result panel."
      }
    ]
  },
  {
    slug: "bulk-image-compressor",
    category: "image",
    name: "Bulk Image Compressor",
    h1: "Bulk Image Compressor",
    icon: "imagesmode",
    type: "image-batch",
    mode: "bulk-compress",
    targetKeyword: "bulk image compressor no limit",
    description: "Compress multiple JPG, PNG, or WebP images in one batch from a single page.",
    intro:
      "This batch compressor is for the common case: a folder of images needs to be lighter, and doing it one file at a time is a waste of time.",
    helperText: "Upload multiple images, set a shared quality level, and export compressed files together.",
    promises: commonBrowserPromises,
    processingMode: "browser",
    relatedSlugs: ["compress-jpeg", "image-resizer", "resize-image-to-100kb"],
    steps: [
      { title: "Add multiple images", body: "Choose the files you want to compress together." },
      { title: "Set the shared quality", body: "Pick one quality level for the whole batch." },
      { title: "Download the compressed results", body: "Export each processed image from the batch result list." }
    ],
    faq: [
      {
        question: "Does the whole batch upload anywhere?",
        answer: "No. The batch compression happens in the browser on your device."
      },
      {
        question: "Can I mix JPG and PNG files?",
        answer: "Yes. The batch can include JPG, PNG, and WebP inputs."
      },
      {
        question: "Will every file hit the same output size?",
        answer: "No. The batch uses one quality setting, so final sizes will vary based on the original image content."
      }
    ]
  },
  {
    slug: "heic-to-jpg-converter",
    category: "image",
    name: "HEIC to JPG Converter",
    h1: "HEIC to JPG Converter",
    icon: "perm_media",
    type: "image",
    mode: "heic-to-jpg",
    targetKeyword: "heic to jpg converter bulk free",
    description: "Convert HEIC images into JPG files so they are easier to upload and share across platforms.",
    intro:
      "Use this HEIC to JPG page when an iPhone image needs to become a more widely compatible format quickly.",
    helperText: "Upload HEIC files and export JPG versions ready for web uploads and messaging apps.",
    promises: ["Free", "JPG export"],
    processingMode: "server",
    accept: ".heic,.HEIC",
    maxFileSizeLabel: "20MB per image",
    relatedSlugs: ["png-to-jpg", "bulk-image-compressor", "image-resizer"],
    steps: [
      { title: "Upload HEIC files", body: "Choose one or more HEIC images from your device." },
      { title: "Convert to JPG", body: "The tool turns the HEIC image data into standard JPG files." },
      { title: "Download the exports", body: "Save the JPG files and use them in sites, forms, or apps." }
    ],
    faq: [
      {
        question: "Why use JPG instead of HEIC?",
        answer: "JPG is supported more widely across websites, upload forms, and editing tools."
      },
      {
        question: "Can I convert more than one file?",
        answer: "Yes. This page is designed to support multiple HEIC files."
      },
      {
        question: "Will image quality change?",
        answer: "There may be some compression because the output format is JPG, but the converted file is intended to stay practical for normal use."
      }
    ]
  },
  {
    slug: "background-remover-high-res",
    category: "image",
    name: "High-Res Background Remover",
    h1: "High-Res Background Remover",
    icon: "auto_awesome",
    type: "image",
    mode: "background-remover",
    targetKeyword: "free background remover high resolution",
    description: "Remove the background from product, profile, and creator images in the browser and export a transparent PNG.",
    intro:
      "Use this page for cleaner cutouts without uploading the source image to a third-party removal service.",
    helperText: "Upload an image, run the background remover, preview the transparent result, and download it as PNG or WebP.",
    promises: ["AI-backed", "Runs in your browser"],
    processingMode: "browser",
    accept: "image/png,image/jpeg,image/webp",
    maxFileSizeLabel: "20MB per image",
    relatedSlugs: ["bulk-image-compressor", "image-resizer", "heic-to-jpg-converter"],
    steps: [
      { title: "Upload a source image", body: "Choose the subject image you want to isolate." },
      { title: "Run background removal", body: "The AI workflow will separate the subject from the background." },
      { title: "Download the transparent output", body: "Export the cleaned image for design and listing workflows." }
    ],
    faq: [
      {
        question: "Is this live yet?",
        answer: "Yes. The current version runs the removal process in the browser and exports the cleaned subject as an image file."
      },
      {
        question: "What will it be used for?",
        answer: "The target use cases are product shots, profile images, and creator assets that need cleaner cutouts."
      },
      {
        question: "What kind of image works best?",
        answer: "Clear subjects with visible edges usually produce a cleaner cutout in the current version."
      }
    ]
  },
  makeAiTool({
    slug: "ai-prompt-formatter",
    name: "AI Prompt Formatter",
    keyword: "ai prompt formatting tool",
    description: "Turn a rough instruction dump into a cleaner structured prompt with clearer task, context, constraints, and output formatting.",
    intro:
      "Use this page when you have a messy prompt and want a tighter reusable version without hand-editing the structure yourself.",
    mode: "prompt-formatter",
    inputLabel: "Raw prompt",
    outputLabel: "Formatted prompt",
    helperText: "Paste the rough prompt and the AI will reorganize it into a cleaner, more reusable structure.",
    actionLabel: "Format prompt",
    inputPlaceholder: "Paste the rough prompt, requirements, or notes here",
    secondaryLabel: "Optional focus",
    secondaryPlaceholder: "e.g. coding task, marketing brief, design review",
    relatedSlugs: ["markdown-editor-live-preview", "advanced-word-counter", "json-formatter"]
  }),
  makeAiTool({
    slug: "seo-meta-generator",
    name: "SEO Title & Meta Description Generator",
    keyword: "seo meta description generator",
    description: "Generate SEO title and meta description options from a page summary, draft copy, or target keyword.",
    intro:
      "Use this tool when a page needs metadata quickly and you want tighter, SERP-aware options than a generic chat reply.",
    mode: "seo-meta-generator",
    inputLabel: "Page copy or summary",
    outputLabel: "Generated metadata",
    helperText: "Paste the page summary or draft copy, then generate titles and descriptions tuned for search snippets.",
    actionLabel: "Generate metadata",
    inputPlaceholder: "Paste the page summary, draft copy, or product description here",
    secondaryLabel: "Primary keyword",
    secondaryPlaceholder: "e.g. portfolio website developer kolkata",
    icon: "search_insights",
    relatedSlugs: ["advanced-word-counter", "ai-prompt-formatter", "markdown-editor-live-preview"]
  }),
  makeAiTool({
    slug: "image-alt-text-generator",
    name: "AI Alt Text Generator",
    keyword: "ai alt text generator",
    description: "Upload an image and generate short alt text, a fuller accessibility description, and caption ideas.",
    intro:
      "Use this tool for accessibility copy, product-image descriptions, and quick caption support from a single image.",
    mode: "alt-text-generator",
    inputLabel: "Optional context",
    outputLabel: "Alt text and description",
    helperText: "Upload the image first, then add any product or context notes that should shape the description.",
    actionLabel: "Generate alt text",
    inputPlaceholder: "Optional context such as product name, brand, scene, or target audience",
    secondaryLabel: "Tone or intent",
    secondaryPlaceholder: "e.g. accessibility-first, ecommerce, social caption",
    imageInput: true,
    icon: "imagesearch_roller",
    relatedSlugs: ["background-remover-high-res", "smart-device-mockup", "seo-meta-generator"]
  }),
  makeAiTool({
    slug: "transcript-summarizer",
    name: "AI Transcript Summarizer",
    keyword: "ai transcript summarizer",
    description: "Summarize long transcripts into key points, a short overview, and action items with a cleaner structure.",
    intro:
      "Use this for meeting notes, interview transcripts, webinar exports, or YouTube transcript cleanups when you need a faster synthesis pass.",
    mode: "transcript-summarizer",
    inputLabel: "Transcript or notes",
    outputLabel: "Summary and takeaways",
    helperText: "Paste the transcript, choose the angle you care about, and generate a tighter summary.",
    actionLabel: "Summarize transcript",
    inputPlaceholder: "Paste the transcript, notes, or long-form discussion here",
    secondaryLabel: "Summary focus",
    secondaryPlaceholder: "e.g. action items, executive summary, content repurposing",
    icon: "summarize",
    relatedSlugs: ["youtube-transcript-extractor", "advanced-word-counter", "ai-prompt-formatter"]
  }),
  makeAiTool({
    slug: "blog-outline-generator",
    name: "AI Blog Outline Generator",
    keyword: "ai blog outline generator",
    description: "Turn a topic, product page, or keyword into a structured article outline with sections, angles, and FAQ ideas.",
    intro:
      "Use this when you need a workable content structure before writing, especially for SEO-driven drafts and landing-page support content.",
    mode: "blog-outline-generator",
    inputLabel: "Topic, notes, or source copy",
    outputLabel: "Outline and angle ideas",
    helperText: "Paste the topic or working notes, then generate an outline with sections, FAQs, and content angles.",
    actionLabel: "Generate outline",
    inputPlaceholder: "Paste the topic, source notes, product summary, or draft copy here",
    secondaryLabel: "Primary keyword",
    secondaryPlaceholder: "e.g. portfolio website cost in india",
    icon: "article",
    relatedSlugs: ["seo-meta-generator", "advanced-word-counter", "transcript-summarizer"]
  }),
  makeAiTool({
    slug: "faq-schema-generator",
    name: "AI FAQ & Schema Generator",
    keyword: "faq schema generator ai",
    description: "Generate concise FAQ copy and ready-to-paste JSON-LD schema from a page summary, service, or product description.",
    intro:
      "Use this page when a landing page needs a focused FAQ block and matching schema without writing the questions and markup from scratch.",
    mode: "faq-schema-generator",
    inputLabel: "Page summary or topic",
    outputLabel: "FAQs and schema",
    helperText: "Paste the page summary or topic, then generate FAQ copy and matching JSON-LD in one pass.",
    actionLabel: "Generate FAQs",
    inputPlaceholder: "Paste the page purpose, product details, or service summary here",
    secondaryLabel: "Primary keyword",
    secondaryPlaceholder: "e.g. student portfolio website developer",
    icon: "quiz",
    relatedSlugs: ["seo-meta-generator", "blog-outline-generator", "markdown-editor-live-preview"]
  }),
  makeAssetTool({
    slug: "svg-icon-customizer",
    name: "SVG Icon Customizer",
    keyword: "free svg icons no attribution",
    description: "Choose an icon, adjust stroke and color, and export SVG or PNG from a clean editor.",
    intro:
      "This is a lighter icon utility for front-end and design workflows where you need a quick, editable SVG export without opening a bigger design app.",
    mode: "icon-customizer",
    helperText: "Choose a built-in icon, then adjust size, stroke width, and color before exporting.",
    relatedSlugs: ["smart-device-mockup"]
  }),
  makeAssetTool({
    slug: "smart-device-mockup",
    name: "Smart Device Mockup",
    keyword: "free device mockup generator no watermark",
    description: "Drop a screenshot into a clean phone or desktop frame and export the presentation image.",
    intro:
      "Use this mockup page for cleaner portfolio shots, social previews, and launch visuals without watermark traps.",
    mode: "device-mockup",
    helperText: "Upload a screenshot, choose a device frame, and export a clean mockup image.",
    relatedSlugs: ["svg-icon-customizer"]
  })
];

const toolByKey = new Map();

const tools = toolRecords.map((tool) => {
  const categoryData = categoryDefinitions[tool.category];
  const path = `/tools/${tool.category}/${tool.slug}`;
  const record = {
    ...tool,
    path,
    categoryData,
    categoryPath: `/tools/${tool.category}`,
    seoTitle: `${tool.h1} | Student Dev Tools`,
    seoDescription: tool.description,
    seoKeywords: `${tool.targetKeyword}, ${categoryData.name.toLowerCase()}, student dev tools`,
    heroEyebrow: categoryData.heroEyebrow
  };
  toolByKey.set(`${tool.category}/${tool.slug}`, record);
  return record;
});

const categories = Object.values(categoryDefinitions).map((category) => {
  const categoryTools = tools.filter((tool) => tool.category === category.slug);
  return {
    ...category,
    path: `/tools/${category.slug}`,
    toolCount: categoryTools.length,
    tools: categoryTools
  };
});

const categoryMap = new Map(categories.map((category) => [category.slug, category]));

function getTool(categorySlug, toolSlug) {
  return toolByKey.get(`${categorySlug}/${toolSlug}`) || null;
}

function getCategory(categorySlug) {
  return categoryMap.get(categorySlug) || null;
}

function getRelatedTools(tool) {
  return (tool.relatedSlugs || [])
    .map((slug) => tools.find((candidate) => candidate.slug === slug))
    .filter(Boolean);
}

const popularToolSlugs = [
  "resize-image-to-100kb",
  "merge-pdf",
  "qr-code-generator",
  "json-formatter",
  "ai-prompt-formatter",
  "seo-meta-generator",
  "compress-jpeg",
  "regex-tester-debugger"
];

const recentToolSlugs = [
  "wifi-qr-code-generator",
  "markdown-editor-live-preview",
  "bulk-image-compressor",
  "image-alt-text-generator",
  "faq-schema-generator"
];

const toolsHome = {
  ...hubCopy,
  categories,
  popularTools: popularToolSlugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter(Boolean),
  recentTools: recentToolSlugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter(Boolean)
};

const aboutPage = {
  title: "About Student Dev Tools",
  seoTitle: "About Student Dev Tools | How the platform works",
  seoDescription:
    "Learn how Student Dev Tools approaches utility pages, browser processing, privacy, and tool selection.",
  intro:
    "Student Dev Tools is being built around a simple idea: high-intent utility pages should solve the task first and avoid artificial friction. That means faster interfaces, clearer expectations about privacy and processing, and more focused workflows.",
  sections: [
    {
      title: "Why this platform exists",
      body:
        "Many utility sites rank because the search demand is real, but the experience is often weighed down by export gates, account prompts, aggressive ads, or hidden limits. This platform is a direct response to that pattern."
    },
    {
      title: "Processing model",
      body:
        "Where it is practical, tools run directly in the browser so the file never needs to leave your device. For workflows that require a server-side helper, the page explains that clearly instead of implying everything is local."
    },
    {
      title: "What gets built first",
      body:
        "The focus is on exact-intent search workflows: resize image to a target KB, merge PDFs, create QR codes, and format developer data quickly. The goal is depth in useful pages, not a shallow list of fake tools."
    },
    {
      title: "How content is written",
      body:
        "Each page is designed to avoid thin SEO filler by combining a real working tool, short guidance, clear FAQs, and related links that help the user move to the next relevant task."
    }
  ]
};

const privacyPage = {
  title: "Privacy Policy",
  seoTitle: "Privacy Policy | Student Dev Tools",
  seoDescription:
    "Privacy policy for Student Dev Tools, including browser-side processing, analytics limits, and contact handling.",
  sections: [
    {
      title: "Browser-side tools",
      body:
        "Many tools on this platform process files or text directly in the browser. When a page uses browser-side processing, the input is not uploaded to Student Dev servers as part of the tool action."
    },
    {
      title: "Server-side helpers",
      body:
        "Some pages may use a lightweight server-side helper for tasks such as generating QR output. When that happens, the request is used only to return the current result and is not tied to an account history."
    },
    {
      title: "Contact forms and operational logs",
      body:
        "If you submit a contact form on the main portfolio site, the form content is used only to respond to the inquiry. Standard server logs may store request metadata for security and rate-limiting."
    },
    {
      title: "No account system",
      body:
        "Student Dev Tools currently does not require account creation for the tool pages in this batch. That means there is no personal profile area, saved library, or account dashboard attached to your tool usage."
    }
  ]
};

const termsPage = {
  title: "Terms of Service",
  seoTitle: "Terms of Service | Student Dev Tools",
  seoDescription:
    "Terms for using Student Dev Tools, including acceptable use, file responsibility, and availability.",
  sections: [
    {
      title: "Use at your own discretion",
      body:
        "These tools are provided as practical utilities. You are responsible for reviewing the output before submitting, sharing, or publishing it."
    },
    {
      title: "Acceptable use",
      body:
        "Do not use the platform for illegal activity, harmful automation, or attempts to bypass security, licensing, or rights protections. Tools that appear to facilitate infringement or abuse may be removed."
    },
    {
      title: "No guaranteed availability",
      body:
        "The tool set will evolve over time. Features may change, move, or be removed while the platform is still expanding."
    },
    {
      title: "Intellectual property and open sources",
      body:
        "Where open-source libraries are used, they remain subject to their original licenses. Student Dev Tools does not claim ownership over user-provided files or content."
    }
  ]
};

module.exports = {
  hub: toolsHome,
  categories,
  tools: tools.map((tool) => ({
    ...tool,
    relatedTools: getRelatedTools(tool)
  })),
  aboutPage,
  privacyPage,
  termsPage,
  getCategory,
  getTool(categorySlug, toolSlug) {
    const tool = getTool(categorySlug, toolSlug);
    if (!tool) return null;
    return {
      ...tool,
      relatedTools: getRelatedTools(tool)
    };
  }
};
