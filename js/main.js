/* Verma Motwani & Co. — shared interactions */
(function () {
  "use strict";

  document.documentElement.classList.remove("js-disabled");

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
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Docket rail (homepage only) ---------- */
  var docketLinks = document.querySelectorAll(".docket-rail a");
  if (docketLinks.length) {
    var sections = [];
    docketLinks.forEach(function (link) {
      var id = link.getAttribute("href").replace("#", "");
      var section = document.getElementById(id);
      if (section) sections.push({ link: link, section: section });
    });

    docketLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href").replace("#", "");
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    if ("IntersectionObserver" in window && sections.length) {
      var railObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var match = sections.find(function (s) { return s.section === entry.target; });
            if (!match) return;
            if (entry.isIntersecting) {
              docketLinks.forEach(function (l) { l.classList.remove("is-active"); });
              match.link.classList.add("is-active");
            }
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      sections.forEach(function (s) { railObserver.observe(s.section); });
    }
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
        confirmMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
})();
