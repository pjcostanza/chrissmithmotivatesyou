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
   2) Lightbox/Modal for gallery (Images + Video)
   - Images: data-img="assets/img/..."
   - Videos: data-type="video" data-src="https://...embed..."
----------------------------------------- */
const modalEl = document.getElementById("lightboxModal");
const modalImg = document.getElementById("lightboxImage");
const modalCaption = document.getElementById("lightboxCaption");

const videoWrap = document.getElementById("lightboxVideoWrap");
const videoFrame = document.getElementById("lightboxVideo");

document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-lightbox]");
  if (!trigger) return;

  const type = trigger.getAttribute("data-type") || "image";
  const caption = trigger.getAttribute("data-caption") || "";

  // Backwards-compatible with your existing image tiles
  const imgSrc = trigger.getAttribute("data-img") || "";

  // For video tiles
  const videoSrc = trigger.getAttribute("data-src") || "";

  if (modalCaption) modalCaption.textContent = caption;

  if (type === "video") {
    // Show video, hide image
    if (modalImg) {
      modalImg.src = "";
      modalImg.classList.add("d-none");
    }
    if (videoWrap) videoWrap.classList.remove("d-none");
    if (videoFrame) videoFrame.src = videoSrc;
  } else {
    // Show image, hide video
    if (videoFrame) videoFrame.src = "";
    if (videoWrap) videoWrap.classList.add("d-none");

    if (modalImg) {
      modalImg.classList.remove("d-none");
      modalImg.src = imgSrc;
    }
  }

  // Show the Bootstrap modal
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
});

// Stop video playback when modal closes (important!)
if (modalEl) {
  modalEl.addEventListener("hidden.bs.modal", () => {
    if (videoFrame) videoFrame.src = "";
  });
}

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