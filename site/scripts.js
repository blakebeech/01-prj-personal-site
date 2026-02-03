/*
  Shared JavaScript for the multi-page portfolio site.
  Vanilla JS only, no external libraries.

  Table of contents:
  1) Config + Helpers
  2) Nav/Footer Injection
  3) Theme Toggle
  4) Active Nav + Smooth Scroll
  5) Projects Filters
  6) Case Study TOC
  7) Copy + Toasts
  8) Demo Form
  9) Scroll Progress
 10) Init
*/

const siteConfig = {
  email: "beechclt@gmail.com",
};

/* ---------- Helper functions ---------- */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for older browsers
  const temp = document.createElement("textarea");
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  return Promise.resolve();
}

/* ---------- Navigation + Footer Injection ---------- */
function injectNavFooter() {
  const navHTML = `
    <header class="site-header">
      <nav class="nav container" aria-label="Primary">
        <a class="brand" href="index.html">Blake Beecher</a>
        <div class="nav-links">
          <a data-nav-link data-page="index.html" href="index.html">Home</a>
          <a data-nav-link data-page="about.html" href="about.html">About</a>
          <a data-nav-link data-page="projects.html" href="projects.html">Projects</a>
          <a data-nav-link data-page="experience.html" href="experience.html">Experience</a>
          <a data-nav-link data-page="skills.html" href="skills.html">Skills</a>
          <a data-nav-link data-page="contact.html" href="contact.html">Contact</a>
        </div>
        <div class="nav-cta">
          <a class="btn btn-outline" href="#">Download Resume</a>
          <a class="btn btn-primary" href="projects.html">View Projects</a>
          <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
            <svg class="icon icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            </svg>
            <svg class="icon icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  `;

  const footerHTML = `
    <footer class="site-footer">
      <div class="container footer-row">
        <div>
          <strong>Blake Beecher</strong>
          <p class="muted">${siteConfig.email}</p>
        </div>
        <div class="footer-actions">
          <a class="btn btn-outline" href="mailto:${siteConfig.email}">Email</a>
          <button class="btn btn-outline" data-copy-email>Copy Email</button>
          <a class="btn btn-outline" href="#">Resume</a>
          <a class="footer-icon" href="#" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 9v9M6 6v.1" />
              <path d="M10 9v9M10 13a3 3 0 0 1 6 0v5" />
              <rect x="3" y="3" width="18" height="18" rx="4" />
            </svg>
          </a>
        </div>
      </div>
      <div class="container">
        <p>© ${new Date().getFullYear()} Blake Beecher</p>
      </div>
    </footer>
  `;

  document.querySelectorAll('[data-include="nav"]').forEach((el) => {
    el.innerHTML = navHTML;
  });

  document.querySelectorAll('[data-include="footer"]').forEach((el) => {
    el.innerHTML = footerHTML;
  });
}

/* ---------- Theme Toggle ---------- */
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }
}

function initTheme() {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  setTheme(theme);

  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
}

/* ---------- Active Nav ---------- */
function initActiveNav() {
  const links = document.querySelectorAll("[data-nav-link]");
  if (!links.length) return;

  const fileName = window.location.pathname.split("/").pop() || "index.html";
  let activePage = fileName;

  if (fileName.startsWith("project-")) {
    activePage = "projects.html";
  }

  links.forEach((link) => {
    if (link.dataset.page === activePage) {
      link.classList.add("active");
    }
  });
}

/* ---------- Smooth Scroll for Same-Page Links ---------- */
function initSmoothScroll() {
  const anchors = document.querySelectorAll("a[href^='#']");
  anchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId.length < 2) return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      event.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* ---------- In-page Anchor Highlighting (Home) ---------- */
function initInPageHighlight() {
  const links = document.querySelectorAll(".link-chip");
  if (!links.length) return;

  const sections = Array.from(links).map((link) => {
    const id = link.getAttribute("href");
    return document.querySelector(id);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.link-chip[href="#${entry.target.id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-40% 0px -40% 0px" }
  );

  sections.forEach((section) => {
    if (section) observer.observe(section);
  });
}

/* ---------- Project Filters ---------- */
function initProjectFilters() {
  const filterGroup = document.querySelector("[data-filter-group]");
  const grid = document.querySelector("[data-project-grid]");
  if (!filterGroup || !grid) return;

  const buttons = filterGroup.querySelectorAll("[data-filter]");
  const cards = grid.querySelectorAll(".project-card");
  const searchInput = document.querySelector("[data-search]");

  let currentFilter = "all";

  const url = new URL(window.location.href);
  const urlFilter = url.searchParams.get("filter");
  if (urlFilter) currentFilter = urlFilter;

  function applyFilter() {
    const term = searchInput ? searchInput.value.toLowerCase().trim() : "";

    cards.forEach((card) => {
      const status = card.dataset.status;
      const title = card.querySelector("h3").textContent.toLowerCase();
      const tags = (card.dataset.tags || "").toLowerCase();

      const matchesFilter = currentFilter === "all" || status === currentFilter;
      const matchesSearch = !term || title.includes(term) || tags.includes(term);

      card.classList.toggle("is-hidden", !(matchesFilter && matchesSearch));
    });

    buttons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === currentFilter);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      if (currentFilter === "all") {
        url.searchParams.delete("filter");
      } else {
        url.searchParams.set("filter", currentFilter);
      }
      history.replaceState(null, "", url.toString());
      applyFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }

  applyFilter();
}

/* ---------- Case Study TOC ---------- */
function initTOC() {
  const toc = document.querySelector("[data-toc]");
  const content = document.querySelector(".case-content");
  if (!toc || !content) return;

  const headings = content.querySelectorAll("h2");
  if (!headings.length) return;

  const list = document.createElement("ul");
  headings.forEach((heading) => {
    if (!heading.id) heading.id = slugify(heading.textContent);

    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    item.appendChild(link);
    list.appendChild(item);
  });

  toc.innerHTML = "<h3>On this page</h3>";
  toc.appendChild(list);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = toc.querySelector(`a[href="#${entry.target.id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          toc.querySelectorAll("a").forEach((a) => a.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );

  headings.forEach((heading) => observer.observe(heading));
}

/* ---------- Copy Email + Toasts ---------- */
function initToasts() {
  if (document.querySelector(".toast-container")) return;
  const container = document.createElement("div");
  container.className = "toast-container";
  container.setAttribute("aria-live", "polite");
  container.setAttribute("aria-atomic", "true");
  document.body.appendChild(container);
}

function showToast(message) {
  const container = document.querySelector(".toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

function initCopyButtons() {
  const buttons = document.querySelectorAll("[data-copy-email]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      copyText(siteConfig.email).then(() => {
        showToast("Email copied to clipboard");
      });
    });
  });
}

/* ---------- Demo Form ---------- */
function initDemoForm() {
  const form = document.querySelector("[data-demo-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      showToast("Please fill out the required fields");
      return;
    }

    const data = new FormData(form);
    const message = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nMessage: ${data.get("message")}`;

    copyText(message).then(() => {
      showToast("Thanks — message copied to clipboard");
      form.reset();
    });
  });
}

/* ---------- Scroll Progress (Project Pages) ---------- */
function initScrollProgress() {
  if (!document.body.classList.contains("project-page")) return;
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  }

  window.addEventListener("scroll", updateProgress);
  updateProgress();
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  injectNavFooter();
  initTheme();
  initActiveNav();
  initSmoothScroll();
  initInPageHighlight();
  initProjectFilters();
  initTOC();
  initToasts();
  initCopyButtons();
  initDemoForm();
  initScrollProgress();
});
