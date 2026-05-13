/* ===== DOM ===== */
const moduleNav = document.getElementById("moduleNav");
const moduleContainer = document.getElementById("moduleContainer");
const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lbImage");
const lbCaption = document.getElementById("lbCaption");
const lbCounter = document.getElementById("lbCounter");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

const state = {};
let currentLb = { moduleId: null, index: 0 };

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

/* ===== SIDEBAR NAV ===== */
function createNav() {
  moduleNav.innerHTML = modules
    .map(
      (module, index) => `
    <a class="nav-link" href="#${module.id}" data-target="${module.id}">
      <span>${String(index + 1).padStart(2, "0")}. ${module.title}</span>
      <small>${module.severity}</small>
    </a>
  `
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

/* ===== MODULE CARD ===== */
function moduleHtml(module) {
  state[module.id] = 0;
  const firstImage = module.images[0];

  return `
    <article class="module-card" id="${module.id}" data-module="${module.id}">
      <div class="module-header">
        <div>
          <span class="module-tag">${escapeHtml(module.type)}</span>
          <h3>${escapeHtml(module.title)}</h3>
          <p>${escapeHtml(module.overview)}</p>
        </div>
        <span class="severity ${severityClass(module.severity)}">${escapeHtml(module.severity)}</span>
      </div>

      <div class="module-body">
        <div class="module-evidence">
          <h4 class="evidence-title">Visual Evidence (${module.images.length} Screenshots) — Click to enlarge</h4>
          <div class="carousel" data-carousel="${module.id}">
            <div class="carousel-top">
              <span class="carousel-counter" data-counter="${module.id}">1 / ${module.images.length}</span>
              <div class="carousel-controls">
                <button class="carousel-btn" data-dir="prev" data-id="${module.id}" aria-label="Previous screenshot">&lsaquo;</button>
                <button class="carousel-btn" data-dir="next" data-id="${module.id}" aria-label="Next screenshot">&rsaquo;</button>
              </div>
            </div>
            <div class="carousel-info-bar">
              <div class="carousel-caption" data-caption="${module.id}">${escapeHtml(firstImage[1])}</div>
              <div class="carousel-detail" data-detail="${module.id}">${firstImage[2] ? escapeHtml(firstImage[2]) : ""}</div>
            </div>
            <div class="carousel-image-wrap" data-open="${module.id}">
              <img src="${firstImage[0]}" alt="${escapeHtml(firstImage[1])}" data-image="${module.id}" />
            </div>
          </div>
        </div>

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

          <a class="back-top" href="#top">Back to top &uarr;</a>
        </div>
      </div>
    </article>
  `;
}

function createModules() {
  moduleContainer.innerHTML = modules.map(moduleHtml).join("");
}

/* ===== CAROUSEL ===== */
function updateCarousel(id, direction) {
  const module = modules.find((m) => m.id === id);
  if (!module) return;

  const total = module.images.length;
  const current = state[id] || 0;
  const nextIndex =
    direction === "next"
      ? (current + 1) % total
      : (current - 1 + total) % total;

  state[id] = nextIndex;
  const [src, caption, detail] = module.images[nextIndex];

  const image = document.querySelector(`[data-image="${id}"]`);
  const counter = document.querySelector(`[data-counter="${id}"]`);
  const captionEl = document.querySelector(`[data-caption="${id}"]`);
  const detailEl = document.querySelector(`[data-detail="${id}"]`);

  image.style.opacity = "0";
  image.style.transform = "scale(0.96)";

  setTimeout(() => {
    image.src = src;
    image.alt = caption;
    image.style.opacity = "1";
    image.style.transform = "scale(1)";
    counter.textContent = `${nextIndex + 1} / ${total}`;
    captionEl.textContent = caption;
    if (detailEl) detailEl.textContent = detail || "";
  }, 200);
}

/* ===== LIGHTBOX ===== */
function openLightbox(moduleId) {
  const module = modules.find((m) => m.id === moduleId);
  if (!module) return;

  const index = state[moduleId] || 0;
  currentLb = { moduleId, index };
  const [src, caption, detail] = module.images[index];

  lbImage.src = src;
  lbImage.alt = caption;
  lbCaption.textContent = detail || caption;
  lbCounter.textContent = `${index + 1} / ${module.images.length}`;

  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  lbImage.src = "";
  document.body.style.overflow = "";
}

function navigateLightbox(direction) {
  const module = modules.find((m) => m.id === currentLb.moduleId);
  if (!module) return;

  const total = module.images.length;
  currentLb.index =
    direction === "next"
      ? (currentLb.index + 1) % total
      : (currentLb.index - 1 + total) % total;

  const [src, caption, detail] = module.images[currentLb.index];
  lbImage.src = src;
  lbImage.alt = caption;
  lbCaption.textContent = detail || caption;
  lbCounter.textContent = `${currentLb.index + 1} / ${total}`;
}

/* ===== SCROLL REVEAL ===== */
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
    { rootMargin: "0px 0px -50px 0px", threshold: 0.1 }
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
        const step = Math.max(1, Math.floor(target / 30));

        const interval = setInterval(() => {
          current += step;

          if (current >= target) {
            current = target;
            clearInterval(interval);
          }

          el.textContent = current + "+";
        }, 35);

        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ===== ACTIVE NAV HIGHLIGHT ===== */
function observeActiveSection() {
  const links = [...document.querySelectorAll(".nav-link")];
  const sections = modules.map((m) => document.getElementById(m.id));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) =>
          link.classList.toggle("active", link.dataset.target === entry.target.id)
        );
      });
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: 0.01 }
  );

  sections.forEach((section) => {
    if (section) observer.observe(section);
  });
}

/* ===== MOBILE SIDEBAR ===== */
function setupSidebar() {
  sidebarToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("open");
  });

  sidebar.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", () => {
    if (window.innerWidth <= 1100) {
      sidebar.classList.remove("open");
    }
  });

  moduleNav.addEventListener("click", (e) => {
    if (e.target.closest(".nav-link")) {
      sidebar.classList.remove("open");
    }
  });
}

/* ===== EVENTS ===== */
function setupEvents() {
  document.addEventListener("click", async (e) => {
    const carouselBtn = e.target.closest(".carousel-btn");

    if (carouselBtn) {
      updateCarousel(carouselBtn.dataset.id, carouselBtn.dataset.dir);
      return;
    }

    const imageWrap = e.target.closest("[data-open]");

    if (imageWrap) {
      openLightbox(imageWrap.dataset.open);
      return;
    }

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
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      }
    }
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => navigateLightbox("prev"));
  lbNext.addEventListener("click", () => navigateLightbox("next"));
  document.querySelector(".lightbox-overlay").addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox("prev");
    if (e.key === "ArrowRight") navigateLightbox("next");
  });
}

/* ===== INIT ===== */
createNav();
createModules();
setupEvents();
setupScrollReveal();
animateCounters();
observeActiveSection();
setupSidebar();