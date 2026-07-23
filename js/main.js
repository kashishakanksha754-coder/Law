/* Verma Motwani & Co. — shared interactions (v2) */
(function () {
  "use strict";

  document.documentElement.classList.remove("js-disabled");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.querySelector(".scroll-progress");
  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
  if (progressBar) {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  /* ---------- Header solid-on-scroll ---------- */
  var header = document.querySelector(".site-header");
  function toggleHeader() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("is-solid");
    else header.classList.remove("is-solid");
  }
  toggleHeader();
  window.addEventListener("scroll", toggleHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  function closeNav() {
    document.documentElement.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = document.documentElement.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    var mobileCloseBtn = mobileNav.querySelector(".mobile-close-btn");
    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener("click", closeNav);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Disclaimer overlay (homepage only) ---------- */
  var overlay = document.querySelector(".disclaimer-overlay");
  if (overlay) {
    var STORAGE_KEY = "vmco-disclaimer-accepted";
    var accepted = false;
    try { accepted = sessionStorage.getItem(STORAGE_KEY) === "true"; } catch (err) { accepted = false; }

    if (!accepted) {
      overlay.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
    }

    var acceptBtn = document.querySelector(".disclaimer-accept");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        overlay.setAttribute("hidden", "");
        document.body.style.overflow = "";
        try { sessionStorage.setItem(STORAGE_KEY, "true"); } catch (err) { /* ignore */ }
      });
    }
  }

  /* ---------- Hero cursor-follow glow ---------- */
  var heroMedia = document.querySelector(".hero-media");
  if (heroMedia && !prefersReducedMotion) {
    heroMedia.addEventListener("pointermove", function (e) {
      var rect = heroMedia.getBoundingClientRect();
      var mx = ((e.clientX - rect.left) / rect.width) * 100;
      var my = ((e.clientY - rect.top) / rect.height) * 100;
      heroMedia.style.setProperty("--mx", mx + "%");
      heroMedia.style.setProperty("--my", my + "%");
    });
  }

  /* ---------- Hero background video: respect reduced motion, fall back to poster ---------- */
  var heroVideo = document.querySelector(".hero-media-video");
  if (heroVideo) {
    if (prefersReducedMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute("autoplay");
      heroVideo.style.display = "none";
    } else {
      heroVideo.addEventListener("error", function () {
        heroVideo.style.display = "none";
      }, true);
    }
  }

  /* ---------- Testimonial video: play/pause on scroll, respect reduced motion ---------- */
  var testimonialVideo = document.querySelector(".testimonial-video");
  if (testimonialVideo) {
    if (prefersReducedMotion) {
      testimonialVideo.removeAttribute("autoplay");
    } else {
      testimonialVideo.addEventListener("error", function () {
        testimonialVideo.style.display = "none";
      }, true);
      if ("IntersectionObserver" in window) {
        var testimonialObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                testimonialVideo.play().catch(function () {});
              } else {
                testimonialVideo.pause();
              }
            });
          },
          { threshold: 0.4 }
        );
        testimonialObserver.observe(testimonialVideo);
      }
    }
  }

  /* ---------- Count-up stats ---------- */
  var countEls = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1600;
    var startTime = null;

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (countEls.length) {
    if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      countEls.forEach(function (el) { countObserver.observe(el); });
    } else {
      countEls.forEach(function (el) {
        el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      });
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (!prefersReducedMotion) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var offsetX = e.clientX - (rect.left + rect.width / 2);
        var offsetY = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = "translate(" + (offsetX * 0.12) + "px, " + (offsetY * 0.12) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Scroll-reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Contact form fake-submit ---------- */
  var contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    var confirmMsg = document.querySelector(".confirm-msg");
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      contactForm.reset();
      if (confirmMsg) {
        confirmMsg.classList.add("is-visible");
        confirmMsg.setAttribute("tabindex", "-1");
        confirmMsg.focus();
        confirmMsg.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
      }
    });
  }
})();
