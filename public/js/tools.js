(function () {
  const THEME_STORAGE_KEY = "student-dev-theme";
  const ICON_LIBRARY = {
    spark: { viewBox: "0 0 24 24", paths: ['<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>'] },
    shield: { viewBox: "0 0 24 24", paths: ['<path d="M12 3l7 3v6c0 4.3-2.8 8.2-7 9-4.2-.8-7-4.7-7-9V6l7-3Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>'] },
    terminal: { viewBox: "0 0 24 24", paths: ['<path d="M4 6h16v12H4z" fill="none" stroke="currentColor"/><path d="M8 10l2 2-2 2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15h4" fill="none" stroke="currentColor" stroke-linecap="round"/>'] },
    globe: { viewBox: "0 0 24 24", paths: ['<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" fill="none" stroke="currentColor"/>'] },
    camera: { viewBox: "0 0 24 24", paths: ['<path d="M4 8h3l1.5-2h7L17 8h3v10H4z" fill="none" stroke="currentColor" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor"/>'] },
    code: { viewBox: "0 0 24 24", paths: ['<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>'] }
  };

  document.addEventListener("DOMContentLoaded", () => {
    initPageMotion();
    initAdsenseSlots();
    initToolSuggestionForm();
    initThemeToggle();
    initFaqs();
    initSearchFilters();
    initToolPage();
  });

  function initPageMotion() {
    document.body.classList.add("is-ready");

    const header = document.querySelector(".tools-header");
    if (!header) return;

    const updateHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
  }

  function initAdsenseSlots() {
    const slots = Array.from(document.querySelectorAll('.adsbygoogle[data-auto-init="true"]'));
    if (!slots.length) return;

    const tryInitSlot = (slot) => {
      if (slot.dataset.adInitialized === "true" || slot.dataset.adsbygoogleStatus === "done") {
        return true;
      }

      const width = Math.round(slot.getBoundingClientRect().width);
      if (width <= 0) {
        return false;
      }

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        slot.dataset.adInitialized = "true";
        return true;
      } catch (error) {
        if (String(error).includes("availableWidth=0")) {
          return false;
        }

        console.error("Could not initialize AdSense slot.", error);
        slot.dataset.adInitialized = "error";
        return true;
      }
    };

    slots.forEach((slot) => {
      let attempts = 0;

      const schedule = () => {
        if (tryInitSlot(slot)) return;
        attempts += 1;
        if (attempts > 30) return;
        window.setTimeout(schedule, 200);
      };

      schedule();
    });
  }

  function initThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    const root = document.documentElement;
    const getTheme = () => root.dataset.theme || "dark";
    const setPressed = () => {
      toggle.setAttribute("aria-pressed", String(getTheme() === "light"));
    };

    setPressed();

    toggle.addEventListener("click", () => {
      const nextTheme = getTheme() === "light" ? "dark" : "light";
      root.dataset.theme = nextTheme;
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      setPressed();
    });
  }

  function initToolSuggestionForm() {
    const form = document.getElementById("tool-suggestion-form");
    const status = document.getElementById("tool-suggestion-status");
    if (!form || !status) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const setStatus = (text, type = "") => {
      status.textContent = text;
      status.className = `status-line tool-suggestion-status ${type ? `is-${type}` : ""}`.trim();
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!submitButton) return;

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      submitButton.disabled = true;
      setStatus("Sending your suggestion...", "pending");

      try {
        const response = await fetch("/api/tools/suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Could not send the suggestion.");
        }

        form.reset();
        const sourceInput = form.querySelector('input[name="sourcePage"]');
        if (sourceInput) {
          sourceInput.value = `${window.location.origin}/tools#suggest-tool`;
        }
        setStatus(data.message || "Thanks. Your tool suggestion has been sent.", "success");
      } catch (error) {
        setStatus(error.message || "Could not send the suggestion.", "error");
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  function initFaqs() {
    document.querySelectorAll("[data-faq-item]").forEach((item) => {
      const button = item.querySelector("[data-faq-button]");
      const answer = item.querySelector("[data-faq-answer]");
      if (!button || !answer) return;

      if (!item.classList.contains("is-open")) {
        answer.hidden = true;
      }

      button.addEventListener("click", () => {
        const isOpen = item.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
        answer.hidden = !isOpen;
      });
    });
  }

  function initSearchFilters() {
    document.querySelectorAll("[data-tool-search-input]").forEach((input) => {
      const targetId = input.dataset.toolSearchTarget;
      const root = targetId ? document.getElementById(targetId) : input.closest("[data-tool-search-root]");
      if (!root) return;

      const items = Array.from(root.querySelectorAll("[data-tool-search-item]"));
      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        items.forEach((item) => {
          const haystack = (item.dataset.toolName || item.textContent || "").toLowerCase();
          item.hidden = query.length > 0 && !haystack.includes(query);
        });
      });
    });
  }

  function initToolPage() {
    const configElement = document.getElementById("tool-config");
    if (!configElement) return;

    let config;
    try {
      config = JSON.parse(configElement.textContent);
    } catch (error) {
      console.error("Could not parse tool config.", error);
      return;
    }

    if (config.type === "image" && config.mode === "heic-to-jpg") {
      initHeicTool(config);
      return;
    }

    if (config.type === "image" && config.mode === "background-remover") {
      initBackgroundRemoverTool(config);
      return;
    }

    if (config.type === "image") {
      initImageTool(config);
      return;
    }

    if (config.type === "image-batch") {
      initImageBatchTool(config);
      return;
    }

    if (config.type === "qr") {
      initQrTool(config);
      return;
    }

    if (config.type === "dev") {
      initDevTool(config);
      return;
    }

    if (config.type === "ai") {
      initAiTool(config);
      return;
    }

    if (config.type === "pdf" && config.mode === "merge") {
      initPdfMergeTool(config);
      return;
    }

    if (config.type === "pdf" && config.mode === "jpg-to-pdf") {
      initJpgToPdfTool(config);
      return;
    }

    if (config.type === "pdf" && config.mode === "pdf-to-word") {
      initPdfToWordTool(config);
      return;
    }

    if (config.type === "assets" && config.mode === "icon-customizer") {
      initIconCustomizerTool(config);
      return;
    }

    if (config.type === "assets" && config.mode === "device-mockup") {
      initDeviceMockupTool(config);
    }
  }

  function initImageTool(config) {
    const input = document.getElementById("image-file");
    const widthInput = document.getElementById("image-width");
    const heightInput = document.getElementById("image-height");
    const formatSelect = document.getElementById("image-format");
    const qualityInput = document.getElementById("image-quality");
    const qualityValue = document.getElementById("image-quality-value");
    const processButton = document.getElementById("image-process");
    const resetButton = document.getElementById("image-reset");
    const originalPreview = document.getElementById("image-original-preview");
    const originalMeta = document.getElementById("image-original-meta");
    const originalEmpty = document.getElementById("image-original-empty");
    const resultPreview = document.getElementById("image-result-preview");
    const resultMeta = document.getElementById("image-result-meta");
    const resultEmpty = document.getElementById("image-result-empty");
    const downloadLink = document.getElementById("image-download");

    if (!input || !processButton || !qualityInput || !qualityValue) return;

    const state = {
      file: null,
      originalUrl: null,
      resultUrl: null,
      resultBlob: null,
      dimensions: null
    };

    qualityValue.textContent = Number(qualityInput.value).toFixed(2);

    qualityInput.addEventListener("input", () => {
      qualityValue.textContent = Number(qualityInput.value).toFixed(2);
    });

    input.addEventListener("change", async () => {
      const [file] = input.files || [];
      if (!file) return;
      clearImageUrls(state);
      state.file = file;
      state.originalUrl = URL.createObjectURL(file);
      originalPreview.src = state.originalUrl;
      originalPreview.hidden = false;
      originalEmpty.hidden = true;

      const imageInfo = await loadImageDimensions(file);
      state.dimensions = imageInfo;
      originalMeta.textContent = `${imageInfo.width} x ${imageInfo.height} px • ${formatBytes(file.size)}`;

      if (widthInput && !widthInput.value) widthInput.placeholder = String(imageInfo.width);
      if (heightInput && !heightInput.value) heightInput.placeholder = String(imageInfo.height);

      resetImageResult(state, resultPreview, resultEmpty, resultMeta, downloadLink);
    });

    resetButton.addEventListener("click", () => {
      input.value = "";
      if (widthInput) widthInput.value = "";
      if (heightInput) heightInput.value = "";
      qualityInput.value = "0.82";
      qualityValue.textContent = "0.82";
      originalPreview.hidden = true;
      originalPreview.removeAttribute("src");
      originalEmpty.hidden = false;
      originalMeta.textContent = "No file selected yet.";
      clearImageUrls(state);
      resetImageResult(state, resultPreview, resultEmpty, resultMeta, downloadLink);
    });

    processButton.addEventListener("click", async () => {
      if (!state.file || !state.dimensions) {
        resultMeta.textContent = "Select an image before processing.";
        return;
      }

      processButton.disabled = true;
      processButton.textContent = "Processing...";
      resultMeta.textContent = "Working on the image...";

      try {
        const outputFormat = config.supportsFormatSwitch && formatSelect ? formatSelect.value : config.outputFormat;
        const width = sanitizeDimensionValue(widthInput && widthInput.value, state.dimensions.width);
        const height = sanitizeDimensionValue(heightInput && heightInput.value, state.dimensions.height);
        const processed = await processImageFile(state.file, {
          width,
          height,
          outputFormat,
          quality: Number(qualityInput.value),
          targetKB: config.targetKB || null
        });

        if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
        state.resultBlob = processed.blob;
        state.resultUrl = URL.createObjectURL(processed.blob);

        resultPreview.src = state.resultUrl;
        resultPreview.hidden = false;
        resultEmpty.hidden = true;
        resultMeta.textContent = `${processed.width} x ${processed.height} px • ${formatBytes(processed.blob.size)}`;

        downloadLink.href = state.resultUrl;
        downloadLink.download = `${createFileStem(state.file.name)}-${config.slug}${getExtensionForMime(processed.blob.type)}`;
        downloadLink.classList.remove("is-disabled");
      } catch (error) {
        console.error(error);
        resultMeta.textContent = error.message || "Could not process the image.";
      } finally {
        processButton.disabled = false;
        processButton.textContent = "Process image";
      }
    });
  }

  async function processImageFile(file, options) {
    const image = await loadImage(file);
    const normalized = normalizeDimensions(image.naturalWidth, image.naturalHeight, options.width, options.height);
    const outputFormat = options.outputFormat || "image/jpeg";

    if (options.targetKB) {
      return findTargetImageBlob(image, normalized.width, normalized.height, outputFormat, options.targetKB * 1024, options.quality);
    }

    const blob = await renderImageBlob(image, normalized.width, normalized.height, outputFormat, options.quality);
    return { blob, width: normalized.width, height: normalized.height };
  }

  async function findTargetImageBlob(image, width, height, outputFormat, targetBytes, qualitySeed) {
    let best = null;
    let bestWidth = width;
    let bestHeight = height;
    let scale = 1;

    for (let scaleIndex = 0; scaleIndex < 5; scaleIndex += 1) {
      const scaledWidth = Math.max(1, Math.round(width * scale));
      const scaledHeight = Math.max(1, Math.round(height * scale));
      let low = 0.35;
      let high = Math.max(0.45, Math.min(0.95, qualitySeed || 0.82));

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const quality = (low + high) / 2;
        const blob = await renderImageBlob(image, scaledWidth, scaledHeight, outputFormat, quality);
        const score = Math.abs(blob.size - targetBytes);

        if (!best || score < Math.abs(best.blob.size - targetBytes)) {
          best = { blob, width: scaledWidth, height: scaledHeight };
          bestWidth = scaledWidth;
          bestHeight = scaledHeight;
        }

        if (blob.size > targetBytes) {
          high = quality;
        } else {
          low = quality;
        }
      }

      if (best && best.blob.size <= targetBytes * 1.05) {
        return { blob: best.blob, width: bestWidth, height: bestHeight };
      }

      scale *= 0.9;
    }

    return { blob: best.blob, width: bestWidth, height: bestHeight };
  }

  function resetImageResult(state, preview, empty, meta, downloadLink) {
    if (state.resultUrl) {
      URL.revokeObjectURL(state.resultUrl);
      state.resultUrl = null;
    }
    state.resultBlob = null;
    preview.hidden = true;
    preview.removeAttribute("src");
    empty.hidden = false;
    meta.textContent = "No processed file yet.";
    downloadLink.href = "#";
    downloadLink.classList.add("is-disabled");
  }

  function clearImageUrls(state) {
    if (state.originalUrl) {
      URL.revokeObjectURL(state.originalUrl);
      state.originalUrl = null;
    }
    if (state.resultUrl) {
      URL.revokeObjectURL(state.resultUrl);
      state.resultUrl = null;
    }
  }

  function sanitizeDimensionValue(rawValue, fallback) {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
  }

  function normalizeDimensions(originalWidth, originalHeight, requestedWidth, requestedHeight) {
    const width = requestedWidth || originalWidth;
    const height = requestedHeight || originalHeight;

    if (requestedWidth && !requestedHeight) {
      return {
        width,
        height: Math.max(1, Math.round((originalHeight / originalWidth) * width))
      };
    }

    if (!requestedWidth && requestedHeight) {
      return {
        width: Math.max(1, Math.round((originalWidth / originalHeight) * height)),
        height
      };
    }

    return { width, height };
  }

  function renderImageBlob(image, width, height, mimeType, quality) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);

    const useQuality = mimeType === "image/jpeg" || mimeType === "image/webp";

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image export failed."));
            return;
          }
          resolve(blob);
        },
        mimeType,
        useQuality ? quality : undefined
      );
    });
  }

  function loadImageDimensions(file) {
    return loadImage(file).then((image) => ({
      width: image.naturalWidth,
      height: image.naturalHeight
    }));
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read the selected image."));
      };
      image.src = url;
    });
  }

  function initQrTool(config) {
    const generateButton = document.getElementById("qr-generate");
    const previewBox = document.getElementById("qr-preview-box");
    const previewEmpty = document.getElementById("qr-preview-empty");
    const resultMeta = document.getElementById("qr-result-meta");
    const pngLink = document.getElementById("qr-download-png");
    const svgLink = document.getElementById("qr-download-svg");
    const sizeSelect = document.getElementById("qr-size");

    if (!generateButton || !previewBox || !pngLink || !svgLink || !sizeSelect) return;

    let currentSvgUrl = null;

    generateButton.addEventListener("click", async () => {
      const payload = buildQrPayload(config.mode || "generic");
      if (!payload.ok) {
        resultMeta.textContent = payload.error;
        return;
      }

      generateButton.disabled = true;
      generateButton.textContent = "Generating...";
      resultMeta.textContent = "Creating the QR output...";

      try {
        const response = await fetch("/api/tools/qr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: payload.text,
            size: Number(sizeSelect.value)
          })
        });
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "QR generation failed.");
        }

        previewBox.innerHTML = data.svg;
        if (previewEmpty) previewEmpty.hidden = true;
        resultMeta.textContent = "QR code ready. Download PNG or SVG.";

        if (currentSvgUrl) URL.revokeObjectURL(currentSvgUrl);
        currentSvgUrl = URL.createObjectURL(new Blob([data.svg], { type: "image/svg+xml" }));

        pngLink.href = data.dataUrl;
        pngLink.download = `${config.slug}.png`;
        pngLink.classList.remove("is-disabled");

        svgLink.href = currentSvgUrl;
        svgLink.download = `${config.slug}.svg`;
        svgLink.classList.remove("is-disabled");
      } catch (error) {
        console.error(error);
        resultMeta.textContent = error.message || "Could not generate the QR code.";
      } finally {
        generateButton.disabled = false;
        generateButton.textContent = "Generate QR";
      }
    });
  }

  function buildQrPayload(mode) {
    if (mode === "wifi") {
      const ssid = valueOf("qr-wifi-ssid");
      const password = valueOf("qr-wifi-password");
      const security = valueOf("qr-wifi-security") || "WPA";
      if (!ssid) return { ok: false, error: "Add the Wi-Fi name first." };
      const safePassword = security === "nopass" ? "" : password;
      return {
        ok: true,
        text: `WIFI:T:${security};S:${escapeQrValue(ssid)};P:${escapeQrValue(safePassword)};;`
      };
    }

    if (mode === "whatsapp") {
      const phone = valueOf("qr-whatsapp-phone").replace(/[^\d]/g, "");
      const message = valueOf("qr-whatsapp-message");
      if (!phone) return { ok: false, error: "Enter the phone number first." };
      const suffix = message ? `?text=${encodeURIComponent(message)}` : "";
      return {
        ok: true,
        text: `https://wa.me/${phone}${suffix}`
      };
    }

    const kind = valueOf("qr-kind") || "url";
    const content = valueOf("qr-content");
    if (!content) return { ok: false, error: "Enter the content to encode first." };
    if (kind === "url" && !/^https?:\/\//i.test(content)) {
      return { ok: true, text: `https://${content}` };
    }
    return { ok: true, text: content };
  }

  function escapeQrValue(value) {
    return value.replace(/([\\;,:"])/g, "\\$1");
  }

  function initDevTool(config) {
    const input = document.getElementById("dev-input");
    const output = document.getElementById("dev-output");
    const runButton = document.getElementById("dev-run");
    const clearButton = document.getElementById("dev-clear");
    const copyButton = document.getElementById("dev-copy");
    const downloadLink = document.getElementById("dev-download");
    const status = document.getElementById("dev-status");
    const markdownPreview = document.getElementById("markdown-preview");

    if (!input || !output || !runButton || !clearButton || !copyButton || !downloadLink || !status) return;

    let downloadUrl = null;
    let direction = "encode";

    document.querySelectorAll("[data-dev-direction]").forEach((button) => {
      button.addEventListener("click", () => {
        direction = button.dataset.devDirection || "encode";
        document.querySelectorAll("[data-dev-direction]").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
      });
    });

    clearButton.addEventListener("click", () => {
      input.value = "";
      output.value = "";
      status.textContent = "Cleared.";
      if (markdownPreview) {
        markdownPreview.innerHTML = "<p>Rendered markdown will appear here.</p>";
      }
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        downloadUrl = null;
      }
      downloadLink.removeAttribute("href");
    });

    copyButton.addEventListener("click", async () => {
      if (!output.value) return;
      try {
        await navigator.clipboard.writeText(output.value);
        status.textContent = "Output copied.";
      } catch (error) {
        output.select();
        document.execCommand("copy");
        status.textContent = "Output copied.";
      }
    });

    runButton.addEventListener("click", async () => {
      try {
        const result = await runDevTransformation(config.mode, input.value, direction);
        output.value = result.text;
        status.textContent = result.message || "Done.";
        if (markdownPreview && result.html) {
          markdownPreview.innerHTML = result.html;
        }

        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        downloadUrl = URL.createObjectURL(new Blob([result.text], { type: "text/plain;charset=utf-8" }));
        downloadLink.href = downloadUrl;
        downloadLink.download = `${config.slug}.txt`;
      } catch (error) {
        console.error(error);
        status.textContent = error.message || "Could not run the tool.";
      }
    });
  }

  function initAiTool(config) {
    const input = document.getElementById("ai-input");
    const secondary = document.getElementById("ai-secondary");
    const output = document.getElementById("ai-output");
    const imageInput = document.getElementById("ai-image-input");
    const imagePreview = document.getElementById("ai-image-preview");
    const imageEmpty = document.getElementById("ai-image-empty");
    const runButton = document.getElementById("ai-run");
    const clearButton = document.getElementById("ai-clear");
    const copyButton = document.getElementById("ai-copy");
    const downloadLink = document.getElementById("ai-download");
    const status = document.getElementById("ai-status");

    if (!input || !output || !runButton || !clearButton || !copyButton || !downloadLink || !status) return;

    let downloadUrl = null;
    let selectedImage = null;
    let selectedImageUrl = null;

    if (imageInput && imagePreview && imageEmpty) {
      imageInput.addEventListener("change", () => {
        const [file] = imageInput.files || [];
        selectedImage = file || null;
        if (selectedImageUrl) {
          URL.revokeObjectURL(selectedImageUrl);
          selectedImageUrl = null;
        }

        if (!file) {
          imagePreview.hidden = true;
          imagePreview.removeAttribute("src");
          imageEmpty.hidden = false;
          status.textContent = "Ready.";
          return;
        }

        selectedImageUrl = URL.createObjectURL(file);
        imagePreview.src = selectedImageUrl;
        imagePreview.hidden = false;
        imageEmpty.hidden = true;
        status.textContent = `${file.name} ready for AI analysis.`;
      });
    }

    clearButton.addEventListener("click", () => {
      input.value = "";
      if (secondary) secondary.value = "";
      output.value = "";
      if (imageInput) imageInput.value = "";
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
        selectedImageUrl = null;
      }
      selectedImage = null;
      if (imagePreview) {
        imagePreview.hidden = true;
        imagePreview.removeAttribute("src");
      }
      if (imageEmpty) {
        imageEmpty.hidden = false;
      }
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        downloadUrl = null;
      }
      downloadLink.removeAttribute("href");
      downloadLink.classList.add("is-disabled");
      status.textContent = "Cleared.";
    });

    copyButton.addEventListener("click", async () => {
      if (!output.value) return;
      try {
        await navigator.clipboard.writeText(output.value);
      } catch (error) {
        output.select();
        document.execCommand("copy");
      }
      status.textContent = "Output copied.";
    });

    runButton.addEventListener("click", async () => {
      if (!input.value.trim() && !selectedImage) {
        status.textContent = "Add some text or upload an image first.";
        return;
      }

      runButton.disabled = true;
      runButton.textContent = "Generating...";
      status.textContent = "Calling the AI model...";

      try {
        const body = {
          tool: config.slug,
          input: input.value,
          secondary: secondary ? secondary.value : ""
        };

        if (selectedImage) {
          body.image = await readFileAsDataUrl(selectedImage);
        }

        const response = await fetch("/api/tools/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Could not generate the AI output.");
        }

        output.value = data.text;
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        downloadUrl = URL.createObjectURL(new Blob([data.text], { type: "text/plain;charset=utf-8" }));
        downloadLink.href = downloadUrl;
        downloadLink.download = `${config.slug}.txt`;
        downloadLink.classList.remove("is-disabled");
        status.textContent = "AI output generated.";
      } catch (error) {
        console.error(error);
        status.textContent = error.message || "Could not generate the AI output.";
      } finally {
        runButton.disabled = false;
        runButton.textContent = config.actionLabel || "Generate output";
      }
    });
  }

  async function runDevTransformation(mode, source, direction) {
    if (!source.trim()) {
      throw new Error("Paste some input before running the tool.");
    }

    if (mode === "json-format") {
      const json = JSON.parse(source);
      return { text: JSON.stringify(json, null, 2), message: "JSON formatted." };
    }

    if (mode === "json-minify") {
      const json = JSON.parse(source);
      return { text: JSON.stringify(json), message: "JSON minified." };
    }

    if (mode === "xml-format") {
      return { text: formatXml(source), message: "XML formatted." };
    }

    if (mode === "json-to-csv") {
      const payload = JSON.parse(source);
      const rows = Array.isArray(payload) ? payload : [payload];
      return { text: convertJsonToCsv(rows), message: "CSV generated." };
    }

    if (mode === "csv-to-json") {
      const rows = parseCsv(source);
      return { text: JSON.stringify(rows, null, 2), message: "JSON generated." };
    }

    if (mode === "base64") {
      return direction === "decode"
        ? { text: decodeBase64(source.trim()), message: "Base64 decoded." }
        : { text: encodeBase64(source), message: "Base64 encoded." };
    }

    if (mode === "url-encode") {
      return direction === "decode"
        ? { text: decodeURIComponent(source), message: "URL decoded." }
        : { text: encodeURIComponent(source), message: "URL encoded." };
    }

    if (mode === "timestamp") {
      return { text: convertTimestamp(source.trim()), message: "Timestamp converted." };
    }

    if (mode === "regex") {
      return { text: runRegexTest(source), message: "Regex tested." };
    }

    if (mode === "markdown") {
      const html = renderMarkdown(source);
      return { text: source, html, message: "Markdown preview updated." };
    }

    if (mode === "jwt") {
      return { text: decodeJwtToken(source.trim()), message: "JWT decoded." };
    }

    if (mode === "word-counter") {
      return { text: analyzeTextMetrics(source), message: "Text metrics generated." };
    }

    if (mode === "prompt-formatter") {
      return { text: formatAiPrompt(source), message: "Prompt formatted." };
    }

    if (mode === "youtube-transcript") {
      const response = await fetch("/api/tools/youtube-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: source
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not fetch the transcript.");
      }
      return { text: data.text, message: "Transcript fetched." };
    }

    throw new Error("Unsupported tool mode.");
  }

  function runRegexTest(source) {
    const pattern = valueOf("regex-pattern");
    const flags = valueOf("regex-flags");
    if (!pattern) {
      throw new Error("Enter a regex pattern first.");
    }

    const safeFlags = flags.includes("g") ? flags : `${flags}g`;
    const regex = new RegExp(pattern, safeFlags);
    const matches = Array.from(source.matchAll(regex));
    if (!matches.length) {
      return "No matches found.";
    }

    return [
      `Pattern: /${pattern}/${flags}`,
      `Matches: ${matches.length}`,
      "",
      ...matches.map((match, index) => {
        const groups = match.slice(1).filter((value) => value != null);
        return [
          `#${index + 1}`,
          `Match: ${match[0]}`,
          `Index: ${match.index}`,
          groups.length ? `Groups: ${groups.join(" | ")}` : "Groups: none",
          ""
        ].join("\n");
      })
    ].join("\n");
  }

  function renderMarkdown(source) {
    const escaped = escapeHtml(source);
    const codeBlocks = [];
    let html = escaped.replace(/```([\s\S]*?)```/g, (_, code) => {
      const token = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre><code>${code.trim()}</code></pre>`);
      return token;
    });

    html = html
      .replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
      .replace(/^- (.*)$/gm, "<li>$1</li>");

    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
    html = html
      .split(/\n{2,}/)
      .map((chunk) => {
        if (/^<h\d|^<ul>|^<pre>/.test(chunk.trim())) return chunk;
        return `<p>${chunk.replace(/\n/g, "<br />")}</p>`;
      })
      .join("");

    codeBlocks.forEach((block, index) => {
      html = html.replace(`__CODE_BLOCK_${index}__`, block);
    });

    return html;
  }

  function decodeJwtToken(source) {
    const parts = source.split(".");
    if (parts.length < 2) {
      throw new Error("Enter a valid JWT token.");
    }

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const output = [
      "Header",
      JSON.stringify(header, null, 2),
      "",
      "Payload",
      JSON.stringify(payload, null, 2)
    ];

    if (payload.exp) {
      output.push("", "Expiry", convertTimestamp(String(payload.exp)));
    }

    return output.join("\n");
  }

  function analyzeTextMetrics(source) {
    const normalized = source.replace(/\s+/g, " ").trim();
    const words = normalized ? normalized.split(" ") : [];
    const sentences = source.split(/[.!?]+/).map((value) => value.trim()).filter(Boolean);
    const paragraphs = source.split(/\n{2,}/).map((value) => value.trim()).filter(Boolean);
    const wordsPerMinute = 200;
    const wordCounts = {};

    words
      .map((word) => word.toLowerCase().replace(/[^a-z0-9'-]/g, ""))
      .filter((word) => word.length > 2)
      .forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });

    const density = Object.entries(wordCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 10)
      .map(([word, count]) => `${word}: ${count} (${((count / Math.max(words.length, 1)) * 100).toFixed(2)}%)`);

    return [
      `Words: ${words.length}`,
      `Characters: ${source.length}`,
      `Characters (no spaces): ${source.replace(/\s/g, "").length}`,
      `Sentences: ${sentences.length}`,
      `Paragraphs: ${paragraphs.length}`,
      `Estimated reading time: ${Math.max(1, Math.ceil(words.length / wordsPerMinute))} min`,
      "",
      "Top keyword density",
      density.length ? density.join("\n") : "No repeated keywords yet."
    ].join("\n");
  }

  function formatAiPrompt(source) {
    const lines = source
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const firstLine = lines[0] || source.trim();
    const extraLines = lines.slice(1);

    return [
      "Task",
      firstLine,
      "",
      "Context",
      extraLines.length ? extraLines.join("\n") : "Add the situation, domain, or product context here.",
      "",
      "Constraints",
      "- Keep the response concise",
      "- Preserve important requirements",
      "- Avoid making unsupported assumptions",
      "",
      "Desired Output",
      "- State the answer directly",
      "- Use clear structure where helpful",
      "- Include edge cases or caveats only if relevant"
    ].join("\n");
  }

  function formatXml(source) {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(source, "application/xml");
    const parserErrors = documentNode.getElementsByTagName("parsererror");
    if (parserErrors.length) {
      throw new Error("The XML input is not valid.");
    }

    const root = documentNode.documentElement;
    return serializeXmlNode(root, 0).trim();
  }

  function serializeXmlNode(node, depth) {
    const indent = "  ".repeat(depth);
    const childElements = Array.from(node.childNodes).filter(
      (child) => child.nodeType === Node.ELEMENT_NODE || (child.nodeType === Node.TEXT_NODE && child.textContent.trim())
    );
    const attributes = Array.from(node.attributes || [])
      .map((attribute) => `${attribute.name}="${attribute.value}"`)
      .join(" ");
    const openTag = attributes ? `<${node.nodeName} ${attributes}>` : `<${node.nodeName}>`;

    if (!childElements.length) {
      return `${indent}${openTag}</${node.nodeName}>`;
    }

    if (childElements.length === 1 && childElements[0].nodeType === Node.TEXT_NODE) {
      return `${indent}${openTag}${childElements[0].textContent.trim()}</${node.nodeName}>`;
    }

    const content = childElements
      .map((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          return `${"  ".repeat(depth + 1)}${child.textContent.trim()}`;
        }
        return serializeXmlNode(child, depth + 1);
      })
      .join("\n");

    return `${indent}${openTag}\n${content}\n${indent}</${node.nodeName}>`;
  }

  function convertJsonToCsv(rows) {
    if (!Array.isArray(rows) || !rows.length || typeof rows[0] !== "object") {
      throw new Error("Use a JSON array of objects for CSV conversion.");
    }

    const headers = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row || {}).forEach((key) => set.add(key));
        return set;
      }, new Set())
    );

    const escapeCell = (value) => {
      const text = value == null ? "" : String(value);
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const lines = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(","))
    ];

    return lines.join("\n");
  }

  function parseCsv(source) {
    const rows = [];
    let currentRow = [];
    let currentValue = "";
    let inQuotes = false;

    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      const nextCharacter = source[index + 1];

      if (character === '"') {
        if (inQuotes && nextCharacter === '"') {
          currentValue += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (character === "," && !inQuotes) {
        currentRow.push(currentValue);
        currentValue = "";
        continue;
      }

      if ((character === "\n" || character === "\r") && !inQuotes) {
        if (character === "\r" && nextCharacter === "\n") {
          index += 1;
        }
        currentRow.push(currentValue);
        if (currentRow.some((value) => value.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentValue = "";
        continue;
      }

      currentValue += character;
    }

    currentRow.push(currentValue);
    if (currentRow.some((value) => value.length > 0)) {
      rows.push(currentRow);
    }

    if (rows.length < 2) {
      throw new Error("CSV input needs a header row and at least one data row.");
    }

    const [headers, ...dataRows] = rows;
    return dataRows.map((row) => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = row[index] ?? "";
      });
      return entry;
    });
  }

  function encodeBase64(source) {
    const bytes = new TextEncoder().encode(source);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function decodeBase64(source) {
    const binary = atob(source);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function base64UrlDecode(source) {
    const normalized = source.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
    return decodeBase64(padded);
  }

  function convertTimestamp(source) {
    const numeric = Number(source);
    let date;
    let epochSeconds;
    let epochMilliseconds;

    if (!Number.isNaN(numeric) && /^\d+$/.test(source)) {
      epochMilliseconds = source.length > 11 ? numeric : numeric * 1000;
      epochSeconds = Math.floor(epochMilliseconds / 1000);
      date = new Date(epochMilliseconds);
    } else {
      date = new Date(source);
      if (Number.isNaN(date.getTime())) {
        throw new Error("Enter a valid epoch timestamp or date string.");
      }
      epochMilliseconds = date.getTime();
      epochSeconds = Math.floor(epochMilliseconds / 1000);
    }

    return [
      `ISO: ${date.toISOString()}`,
      `UTC: ${date.toUTCString()}`,
      `Local: ${date.toString()}`,
      `Epoch seconds: ${epochSeconds}`,
      `Epoch milliseconds: ${epochMilliseconds}`
    ].join("\n");
  }

  function initPdfMergeTool(config) {
    const input = document.getElementById("pdf-file-input");
    const list = document.getElementById("pdf-file-list");
    const runButton = document.getElementById("pdf-merge-run");
    const status = document.getElementById("pdf-merge-status");
    const downloadLink = document.getElementById("pdf-merge-download");

    if (!input || !list || !runButton || !status || !downloadLink) return;

    const state = {
      files: [],
      downloadUrl: null
    };

    input.addEventListener("change", () => {
      state.files = Array.from(input.files || []);
      renderPdfFileList(list, state.files);
      status.textContent = state.files.length ? `${state.files.length} file(s) ready to merge.` : "Add files and merge them to create a single PDF.";
    });

    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-file-action]");
      if (!button) return;
      const index = Number(button.dataset.index);
      const action = button.dataset.fileAction;
      if (!Number.isInteger(index)) return;

      if (action === "up" && index > 0) {
        [state.files[index - 1], state.files[index]] = [state.files[index], state.files[index - 1]];
      }
      if (action === "down" && index < state.files.length - 1) {
        [state.files[index + 1], state.files[index]] = [state.files[index], state.files[index + 1]];
      }
      if (action === "remove") {
        state.files.splice(index, 1);
      }

      renderPdfFileList(list, state.files);
      status.textContent = state.files.length ? `${state.files.length} file(s) ready to merge.` : "Add files and merge them to create a single PDF.";
    });

    runButton.addEventListener("click", async () => {
      if (!state.files.length) {
        status.textContent = "Add at least one PDF file first.";
        return;
      }

      if (!window.PDFLib || !window.PDFLib.PDFDocument) {
        status.textContent = "PDF engine could not be loaded.";
        return;
      }

      runButton.disabled = true;
      runButton.textContent = "Merging...";
      status.textContent = "Reading the PDF files...";

      try {
        const merged = await window.PDFLib.PDFDocument.create();

        for (const file of state.files) {
          const documentBytes = await file.arrayBuffer();
          const source = await window.PDFLib.PDFDocument.load(documentBytes);
          const pages = await merged.copyPages(source, source.getPageIndices());
          pages.forEach((page) => merged.addPage(page));
        }

        const mergedBytes = await merged.save();
        const mergedBlob = new Blob([mergedBytes], { type: "application/pdf" });
        if (state.downloadUrl) URL.revokeObjectURL(state.downloadUrl);
        state.downloadUrl = URL.createObjectURL(mergedBlob);

        downloadLink.href = state.downloadUrl;
        downloadLink.download = `${config.slug}.pdf`;
        downloadLink.classList.remove("is-disabled");
        status.textContent = `Merged ${state.files.length} files into one PDF.`;
      } catch (error) {
        console.error(error);
        status.textContent = error.message || "Could not merge the PDF files.";
      } finally {
        runButton.disabled = false;
        runButton.textContent = "Merge PDFs";
      }
    });
  }

  function initJpgToPdfTool(config) {
    const input = document.getElementById("pdf-image-input");
    const pageStyleSelect = document.getElementById("pdf-image-page-style");
    const list = document.getElementById("pdf-image-list");
    const runButton = document.getElementById("pdf-image-run");
    const status = document.getElementById("pdf-image-status");
    const downloadLink = document.getElementById("pdf-image-download");

    if (!input || !pageStyleSelect || !list || !runButton || !status || !downloadLink) return;

    const state = {
      files: [],
      downloadUrl: null
    };

    input.addEventListener("change", () => {
      state.files = Array.from(input.files || []);
      renderPdfFileList(list, state.files);
      status.textContent = state.files.length ? `${state.files.length} image(s) ready for PDF export.` : "Upload images to create a PDF file.";
    });

    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-file-action]");
      if (!button) return;
      const index = Number(button.dataset.index);
      const action = button.dataset.fileAction;
      if (!Number.isInteger(index)) return;

      if (action === "up" && index > 0) {
        [state.files[index - 1], state.files[index]] = [state.files[index], state.files[index - 1]];
      }
      if (action === "down" && index < state.files.length - 1) {
        [state.files[index + 1], state.files[index]] = [state.files[index], state.files[index + 1]];
      }
      if (action === "remove") {
        state.files.splice(index, 1);
      }

      renderPdfFileList(list, state.files);
    });

    runButton.addEventListener("click", async () => {
      if (!state.files.length) {
        status.textContent = "Add at least one image file first.";
        return;
      }

      if (!window.PDFLib || !window.PDFLib.PDFDocument) {
        status.textContent = "PDF engine could not be loaded.";
        return;
      }

      runButton.disabled = true;
      runButton.textContent = "Creating...";
      status.textContent = "Building the PDF document...";

      try {
        const documentInstance = await window.PDFLib.PDFDocument.create();
        const pageMode = pageStyleSelect.value;

        for (const file of state.files) {
          const bytes = await file.arrayBuffer();
          const isPng = file.type === "image/png";
          const embeddedImage = isPng
            ? await documentInstance.embedPng(bytes)
            : await documentInstance.embedJpg(bytes);
          const imageDimensions = embeddedImage.scale(1);

          if (pageMode === "a4") {
            const page = documentInstance.addPage([595.28, 841.89]);
            const maxWidth = 595.28 - 64;
            const maxHeight = 841.89 - 64;
            const scale = Math.min(maxWidth / imageDimensions.width, maxHeight / imageDimensions.height);
            const drawWidth = imageDimensions.width * scale;
            const drawHeight = imageDimensions.height * scale;
            const x = (page.getWidth() - drawWidth) / 2;
            const y = (page.getHeight() - drawHeight) / 2;
            page.drawImage(embeddedImage, {
              x,
              y,
              width: drawWidth,
              height: drawHeight
            });
          } else {
            const page = documentInstance.addPage([imageDimensions.width, imageDimensions.height]);
            page.drawImage(embeddedImage, {
              x: 0,
              y: 0,
              width: imageDimensions.width,
              height: imageDimensions.height
            });
          }
        }

        const pdfBytes = await documentInstance.save();
        const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
        if (state.downloadUrl) URL.revokeObjectURL(state.downloadUrl);
        state.downloadUrl = URL.createObjectURL(pdfBlob);

        downloadLink.href = state.downloadUrl;
        downloadLink.download = `${config.slug}.pdf`;
        downloadLink.classList.remove("is-disabled");
        status.textContent = `Created a PDF from ${state.files.length} image(s).`;
      } catch (error) {
        console.error(error);
        status.textContent = error.message || "Could not create the PDF.";
      } finally {
        runButton.disabled = false;
        runButton.textContent = "Create PDF";
      }
    });
  }

  function initPdfToWordTool(config) {
    const input = document.getElementById("pdf-to-word-input");
    const runButton = document.getElementById("pdf-to-word-run");
    const status = document.getElementById("pdf-to-word-status");
    const downloadLink = document.getElementById("pdf-to-word-download");

    if (!input || !runButton || !status || !downloadLink) return;

    runButton.addEventListener("click", async () => {
      const [file] = input.files || [];
      if (!file) {
        status.textContent = "Select a PDF first.";
        return;
      }

      runButton.disabled = true;
      runButton.textContent = "Converting...";
      status.textContent = "Extracting text from the PDF...";

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/tools/pdf-to-word", {
          method: "POST",
          body: formData
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Could not convert the PDF.");
        }

        downloadLink.href = data.dataUrl;
        downloadLink.download = data.fileName || `${config.slug}.docx`;
        downloadLink.classList.remove("is-disabled");
        status.textContent = `Word document ready. Extracted ${data.textLength} characters of text.`;
      } catch (error) {
        console.error(error);
        status.textContent = error.message || "Could not convert the PDF.";
      } finally {
        runButton.disabled = false;
        runButton.textContent = "Convert to Word";
      }
    });
  }

  function initImageBatchTool(config) {
    const input = document.getElementById("image-batch-input");
    const qualityInput = document.getElementById("image-batch-quality");
    const qualityValue = document.getElementById("image-batch-quality-value");
    const runButton = document.getElementById("image-batch-run");
    const resetButton = document.getElementById("image-batch-reset");
    const fileList = document.getElementById("image-batch-list");
    const resultList = document.getElementById("image-batch-result-list");
    const status = document.getElementById("image-batch-status");

    if (!input || !qualityInput || !qualityValue || !runButton || !resetButton || !fileList || !resultList || !status) return;

    const state = {
      files: [],
      urls: []
    };

    qualityValue.textContent = Number(qualityInput.value).toFixed(2);
    qualityInput.addEventListener("input", () => {
      qualityValue.textContent = Number(qualityInput.value).toFixed(2);
    });

    input.addEventListener("change", () => {
      state.files = Array.from(input.files || []);
      renderPdfFileList(fileList, state.files);
      resultList.innerHTML = '<p class="file-list__empty">Compressed files will appear here.</p>';
      status.textContent = state.files.length ? `${state.files.length} file(s) ready for compression.` : "Add multiple images to compress them together.";
    });

    resetButton.addEventListener("click", () => {
      input.value = "";
      state.files = [];
      state.urls.forEach((url) => URL.revokeObjectURL(url));
      state.urls = [];
      qualityInput.value = "0.76";
      qualityValue.textContent = "0.76";
      fileList.innerHTML = '<p class="file-list__empty">No images added yet.</p>';
      resultList.innerHTML = '<p class="file-list__empty">Compressed files will appear here.</p>';
      status.textContent = "Add multiple images to compress them together.";
    });

    runButton.addEventListener("click", async () => {
      if (!state.files.length) {
        status.textContent = "Select some images first.";
        return;
      }

      state.urls.forEach((url) => URL.revokeObjectURL(url));
      state.urls = [];
      resultList.innerHTML = "";
      runButton.disabled = true;
      runButton.textContent = "Compressing...";
      status.textContent = "Processing the selected images...";

      try {
        for (const file of state.files) {
          const processed = await processImageFile(file, {
            width: null,
            height: null,
            outputFormat: "image/jpeg",
            quality: Number(qualityInput.value)
          });

          const url = URL.createObjectURL(processed.blob);
          state.urls.push(url);
          const row = document.createElement("article");
          row.className = "file-row";
          row.innerHTML = `
            <div class="file-row__meta">
              <strong>${escapeHtml(createFileStem(file.name))}-compressed.jpg</strong>
              <span>${formatBytes(file.size)} → ${formatBytes(processed.blob.size)}</span>
            </div>
            <div class="file-row__actions">
              <a class="button button--secondary" href="${url}" download="${escapeHtml(createFileStem(file.name))}-compressed.jpg">Download</a>
            </div>
          `;
          resultList.appendChild(row);
        }

        status.textContent = `Compressed ${state.files.length} file(s).`;
      } catch (error) {
        console.error(error);
        status.textContent = error.message || "Could not compress the batch.";
      } finally {
        runButton.disabled = false;
        runButton.textContent = "Compress batch";
      }
    });
  }

  function initHeicTool(config) {
    const input = document.getElementById("heic-input");
    const runButton = document.getElementById("heic-run");
    const fileList = document.getElementById("heic-file-list");
    const resultList = document.getElementById("heic-result-list");
    const status = document.getElementById("heic-status");

    if (!input || !runButton || !fileList || !resultList || !status) return;

    input.addEventListener("change", () => {
      renderPdfFileList(fileList, Array.from(input.files || []));
      resultList.innerHTML = '<p class="file-list__empty">No converted files yet.</p>';
      status.textContent = input.files?.length ? `${input.files.length} file(s) ready to convert.` : "Converted JPG files will appear in the list below.";
    });

    runButton.addEventListener("click", async () => {
      const files = Array.from(input.files || []);
      if (!files.length) {
        status.textContent = "Select HEIC files first.";
        return;
      }

      runButton.disabled = true;
      runButton.textContent = "Converting...";
      status.textContent = "Converting HEIC files into JPG...";

      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        const response = await fetch("/api/tools/heic-to-jpg", {
          method: "POST",
          body: formData
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || "HEIC conversion failed.");
        }

        resultList.innerHTML = "";
        data.files.forEach((file) => {
          const row = document.createElement("article");
          row.className = "file-row";
          row.innerHTML = `
            <div class="file-row__meta">
              <strong>${escapeHtml(file.fileName)}</strong>
              <span>${formatBytes(file.size)}</span>
            </div>
            <div class="file-row__actions">
              <a class="button button--secondary" href="${file.dataUrl}" download="${escapeHtml(file.fileName)}">Download</a>
            </div>
          `;
          resultList.appendChild(row);
        });
        status.textContent = `Converted ${data.files.length} file(s) into JPG.`;
      } catch (error) {
        console.error(error);
        status.textContent = error.message || "Could not convert the HEIC files.";
      } finally {
        runButton.disabled = false;
        runButton.textContent = "Convert to JPG";
      }
    });
  }

  function initBackgroundRemoverTool(config) {
    const input = document.getElementById("background-removal-input");
    const formatSelect = document.getElementById("background-removal-format");
    const runButton = document.getElementById("background-removal-run");
    const resetButton = document.getElementById("background-removal-reset");
    const status = document.getElementById("background-removal-status");
    const originalPreview = document.getElementById("background-removal-original");
    const originalEmpty = document.getElementById("background-removal-original-empty");
    const resultPreview = document.getElementById("background-removal-result");
    const resultEmpty = document.getElementById("background-removal-result-empty");
    const downloadLink = document.getElementById("background-removal-download");

    if (
      !input ||
      !formatSelect ||
      !runButton ||
      !resetButton ||
      !status ||
      !originalPreview ||
      !originalEmpty ||
      !resultPreview ||
      !resultEmpty ||
      !downloadLink
    ) {
      return;
    }

    const api = window.StudentDevBackgroundRemoval;
    if (!api || typeof api.removeBackground !== "function") {
      status.textContent = "Background removal engine could not be loaded.";
      runButton.disabled = true;
      return;
    }

    let originalUrl = null;
    let resultUrl = null;
    let selectedFile = null;
    let preloadPromise = null;

    const createRemovalOptions = (outputMimeType) => ({
      device: "cpu",
      model: "isnet_quint8",
      output: {
        format: outputMimeType,
        quality: 0.9,
        type: "foreground"
      },
      progress: (key, current, total) => {
        if (!current || !total) {
          status.textContent = `Preparing ${key || "assets"}...`;
          return;
        }
        const percent = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
        status.textContent = `Downloading ${key || "model"}... ${percent}%`;
      }
    });

    const warmModel = () => {
      if (preloadPromise || typeof api.preload !== "function") {
        return preloadPromise;
      }

      preloadPromise = api.preload(createRemovalOptions("image/png")).catch((error) => {
        preloadPromise = null;
        throw error;
      });

      return preloadPromise;
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        warmModel().catch(() => {});
      });
    }

    input.addEventListener("change", () => {
      const [file] = input.files || [];
      selectedFile = file || null;

      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
        originalUrl = null;
      }

      if (!file) {
        originalPreview.hidden = true;
        originalPreview.removeAttribute("src");
        originalEmpty.hidden = false;
        status.textContent = "Upload an image to start the background removal process.";
        return;
      }

      originalUrl = URL.createObjectURL(file);
      originalPreview.src = originalUrl;
      originalPreview.hidden = false;
      originalEmpty.hidden = true;
      status.textContent = `${file.name} ready for background removal.`;
      warmModel().catch(() => {});
    });

    resetButton.addEventListener("click", () => {
      input.value = "";
      selectedFile = null;
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
        originalUrl = null;
      }
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        resultUrl = null;
      }
      originalPreview.hidden = true;
      originalPreview.removeAttribute("src");
      originalEmpty.hidden = false;
      resultPreview.hidden = true;
      resultPreview.removeAttribute("src");
      resultEmpty.hidden = false;
      downloadLink.removeAttribute("href");
      downloadLink.classList.add("is-disabled");
      status.textContent = "Upload an image to start the background removal process.";
    });

    runButton.addEventListener("click", async () => {
      if (!selectedFile) {
        status.textContent = "Select an image first.";
        return;
      }

      runButton.disabled = true;
      runButton.textContent = "Removing...";
      status.textContent = "Loading the background removal model...";

      try {
        const outputMimeType = formatSelect.value || "image/png";
        if (preloadPromise) {
          await preloadPromise.catch(() => {});
        }
        status.textContent = "Removing the background...";
        const resultBlob = await api.removeBackground(selectedFile, createRemovalOptions(outputMimeType));

        if (resultUrl) URL.revokeObjectURL(resultUrl);
        resultUrl = URL.createObjectURL(resultBlob);
        resultPreview.src = resultUrl;
        resultPreview.hidden = false;
        resultEmpty.hidden = true;
        downloadLink.href = resultUrl;
        downloadLink.download = `${createFileStem(selectedFile.name)}-background-removed${getExtensionForMime(resultBlob.type)}`;
        downloadLink.classList.remove("is-disabled");
        status.textContent = `Background removed. Result size: ${formatBytes(resultBlob.size)}.`;
      } catch (error) {
        console.error(error);
        status.textContent = error.message || "Could not remove the background.";
      } finally {
        runButton.disabled = false;
        runButton.textContent = "Remove background";
      }
    });
  }

  function initIconCustomizerTool(config) {
    const iconSelect = document.getElementById("icon-customizer-name");
    const sizeInput = document.getElementById("icon-customizer-size");
    const strokeInput = document.getElementById("icon-customizer-stroke");
    const colorInput = document.getElementById("icon-customizer-color");
    const runButton = document.getElementById("icon-customizer-run");
    const preview = document.getElementById("icon-customizer-preview");
    const svgLink = document.getElementById("icon-customizer-download-svg");
    const pngLink = document.getElementById("icon-customizer-download-png");

    if (!iconSelect || !sizeInput || !strokeInput || !colorInput || !runButton || !preview || !svgLink || !pngLink) return;

    Object.keys(ICON_LIBRARY).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name.replace(/-/g, " ");
      iconSelect.appendChild(option);
    });

    let svgUrl = null;
    let pngUrl = null;

    runButton.addEventListener("click", async () => {
      const name = iconSelect.value || "spark";
      const size = Math.max(16, Math.min(512, Number(sizeInput.value) || 96));
      const strokeWidth = Math.max(1, Math.min(4, Number(strokeInput.value) || 1.75));
      const color = colorInput.value || "#d6b16a";
      const svgMarkup = buildIconSvg(name, size, strokeWidth, color);

      preview.innerHTML = svgMarkup;

      if (svgUrl) URL.revokeObjectURL(svgUrl);
      if (pngUrl) URL.revokeObjectURL(pngUrl);
      svgUrl = URL.createObjectURL(new Blob([svgMarkup], { type: "image/svg+xml" }));
      pngUrl = await svgToPngUrl(svgMarkup, size * 2, size * 2);

      svgLink.href = svgUrl;
      svgLink.download = `${config.slug}-${name}.svg`;
      svgLink.classList.remove("is-disabled");
      pngLink.href = pngUrl;
      pngLink.download = `${config.slug}-${name}.png`;
      pngLink.classList.remove("is-disabled");
    });
  }

  function buildIconSvg(name, size, strokeWidth, color) {
    const icon = ICON_LIBRARY[name] || ICON_LIBRARY.spark;
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${strokeWidth}">
        ${icon.paths.join("")}
      </svg>
    `;
  }

  async function svgToPngUrl(svgMarkup, width, height) {
    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);
    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = svgUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);
      return canvas.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }

  function initDeviceMockupTool(config) {
    const input = document.getElementById("device-mockup-input");
    const frameSelect = document.getElementById("device-mockup-frame");
    const backgroundInput = document.getElementById("device-mockup-background");
    const runButton = document.getElementById("device-mockup-run");
    const canvas = document.getElementById("device-mockup-canvas");
    const empty = document.getElementById("device-mockup-empty");
    const downloadLink = document.getElementById("device-mockup-download");

    if (!input || !frameSelect || !backgroundInput || !runButton || !canvas || !empty || !downloadLink) return;

    runButton.addEventListener("click", async () => {
      const [file] = input.files || [];
      if (!file) return;

      const image = await loadImage(file);
      const context = canvas.getContext("2d");
      const frame = frameSelect.value;
      const background = backgroundInput.value || "#f5f0e6";

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      if (frame === "phone") {
        drawPhoneMockup(context, canvas, image);
      } else {
        drawBrowserMockup(context, canvas, image);
      }

      canvas.hidden = false;
      empty.hidden = true;
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = `${config.slug}.png`;
      downloadLink.classList.remove("is-disabled");
    });
  }

  function drawPhoneMockup(context, canvas, image) {
    const frameWidth = 320;
    const frameHeight = 620;
    const x = (canvas.width - frameWidth) / 2;
    const y = (canvas.height - frameHeight) / 2;
    roundRect(context, x, y, frameWidth, frameHeight, 48, "#1b1b1b");
    roundRect(context, x + 18, y + 18, frameWidth - 36, frameHeight - 36, 32, "#0b0b0b");
    const screenX = x + 28;
    const screenY = y + 54;
    const screenWidth = frameWidth - 56;
    const screenHeight = frameHeight - 100;
    context.fillStyle = "#ffffff";
    context.fillRect(screenX, screenY, screenWidth, screenHeight);
    drawContainedImage(context, image, screenX, screenY, screenWidth, screenHeight);
  }

  function drawBrowserMockup(context, canvas, image) {
    const shellWidth = 760;
    const shellHeight = 500;
    const x = (canvas.width - shellWidth) / 2;
    const y = (canvas.height - shellHeight) / 2;
    roundRect(context, x, y, shellWidth, shellHeight, 24, "#fdfdfd");
    context.fillStyle = "#ece7dc";
    context.fillRect(x, y, shellWidth, 58);
    context.fillStyle = "#d6b16a";
    context.beginPath();
    context.arc(x + 28, y + 29, 7, 0, Math.PI * 2);
    context.arc(x + 50, y + 29, 7, 0, Math.PI * 2);
    context.arc(x + 72, y + 29, 7, 0, Math.PI * 2);
    context.fill();
    drawContainedImage(context, image, x + 24, y + 78, shellWidth - 48, shellHeight - 102);
  }

  function drawContainedImage(context, image, x, y, width, height) {
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  function roundRect(context, x, y, width, height, radius, fillStyle) {
    context.fillStyle = fillStyle;
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
    context.fill();
  }

  function renderPdfFileList(root, files) {
    if (!files.length) {
      root.innerHTML = '<p class="file-list__empty">No files added yet.</p>';
      return;
    }

    root.innerHTML = files
      .map(
        (file, index) => `
          <article class="file-row">
            <div class="file-row__meta">
              <strong>${escapeHtml(file.name)}</strong>
              <span>${formatBytes(file.size)}</span>
            </div>
            <div class="file-row__actions">
              <button type="button" data-file-action="up" data-index="${index}" aria-label="Move up">↑</button>
              <button type="button" data-file-action="down" data-index="${index}" aria-label="Move down">↓</button>
              <button type="button" data-file-action="remove" data-index="${index}" aria-label="Remove">×</button>
            </div>
          </article>
        `
      )
      .join("");
  }

  function valueOf(id) {
    const element = document.getElementById(id);
    return element ? String(element.value || "").trim() : "";
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read the selected file."));
      reader.readAsDataURL(file);
    });
  }

  function createFileStem(filename) {
    return filename.replace(/\.[^/.]+$/, "");
  }

  function getExtensionForMime(mimeType) {
    if (mimeType === "image/png") return ".png";
    if (mimeType === "image/webp") return ".webp";
    if (mimeType === "application/pdf") return ".pdf";
    if (mimeType === "image/svg+xml") return ".svg";
    return ".jpg";
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
