/* ==========================================================================
   Chris Smith Motivates You
   File: assets/js/main.js
   Purpose: Footer year + lightbox + smooth scroll + events filters + add-to-calendar
   ========================================================================== */

(() => {
  "use strict";

  /* -----------------------------------------
     1) Auto-set the footer year
  ----------------------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* -----------------------------------------
     2) Lightbox/Modal for gallery (Images + Video)
     - Images: [data-lightbox] data-img="..." data-caption="..."
     - Videos: [data-lightbox] data-type="video" data-src="...embed..."
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

    const imgSrc = trigger.getAttribute("data-img") || "";
    const videoSrc = trigger.getAttribute("data-src") || "";

    if (modalCaption) modalCaption.textContent = caption;

    if (type === "video") {
      if (modalImg) {
        modalImg.src = "";
        modalImg.classList.add("d-none");
      }
      if (videoWrap) videoWrap.classList.remove("d-none");
      if (videoFrame) videoFrame.src = videoSrc;
    } else {
      if (videoFrame) videoFrame.src = "";
      if (videoWrap) videoWrap.classList.add("d-none");
      if (modalImg) {
        modalImg.classList.remove("d-none");
        modalImg.src = imgSrc;
      }
    }

    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  });

  if (modalEl) {
    modalEl.addEventListener("hidden.bs.modal", () => {
      if (videoFrame) videoFrame.src = "";
    });
  }

  /* -----------------------------------------
     3) Smooth scroll for in-page anchors
  ----------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (ev) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      ev.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* -----------------------------------------
     4) Events page filter (Acoustic / Full Band)
     Buttons: [data-filter="all|acoustic|fullband"]
     Cards: .event-card with data-type="acoustic|fullband"
  ----------------------------------------- */
  const filterButtons = document.querySelectorAll("[data-filter]");
  const eventCards = document.querySelectorAll(".event-card");

  if (filterButtons.length && eventCards.length) {
    const setActive = (btn) => {
      filterButtons.forEach((b) => {
        b.classList.remove("btn-dark");
        b.classList.add("btn-outline-dark");
      });
      btn.classList.add("btn-dark");
      btn.classList.remove("btn-outline-dark");
    };

    const applyFilter = (type) => {
      eventCards.forEach((card) => {
        const t = (card.getAttribute("data-type") || "").toLowerCase().trim();
        const show = type === "all" || t === type;
        card.classList.toggle("is-hidden", !show);
      });
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = (btn.getAttribute("data-filter") || "all")
          .toLowerCase()
          .trim();
        setActive(btn);
        applyFilter(type);
      });
    });

    setActive(filterButtons[0]);
    applyFilter("all");
  }

  /* -----------------------------------------
     5) Add to Google Calendar (dropdown item)
     Link: [data-add-google] (href can be "#")
     Reads data-* from closest .event-card:
       data-title, data-start, data-end, data-location, data-description
  ----------------------------------------- */
  function toGoogleDates(dt) {
    // "YYYY-MM-DDTHH:MM" -> "YYYYMMDDTHHMM00"
    const s = String(dt || "").trim();
    if (!s.includes("T")) return "";
    const [d, t] = s.split("T");
    const [Y, M, D] = d.split("-");
    const [hh, mm] = t.split(":");
    return `${Y}${M}${D}T${hh}${mm}00`;
  }

  function buildGoogleUrl(card) {
    const title = encodeURIComponent(card.getAttribute("data-title") || "Event");
    const start = toGoogleDates(card.getAttribute("data-start"));
    const end = toGoogleDates(card.getAttribute("data-end"));
    const location = encodeURIComponent(card.getAttribute("data-location") || "");
    const details = encodeURIComponent(card.getAttribute("data-description") || "");

    // NOTE: use "&" in JS strings (NOT "&amp;")
    return (
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + title +
      "&dates=" + start + "/" + end +
      "&details=" + details +
      "&location=" + location +
      "&ctz=America/Chicago"
    );
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-add-google]");
    if (!link) return;

    e.preventDefault();

    const card = link.closest(".event-card");
    if (!card) return;

    const url = buildGoogleUrl(card);
    window.open(url, "_blank", "noopener");
  });

  /* -----------------------------------------
     6) Download ICS (Apple/Outlook)
     Button: [data-add-ics]
  ----------------------------------------- */
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function toIcsDate(dt) {
    const s = String(dt || "").trim();
    if (!s.includes("T")) return "";
    const [d, t] = s.split("T");
    const [Y, M, D] = d.split("-");
    const [hh, mm] = t.split(":");
    return `${Y}${M}${D}T${hh}${mm}00`;
  }

  function escapeIcs(s) {
    return String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function downloadFile(filename, text) {
    const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-ics]");
    if (!btn) return;

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

    const now = new Date();
    const dtstamp =
      now.getUTCFullYear() +
      pad(now.getUTCMonth() + 1) +
      pad(now.getUTCDate()) + "T" +
      pad(now.getUTCHours()) +
      pad(now.getUTCMinutes()) +
      pad(now.getUTCSeconds()) + "Z";

    const uid = `event-${Date.now()}@chrissmithmotivatesyou.com`;

    const ics =
      "BEGIN:VCALENDAR\n" +
      "VERSION:2.0\n" +
      "PRODID:-//Chris Smith Motivates You//Events//EN\n" +
      "CALSCALE:GREGORIAN\n" +
      "METHOD:PUBLISH\n" +
      "BEGIN:VEVENT\n" +
      `UID:${uid}\n` +
      `DTSTAMP:${dtstamp}\n` +
      `SUMMARY:${escapeIcs(title)}\n` +
      `DTSTART:${toIcsDate(start)}\n` +
      `DTEND:${toIcsDate(end)}\n` +
      `LOCATION:${escapeIcs(location)}\n` +
      `DESCRIPTION:${escapeIcs(description)}\n` +
      "END:VEVENT\n" +
      "END:VCALENDAR\n";

    const safe = title.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase();
    downloadFile((safe || "event") + ".ics", ics);
  });
})();