/* ===== DOM REFERENCES ===== */
const moduleContainer = document.getElementById("moduleContainer");
const moduleFilter = document.getElementById("moduleFilter");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const topNav = document.getElementById("topNav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

let currentLightbox = { moduleId: null, index: 0 };

/* ===== HELPERS ===== */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function severityClass(severity) {
  return severity.toLowerCase();
}

/* ===== MODULE FILTER BUTTONS ===== */
function createFilter() {
  const types = ["All", ...new Set(modules.map((m) => m.type))];
  moduleFilter.innerHTML = types
    .map(
      (type, i) =>
        `<button class="filter-btn${i === 0 ? " active" : ""}" data-filter="${type}">${type}</button>`
    )
    .join("");
}

/* ===== PAYLOAD HTML ===== */
function payloadHtml(payloads) {
  return payloads
    .map(
      (payload) => `
    <div class="payload-box">
      <div class="payload-head">
        <span class="payload-label">${escapeHtml(payload.label)}</span>
        <button class="copy-btn" data-code="${escapeHtml(payload.code)}">Copy</button>
      </div>
      <pre><code>${escapeHtml(payload.code)}</code></pre>
    </div>
  `
    )
    .join("");
}

/* ===== EVIDENCE GALLERY HTML ===== */
function evidenceHtml(module) {
  return module.images
    .map(
      ([src, caption], i) => `
    <div class="evidence-thumb" data-module="${module.id}" data-index="${i}">
      <img src="${src}" alt="${escapeHtml(caption)}" loading="lazy" />
      <div class="thumb-overlay"><span>${escapeHtml(caption)}</span></div>
      <div class="thumb-zoom-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </div>
    </div>
  `
    )
    .join("");
}

/* ===== MODULE CARD HTML ===== */
function moduleHtml(module) {
  return `
    <article class="module-card" id="${module.id}" data-module="${module.id}" data-type="${escapeHtml(module.type)}">
      <div class="module-header">
        <div>
          <span class="module-tag">${escapeHtml(module.type)}</span>
          <h3>${escapeHtml(module.title)}</h3>
          <p>${escapeHtml(module.overview)}</p>
        </div>
        <span class="severity ${severityClass(module.severity)}">${escapeHtml(module.severity)}</span>
      </div>

      <div class="module-body">
        <div class="module-details">
          <div class="info-block">
            <h4>Vulnerable Point</h4>
            <div class="vulnerable-box">${escapeHtml(module.vulnerable)}</div>
          </div>

          <div class="info-block">
            <h4>Performed Steps</h4>
            <ol class="steps">
              ${module.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
            </ol>
          </div>

          <div class="payloads">
            <h4>Payloads / Commands</h4>
            ${payloadHtml(module.payloads)}
          </div>
        </div>

        <div class="module-evidence">
          <h4 class="evidence-header">Visual Evidence (${module.images.length} screenshots)</h4>
          <div class="evidence-gallery">
            ${evidenceHtml(module)}
          </div>
        </div>
      </div>
    </article>
  `;
}

/* ===== CREATE MODULES ===== */
function createModules() {
  moduleContainer.innerHTML = modules.map(moduleHtml).join("");
}

/* ===== LIGHTBOX ===== */
function openLightbox(moduleId, index) {
  const module = modules.find((m) => m.id === moduleId);
  if (!module) return;

  currentLightbox = { moduleId, index };
  const [src, caption] = module.images[index];

  lightboxImage.src = src;
  lightboxImage.alt = caption;
  lightboxCaption.textContent = caption;
  lightboxCounter.textContent = `${index + 1} / ${module.images.length}`;

  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

function navigateLightbox(direction) {
  const module = modules.find((m) => m.id === currentLightbox.moduleId);
  if (!module) return;

  const total = module.images.length;
  const nextIndex =
    direction === "next"
      ? (currentLightbox.index + 1) % total
      : (currentLightbox.index - 1 + total) % total;

  openLightbox(currentLightbox.moduleId, nextIndex);
}

/* ===== SCROLL ANIMATIONS ===== */
function setupScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  const cards = document.querySelectorAll(".module-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { rootMargin: "0px 0px -60px 0px", threshold: 0.1 }
  );

  reveals.forEach((el) => observer.observe(el));
  cards.forEach((el) => observer.observe(el));
}

/* ===== COUNTER ANIMATION ===== */
function animateCounters() {
  const counters = document.querySelectorAll("[data-count]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = current + "+";
        }, 30);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ===== NAV SCROLL EFFECT ===== */
function setupNavScroll() {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      topNav.classList.toggle("scrolled", window.scrollY > 40);
      ticking = false;
    });
  });
}

/* ===== MOBILE NAV TOGGLE ===== */
function setupMobileNav() {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
    }
  });
}

/* ===== FILTER MODULES ===== */
function setupFilter() {
  moduleFilter.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    const cards = document.querySelectorAll(".module-card");

    cards.forEach((card, i) => {
      const match = filter === "All" || card.dataset.type === filter;
      card.style.display = match ? "" : "none";
      if (match) {
        card.style.animation = `fadeInUp 0.5s ease ${i * 0.05}s both`;
      }
    });
  });
}

/* ===== ALL EVENTS ===== */
function setupEvents() {
  document.addEventListener("click", async (e) => {
    // Evidence thumbnail -> lightbox
    const thumb = e.target.closest(".evidence-thumb");
    if (thumb) {
      openLightbox(thumb.dataset.module, parseInt(thumb.dataset.index, 10));
      return;
    }

    // Copy button
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      const text = copyBtn.dataset.code;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("copied");
        }, 1500);
      } catch {
        copyBtn.textContent = "Select text";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      }
    }
  });

  // Lightbox controls
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => navigateLightbox("prev"));
  lightboxNext.addEventListener("click", () => navigateLightbox("next"));

  document.querySelector(".lightbox-overlay").addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox("prev");
    if (e.key === "ArrowRight") navigateLightbox("next");
  });
}

/* ===== INIT ===== */
createFilter();
createModules();
setupEvents();
setupScrollReveal();
animateCounters();
setupNavScroll();
setupMobileNav();
setupFilter();
