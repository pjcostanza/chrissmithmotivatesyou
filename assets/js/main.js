/* ==========================================================================
   Premium Bootstrap Starter (Dreamweaver-friendly)
   File: assets/js/main.js
   Purpose: Lightbox modal swapping + footer year + small UX helpers
   ========================================================================== */

(() => {
  "use strict";

  /* -----------------------------------------
     1) Auto-set the footer year
     ----------------------------------------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -----------------------------------------
     2) Simple Lightbox/Modal for gallery
     - Click any element with [data-lightbox]
     - It will open #lightboxModal and swap image + caption
     ----------------------------------------- */
  const modalEl = document.getElementById("lightboxModal");
  const modalImg = document.getElementById("lightboxImage");
  const modalCaption = document.getElementById("lightboxCaption");

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;

    const imgSrc = trigger.getAttribute("data-img") || "";
    const caption = trigger.getAttribute("data-caption") || "";

    if (modalImg) modalImg.src = imgSrc;
    if (modalCaption) modalCaption.textContent = caption;

    // Bootstrap modal show (requires bootstrap.bundle.js via CDN)
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  });

  /* -----------------------------------------
     3) Optional: Smooth scroll for in-page anchors
     ----------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (ev) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

})();