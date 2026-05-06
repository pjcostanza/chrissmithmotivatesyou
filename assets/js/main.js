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

/* -----------------------------------------
   Quotes carousel enhancements:
   - Lock height to tallest slide (prevents bounce)
   - Pause on hover (desktop)
   - Pause on touch/hold + swipe-friendly (mobile)
   - ARIA live announcements on slide change
----------------------------------------- */
(() => {
  const carouselEl = document.getElementById("quoteCarousel");
  if (!carouselEl || !window.bootstrap) return;

  const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
  const inner = carouselEl.querySelector(".carousel-inner");
  const items = Array.from(carouselEl.querySelectorAll(".carousel-item"));
  const live = document.getElementById("quoteLive");

  // 1) Measure tallest slide and lock container height
  const lockCarouselHeight = () => {
    if (!inner || items.length === 0) return;

    // Store current active index
    const activeIndex = items.findIndex(i => i.classList.contains("active"));

    let maxH = 0;

    // Temporarily measure each slide off-layout (no bounce)
    items.forEach((item) => {
      const prevDisplay = item.style.display;
      const prevPos = item.style.position;
      const prevVis = item.style.visibility;
      const prevTrans = item.style.transform;

      item.style.display = "block";
      item.style.position = "absolute";
      item.style.visibility = "hidden";
      item.style.transform = "none";

      // measure the slide content height
      maxH = Math.max(maxH, item.scrollHeight);

      // restore styles
      item.style.display = prevDisplay;
      item.style.position = prevPos;
      item.style.visibility = prevVis;
      item.style.transform = prevTrans;
    });

    // Apply as CSS variable + min-height
    inner.style.setProperty("--quote-max-h", `${maxH}px`);
    inner.style.minHeight = `${maxH}px`;

    // Ensure carousel still knows which is active (safety)
    items.forEach((i, idx) => i.classList.toggle("active", idx === activeIndex));
  };

  // Run once after fonts/layout settle, and again on resize
  const debounce = (fn, ms = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  window.addEventListener("load", lockCarouselHeight);
  window.addEventListener("resize", debounce(lockCarouselHeight, 200));
  lockCarouselHeight();

  // 2) Pause on hover (desktop) — Bootstrap handles via data-bs-pause="hover"
  // but we’ll also pause on keyboard focus for accessibility
  carouselEl.addEventListener("focusin", () => carousel.pause());
  carouselEl.addEventListener("focusout", () => carousel.cycle());

  // 3) Pause on touch/hold; allow swipe without fighting autoplay
  let touchTimer = null;
  let touched = false;

  carouselEl.addEventListener("touchstart", () => {
    touched = true;
    // Pause immediately on touch
    carousel.pause();
    // If user is just tapping/holding, keep paused briefly
    touchTimer = setTimeout(() => {
      // remain paused while finger is down
    }, 50);
  }, { passive: true });

  carouselEl.addEventListener("touchend", () => {
    if (touchTimer) clearTimeout(touchTimer);
    // Resume after a short delay so taps/swipes don't instantly advance
    setTimeout(() => {
      if (touched) carousel.cycle();
      touched = false;
    }, 600);
  });

  carouselEl.addEventListener("touchcancel", () => {
    if (touchTimer) clearTimeout(touchTimer);
    touched = false;
    carousel.cycle();
  });

  // 4) ARIA live announcements on slide change (polite, atomic)
  const announceActiveQuote = () => {
    if (!live) return;
    const active = carouselEl.querySelector(".carousel-item.active");
    if (!active) return;

    const quoteText = active.querySelector("blockquote p")?.innerText?.trim() || "Quote";
    const author = active.querySelector("blockquote footer")?.innerText?.trim() || "";

    // Shorten announcement to avoid overly long SR output
    const short = quoteText.length > 220 ? quoteText.slice(0, 220).trim() + "…" : quoteText;

    live.textContent = author ? `${short} ${author}` : short;
  };

  carouselEl.addEventListener("slid.bs.carousel", () => {
    announceActiveQuote();
  });

  // announce first slide on load
  announceActiveQuote();
})();

/* -----------------------------------------
   Reviews carousel enhancements:
   - Lock height to tallest slide (prevents bounce)
   - Pause on hover (desktop) + focus (keyboard)
   - Pause on touch/hold (mobile) but keep swipe
   - ARIA live announcements on slide change
----------------------------------------- */
(() => {
  const carouselEl = document.getElementById("reviewCarousel");
  if (!carouselEl || !window.bootstrap) return;

  const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
  const inner = carouselEl.querySelector(".carousel-inner");
  const items = Array.from(carouselEl.querySelectorAll(".carousel-item"));
  const live = document.getElementById("reviewLive");

  const lockCarouselHeight = () => {
    if (!inner || items.length === 0) return;

    // remember active index
    const activeIndex = items.findIndex(i => i.classList.contains("active"));

    let maxH = 0;

    // measure each slide without affecting layout
    items.forEach(item => {
      const prevDisplay = item.style.display;
      const prevPos = item.style.position;
      const prevVis = item.style.visibility;
      const prevTrans = item.style.transform;

      item.style.display = "block";
      item.style.position = "absolute";
      item.style.visibility = "hidden";
      item.style.transform = "none";

      maxH = Math.max(maxH, item.scrollHeight);

      item.style.display = prevDisplay;
      item.style.position = prevPos;
      item.style.visibility = prevVis;
      item.style.transform = prevTrans;
    });

    inner.style.setProperty("--review-max-h", `${maxH}px`);
    inner.style.minHeight = `${maxH}px`;

    // restore active state (safety)
    items.forEach((i, idx) => i.classList.toggle("active", idx === activeIndex));
  };

  const debounce = (fn, ms = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  window.addEventListener("load", lockCarouselHeight);
  window.addEventListener("resize", debounce(lockCarouselHeight, 200));
  lockCarouselHeight();

  // Pause on keyboard focus for accessibility (in addition to hover)
  carouselEl.addEventListener("focusin", () => carousel.pause());
  carouselEl.addEventListener("focusout", () => carousel.cycle());

  // Pause on touch/hold (mobile) but keep swipe
  let touchTimer = null;
  let touched = false;

  carouselEl.addEventListener("touchstart", () => {
    touched = true;
    carousel.pause();
    touchTimer = setTimeout(() => {}, 50);
  }, { passive: true });

  carouselEl.addEventListener("touchend", () => {
    if (touchTimer) clearTimeout(touchTimer);
    setTimeout(() => {
      if (touched) carousel.cycle();
      touched = false;
    }, 600);
  });

  carouselEl.addEventListener("touchcancel", () => {
    if (touchTimer) clearTimeout(touchTimer);
    touched = false;
    carousel.cycle();
  });

  // ARIA live announcements (polite, atomic)
  const announceActiveReview = () => {
    if (!live) return;
    const active = carouselEl.querySelector(".carousel-item.active");
    if (!active) return;

    const stars = active.querySelector(".review-stars")?.getAttribute("aria-label") || "";
    const text = active.querySelector("p")?.innerText?.trim() || "Review";
    const who = active.querySelector(".small.text-muted")?.innerText?.trim() || "";

    const short = text.length > 220 ? text.slice(0, 220).trim() + "…" : text;

    live.textContent = [stars, short, who].filter(Boolean).join(" ");
  };

  carouselEl.addEventListener("slid.bs.carousel", announceActiveReview);
  announceActiveReview();
})();
/* -----------------------------------------
   4) Events page: Acoustic / Full Band filter
   - Looks for buttons with [data-filter]
   - Shows/hides cards with .event-card + data-type
----------------------------------------- */
(() => {
  "use strict";

  // Only run on pages that actually have filters
  const filterButtons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll(".event-card");
  if (!filterButtons.length || !cards.length) return;

  const setActive = (btn) => {
    filterButtons.forEach(b => {
      b.classList.remove("btn-dark");
      b.classList.add("btn-outline-dark");
    });
    btn.classList.add("btn-dark");
    btn.classList.remove("btn-outline-dark");
  };

  const applyFilter = (type) => {
    cards.forEach(card => {
      const t = (card.getAttribute("data-type") || "").toLowerCase().trim();
      const show = (type === "all") || (t === type);
      card.classList.toggle("is-hidden", !show);
    });
  };

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = (btn.getAttribute("data-filter") || "all").toLowerCase().trim();
      setActive(btn);
      applyFilter(type);
    });
  });

  // Default state: All Shows
  setActive(filterButtons[0]);
  applyFilter("all");
})();
/* -----------------------------------------
   Add to Calendar (.ics) for event cards
   Buttons: [data-add-ics]
   Cards: .event-card with data-title/data-start/data-end/data-location/data-description
----------------------------------------- */
(() => {
  "use strict";

  const buttons = document.querySelectorAll("[data-add-ics]");
  if (!buttons.length) return;

  const pad = (n) => (n < 10 ? "0" : "") + n;

  // "YYYY-MM-DDTHH:MM" -> "YYYYMMDDTHHMM00"
  // This creates a "floating" local-time ICS entry (works fine for most users).
  const toIcsDate = (dt) => {
    const parts = String(dt || "").split("T");
    if (parts.length < 2) return "";
    const d = parts[0].split("-");
    const t = parts[1].split(":");
    return `${d[0]}${d[1]}${d[2]}T${t[0]}${t[1]}00`;
  };

  const escapeText = (s) =>
    String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  const download = (filename, text) => {
    const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".event-card");
      if (!card) return;

      const title = card.getAttribute("data-title") || "Live Event";
      const start = card.getAttribute("data-start") || "";
      const end = card.getAttribute("data-end") || "";
      const location = card.getAttribute("data-location") || "";
      const description = card.getAttribute("data-description") || "";

      if (!start || !end) {
        alert("Missing data-start or data-end on this event.");
        return;
      }

      const dtstamp = new Date();
      const dtstampStr =
        dtstamp.getUTCFullYear() +
        pad(dtstamp.getUTCMonth() + 1) +
        pad(dtstamp.getUTCDate()) +
        "T" +
        pad(dtstamp.getUTCHours()) +
        pad(dtstamp.getUTCMinutes()) +
        pad(dtstamp.getUTCSeconds()) +
        "Z";

      const uid = `new-${Date.now()}@chrissmithmotivatesyou.com`;

      const ics =
        "BEGIN:VCALENDAR\n" +
        "VERSION:2.0\n" +
        "PRODID:-//Chris Smith Motivates You//Events//EN\n" +
        "CALSCALE:GREGORIAN\n" +
        "METHOD:PUBLISH\n" +
        "BEGIN:VEVENT\n" +
        `UID:${uid}\n` +
        `DTSTAMP:${dtstampStr}\n` +
        `SUMMARY:${escapeText(title)}\n` +
        `DTSTART:${toIcsDate(start)}\n` +
        `DTEND:${toIcsDate(end)}\n` +
        `LOCATION:${escapeText(location)}\n` +
        `DESCRIPTION:${escapeText(description)}\n` +
        "END:VEVENT\n" +
        "END:VCALENDAR\n";

      const safeName = title
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/(^-|-$)/g, "")
        .toLowerCase();

      download((safeName || "event") + ".ics", ics);
    });
  });
})();
<script>
(function(){
  function toGoogleDates(dt){
    const parts = String(dt).split("T");
    const d = parts[0].split("-");
    const t = parts[1].split(":");
    return d[0] + d[1] + d[2] + "T" + t[0] + t[1] + "00";
  }

  function buildUrl(card){
    const title = encodeURIComponent(card.getAttribute("data-title") || "Event");
    const start = toGoogleDates(card.getAttribute("data-start"));
    const end = toGoogleDates(card.getAttribute("data-end"));
    const location = encodeURIComponent(card.getAttribute("data-location") || "");
    const details = encodeURIComponent(card.getAttribute("data-description") || "");

    return "https://calendar.google.com/calendar/render?action=TEMPLATE"
      + "&text=" + title
      + "&dates=" + start + "/" + end
      + "&details=" + details
      + "&location=" + location
      + "&ctz=America/Chicago";
  }

  document.addEventListener("click", function(e){
    const link = e.target.closest("[data-add-google]");
    if(!link) return;

    e.preventDefault();

    const card = link.closest(".event-card");
    if(!card) return;

    const url = buildUrl(card);
    window.open(url, "_blank");
  });
})();
</script>