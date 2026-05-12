const moduleNav = document.getElementById("moduleNav");
const moduleContainer = document.getElementById("moduleContainer");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalCaption = document.getElementById("modalCaption");
const modalClose = document.getElementById("modalClose");

const state = {};

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

function createNav() {
  moduleNav.innerHTML = modules.map((module, index) => `
    <a class="nav-link" href="#${module.id}" data-target="${module.id}">
      <span>${String(index + 1).padStart(2, "0")}. ${module.title}</span>
      <small>${module.severity}</small>
    </a>
  `).join("");
}

function payloadHtml(payloads) {
  return payloads.map((payload) => `
    <div class="payload-box">
      <div class="payload-head">
        <span class="payload-label">${escapeHtml(payload.label)}</span>
        <button class="copy-btn" data-code="${escapeHtml(payload.code)}">Copy</button>
      </div>
      <pre><code>${escapeHtml(payload.code)}</code></pre>
    </div>
  `).join("");
}

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
        <div>
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

        <div class="evidence">
          <h4>Visual Evidence</h4>
          <div class="carousel" data-carousel="${module.id}">
            <div class="carousel-top">
              <span class="counter" data-counter="${module.id}">1/${module.images.length}</span>
              <div class="carousel-controls">
                <button class="carousel-btn" data-dir="prev" data-id="${module.id}" aria-label="Previous screenshot">‹</button>
                <button class="carousel-btn" data-dir="next" data-id="${module.id}" aria-label="Next screenshot">›</button>
              </div>
            </div>
            <div class="image-wrap" data-open="${module.id}">
              <img src="${firstImage[0]}" alt="${escapeHtml(firstImage[1])}" data-image="${module.id}" />
            </div>
            <div class="image-caption" data-caption="${module.id}">${escapeHtml(firstImage[1])}</div>
          </div>
          <a class="back-top" href="#top">Back to top ↑</a>
        </div>
      </div>
    </article>
  `;
}

function createModules() {
  moduleContainer.innerHTML = modules.map(moduleHtml).join("");
}

function updateCarousel(id, direction) {
  const module = modules.find((item) => item.id === id);
  if (!module) return;

  const total = module.images.length;
  const current = state[id] || 0;
  const nextIndex = direction === "next"
    ? (current + 1) % total
    : (current - 1 + total) % total;

  state[id] = nextIndex;
  const [src, caption] = module.images[nextIndex];

  const image = document.querySelector(`[data-image="${id}"]`);
  const counter = document.querySelector(`[data-counter="${id}"]`);
  const captionEl = document.querySelector(`[data-caption="${id}"]`);

  image.src = src;
  image.alt = caption;
  counter.textContent = `${nextIndex + 1}/${total}`;
  captionEl.textContent = caption;
}

function openModal(id) {
  const module = modules.find((item) => item.id === id);
  if (!module) return;

  const current = state[id] || 0;
  const [src, caption] = module.images[current];
  modalImage.src = src;
  modalImage.alt = caption;
  modalCaption.textContent = caption;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  modalImage.src = "";
}

function setupEvents() {
  document.addEventListener("click", async (event) => {
    const carouselBtn = event.target.closest(".carousel-btn");
    if (carouselBtn) {
      updateCarousel(carouselBtn.dataset.id, carouselBtn.dataset.dir);
      return;
    }

    const imageWrap = event.target.closest("[data-open]");
    if (imageWrap) {
      openModal(imageWrap.dataset.open);
      return;
    }

    const copyBtn = event.target.closest(".copy-btn");
    if (copyBtn) {
      const text = copyBtn.dataset.code;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied";
        setTimeout(() => copyBtn.textContent = "Copy", 1200);
      } catch (error) {
        copyBtn.textContent = "Select text";
        setTimeout(() => copyBtn.textContent = "Copy", 1200);
      }
    }
  });

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

function observeActiveSection() {
  const links = [...document.querySelectorAll(".nav-link")];
  const sections = modules.map((module) => document.getElementById(module.id));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.classList.toggle("active", link.dataset.target === entry.target.id));
    });
  }, { rootMargin: "-20% 0px -70% 0px", threshold: 0.01 });

  sections.forEach((section) => observer.observe(section));
}

createNav();
createModules();
setupEvents();
observeActiveSection();
