/* eslint-disable no-use-before-define */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("click", (e) => {
      if (!navLinks.classList.contains("is-open")) return;
      const within = e.target.closest(".nav");
      if (!within) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Subtle header shadow on scroll
  if (header) {
    const onScroll = () => {
      const y = window.scrollY || 0;
      header.style.boxShadow = y > 6 ? "0 10px 30px rgba(11,18,32,.06)" : "none";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Scroll reveal (professional, lightweight)
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) {
    const revealTargets = [
      ...$$(".section__head"),
      ...$$(".card"),
      ...$$(".work-card"),
      ...$$(".step"),
      ...$$(".mini-card"),
      ...$$(".contact-card"),
      ...$$(".footer__grid > *"),
    ];
    revealTargets.forEach((el) => {
      if (!el.classList.contains("reveal")) el.classList.add("reveal");
      el.classList.add("reveal--soft");
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "40px 0px -10% 0px" },
    );

    revealTargets.forEach((el) => io.observe(el));
  } else {
    // Ensure content is visible if animations are reduced
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  // Featured Work modal + carousel
  const modal = $("#projectModal");
  const modalContent = $("#modalContent");
  const closeBtns = $$("[data-modal-close]");

  const projects = {
    tooltian: {
      name: "Tooltian",
      category: "E-Commerce + AI",
      subtitle: "Mobile App + Web Platform",
      summary:
        "E-commerce app + website with smart product suggestions, WhatsApp ordering, and location-based delivery. Built to be fast for users and simple for admins.",
      stack: [
        "Python",
        "React",
        "Expo",
        "PostgreSQL",
        "WhatsApp",
        "Maps",
      ],
      slides: [
        { label: "Mobile App", title: "Mobile ordering flow", desc: "Fast product discovery and WhatsApp checkout." },
        { label: "Mobile App", title: "Location mapping", desc: "Map-based delivery and address pinning." },
        { label: "Website", title: "Live-style storefront", desc: "Web experience aligned with the mobile app." },
        { label: "Admin", title: "Ops dashboard", desc: "Order tracking and lightweight analytics." },
      ],
      links: [
        { text: "Explore Project", href: "#lead" },
        { text: "View Live", href: "#", disabled: true },
      ],
    },
    learnhub: {
      name: "LearnHub",
      category: "EdTech + AI",
      subtitle: "Web learning platform",
      summary:
        "Learning platform with live classes, quizzes, and progress tracking. AI helps learners revise faster with study hints and smart summaries.",
      stack: ["React", "Node.js", "PostgreSQL", "AI"],
      slides: [
        { label: "Learner", title: "Live classes & replays", desc: "Schedules, attendance, and on-demand playback." },
        { label: "Assessments", title: "Quizzes & grades", desc: "Auto-grading flows and instructor review." },
        { label: "AI assist", title: "Study hints", desc: "Contextual nudges without replacing your syllabus." },
        { label: "Admin", title: "Cohort analytics", desc: "Completion, engagement, and export-ready reports." },
      ],
      links: [
        { text: "Explore Project", href: "#lead" },
        { text: "View Live", href: "#", disabled: true },
      ],
    },
    shopflow: {
      name: "ShopFlow",
      category: "E-Commerce + AI",
      subtitle: "Web + mobile marketplace",
      summary:
        "Multi-vendor marketplace with vendor dashboards and analytics. AI improves product search and discovery so users find items faster.",
      stack: ["React", "Java", "PostgreSQL", "AI"],
      slides: [
        { label: "Storefront", title: "Discovery that converts", desc: "Faceted search and smart suggestions." },
        { label: "Vendors", title: "Seller dashboards", desc: "Listings, inventory signals, and performance snapshots." },
        { label: "Mobile", title: "Native-grade apps", desc: "Shared stack for Android and iOS releases." },
        { label: "Ops", title: "Orders & analytics", desc: "Fulfillment-friendly admin and exports." },
      ],
      links: [
        { text: "Explore Project", href: "#lead" },
        { text: "View Live", href: "#", disabled: true },
      ],
    },
    coursepilot: {
      name: "CoursePilot",
      category: "Learning + AI",
      subtitle: "Micro-courses & cohorts",
      summary:
        "Cohort learning with modules and assessments. AI generates practice questions from your own material (so students learn from your content, not random web answers).",
      stack: ["React", "Python", "MongoDB", "AI"],
      slides: [
        { label: "Courses", title: "Micro-modules", desc: "Short lessons with clear outcomes per cohort." },
        { label: "AI practice", title: "Questions from your docs", desc: "Grounded Q&A and drills from source files." },
        { label: "Cohorts", title: "Scheduling & nudges", desc: "Deadlines and lightweight reminders." },
        { label: "Insights", title: "Educator view", desc: "Who’s stuck, who’s ahead — at a glance." },
      ],
      links: [
        { text: "Explore Project", href: "#lead" },
        { text: "View Live", href: "#", disabled: true },
      ],
    },
  };

  function renderModal(projectKey) {
    const p = projects[projectKey];
    if (!p) return;

    modalContent.innerHTML = `
      <div class="modal-head">
        <div class="modal-title">
          <span class="badge badge--pill">${escapeHtml(p.category)}</span>
          <h3 class="h2" style="margin:10px 0 6px">${escapeHtml(p.name)}</h3>
          <p class="muted" style="margin:0">${escapeHtml(p.subtitle)}</p>
        </div>
        <div class="modal-actions">
          ${p.links
            .map((l) =>
              l.disabled
                ? `<button class="btn btn--sm btn--ghost" type="button" disabled>${escapeHtml(l.text)}</button>`
                : `<a class="btn btn--sm btn--primary" href="${escapeHtml(l.href)}">${escapeHtml(l.text)}</a>`,
            )
            .join("")}
        </div>
      </div>

      <div class="modal-grid">
        <div class="carousel" data-carousel>
          <div class="carousel__frame" role="region" aria-label="Project preview carousel">
            ${p.slides
              .map(
                (s, idx) => `
              <div class="slide ${idx === 0 ? "is-active" : ""}" data-slide="${idx}">
                <div class="slide__mock">
                  <div>
                    <div class="badge badge--pill" style="display:inline-flex;margin-bottom:10px">${escapeHtml(s.label)}</div>
                    <strong>${escapeHtml(s.title)}</strong>
                    <div class="muted" style="margin-top:6px;font-weight:700">${escapeHtml(s.desc)}</div>
                  </div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          <div class="carousel__controls">
            <button class="btn btn--sm btn--ghost" type="button" data-prev>Prev</button>
            <div class="dots" aria-label="Carousel pagination">
              ${p.slides
                .map(
                  (_, idx) =>
                    `<button class="dotbtn" type="button" data-dot="${idx}" aria-current="${
                      idx === 0 ? "true" : "false"
                    }"><span class="sr-only">Go to slide ${idx + 1}</span></button>`,
                )
                .join("")}
            </div>
            <button class="btn btn--sm btn--ghost" type="button" data-next>Next</button>
          </div>
        </div>

        <div>
          <h3 class="h3">What was delivered</h3>
          <p class="muted" style="font-weight:700">${escapeHtml(p.summary)}</p>

          <h3 class="h3" style="margin-top:14px">Tech stack</h3>
          <div class="stack" style="margin-top:10px">
            ${p.stack.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
          </div>

          <div class="note" style="margin-top:14px">
            Want this level of execution for your product? Use <strong>Start Your Project</strong> and we’ll respond within 24 hours.
          </div>
        </div>
      </div>
    `;

    wireCarousel();
  }

  function openModal(projectKey) {
    if (!modal || !modalContent) return;
    renderModal(projectKey);
    if (typeof modal.showModal === "function") modal.showModal();
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    if (typeof modal.close === "function") modal.close();
    document.body.style.overflow = "";
  }

  closeBtns.forEach((b) => b.addEventListener("click", closeModal));
  if (modal) {
    modal.addEventListener("click", (e) => {
      const inner = e.target.closest(".modal__inner");
      if (!inner) closeModal();
    });
    modal.addEventListener("close", () => {
      document.body.style.overflow = "";
    });
  }

  $$("[data-work-card]").forEach((card) => {
    const key = card.getAttribute("data-project");
    const open = () => openModal(key);
    card.addEventListener("click", (e) => {
      const btn = e.target.closest("button,[data-open-details]");
      if (btn) e.preventDefault();
      open();
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  function wireCarousel() {
    const root = modalContent?.querySelector("[data-carousel]");
    if (!root) return;
    const slides = $$("[data-slide]", root);
    const prev = $("[data-prev]", root);
    const next = $("[data-next]", root);
    const dots = $$("[data-dot]", root);

    let idx = 0;
    let timer = null;

    const setIdx = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      dots.forEach((d, i) => d.setAttribute("aria-current", i === idx ? "true" : "false"));
    };

    const kick = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => setIdx(idx + 1), 4500);
    };

    prev?.addEventListener("click", () => {
      setIdx(idx - 1);
      kick();
    });
    next?.addEventListener("click", () => {
      setIdx(idx + 1);
      kick();
    });
    dots.forEach((d) =>
      d.addEventListener("click", () => {
        const n = Number(d.getAttribute("data-dot") || "0");
        setIdx(n);
        kick();
      }),
    );

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        setIdx(idx - 1);
        kick();
      }
      if (e.key === "ArrowRight") {
        setIdx(idx + 1);
        kick();
      }
    });

    kick();
  }

  // Lead form (frontend) + server submission
  const form = $("#leadForm");
  const submitBtn = $("#submitBtn");
  const toast = $("#formToast");
  const openConsult = $("[data-open-consultation]");

  openConsult?.addEventListener("click", () => {
    const service = $("#service");
    if (service && service instanceof HTMLSelectElement) {
      // pre-select a reasonable option for "consultation"
      if (!service.value) service.value = "Full-Stack Development";
    }
  });

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address.",
    phone: (v) => {
      const s = v.trim();
      if (!s) return "";
      return /^[0-9+\s()-]{7,}$/.test(s) ? "" : "Please enter a valid phone number.";
    },
    service: (v) => (v.trim() ? "" : "Please select a service."),
    message: (v) => (v.trim().length >= 10 ? "" : "Please add a short message (min 10 characters)."),
  };

  function setError(name, msg) {
    const el = document.querySelector(`[data-error-for="${CSS.escape(name)}"]`);
    if (el) el.textContent = msg || "";
  }

  function showToast(kind, text) {
    if (!toast) return;
    toast.hidden = false;
    toast.className = `toast ${kind === "ok" ? "toast--ok" : "toast--bad"}`;
    toast.textContent = text;
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
  }

  /**
   * Netlify-friendly: POST to Google Apps Script Web App (sheet + email).
   * Uses application/x-www-form-urlencoded (required for browser → Apps Script).
   * Set window.NXCODEIFY_SHEETS_URL in index.html to your deployed /exec URL.
   */
  async function postLead(payload) {
    const url = String(window.NXCODEIFY_SHEETS_URL || "").trim();
    const placeholder = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
    if (!url || url === placeholder) {
      throw new Error(
        "Set window.NXCODEIFY_SHEETS_URL in index.html to your Google Apps Script Web App URL (see google-apps-script/Code.gs and README).",
      );
    }

    const body = new URLSearchParams();
    body.set(
      "data",
      JSON.stringify({
        ...payload,
        submittedAt: new Date().toISOString(),
      }),
    );

    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const res = await fetch(url, {
          method: "POST",
          redirect: "follow",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: body.toString(),
        });
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          /* ignore */
        }
        if (!res.ok) {
          throw new Error((json && json.error) || `Request failed (${res.status})`);
        }
        if (json && json.ok === false) {
          throw new Error((json && json.error) || "Submission rejected.");
        }
        if (json && json.ok === true) {
          return { ok: true };
        }
        throw new Error("Unexpected response from Google Apps Script. Check deployment URL.");
      } catch (e) {
        lastErr = e;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 450 * (attempt + 1)));
        }
      }
    }
    throw lastErr || new Error("Failed to submit.");
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (toast) toast.hidden = true;

    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      service: String(fd.get("service") || ""),
      message: String(fd.get("message") || ""),
      source: window.location.href,
    };

    let hasError = false;
    for (const [k, fn] of Object.entries(validators)) {
      const msg = fn(payload[k] ?? "");
      setError(k, msg);
      if (msg) hasError = true;
    }
    if (hasError) {
      showToast("bad", "Please fix the highlighted fields and try again.");
      return;
    }

    setLoading(true);
    try {
      const out = await postLead(payload);
      if (out?.ok) {
        form.reset();
        showToast("ok", "Message sent successfully. We’ll get back to you within 24 hours.");
      } else {
        throw new Error(out?.error || "Submission failed.");
      }
    } catch (err) {
      showToast("bad", `Failed to send. Please retry. ${err?.message ? `(${err.message})` : ""}`);
    } finally {
      setLoading(false);
    }
  });

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();

