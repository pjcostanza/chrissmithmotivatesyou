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

/* -----------------------------------------
   Events Utilities:
   - Timezone auto-detect
   - Google Calendar link
   - ICS (Apple/Outlook) with timezone + optional reminder
   - Copy details
   - Share event
----------------------------------------- */
(() => {
  "use strict";

  // --- Timezone auto-detect (IANA tz name) ---
  // Uses runtime default tz when not specified.
  const getUserTimeZone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago";
    } catch {
      return "America/Chicago";
    }
  };

  // "YYYY-MM-DDTHH:MM" -> "YYYYMMDDTHHMM00"
  const toBasicDateTime = (dt) => {
    const s = String(dt || "").trim();
    if (!s.includes("T")) return "";
    const [d, t] = s.split("T");
    const [Y, M, D] = d.split("-");
    const [hh, mm] = t.split(":");
    return `${Y}${M}${D}T${hh}${mm}00`;
  };

  const esc = (s) => encodeURIComponent(String(s || ""));

  // Give each card a stable #hash link for share/copy-link
  const ensureCardId = (card) => {
    if (card.id) return card.id;
    const title = (card.getAttribute("data-title") || "event").toLowerCase();
    const start = (card.getAttribute("data-start") || "").replace(/[:]/g, "");
    const slug = (start + "-" + title)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80);
    card.id = slug || ("event-" + Date.now());
    return card.id;
  };

  const buildShareUrl = (card) => {
    const id = ensureCardId(card);
    return `${location.origin}${location.pathname}#${id}`;
  };

  // --- Google Calendar URL ---
  // Uses ctz param + local (no Z) times
  const buildGoogleUrl = (card) => {
    const tz = getUserTimeZone();
    const title = esc(card.getAttribute("data-title") || "Event");
    const start = toBasicDateTime(card.getAttribute("data-start"));
    const end = toBasicDateTime(card.getAttribute("data-end"));
    const locationText = esc(card.getAttribute("data-location") || "");
    const detailsText = esc(card.getAttribute("data-description") || "");

    return (
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + title +
      "&dates=" + start + "/" + end +
      "&details=" + detailsText +
      "&location=" + locationText +
      "&ctz=" + esc(tz)
    );
  };

  // --- ICS (Apple/Outlook) ---
  // Improvement: include X-WR-TIMEZONE and TZID on DTSTART/DTEND + VALARM default.
  const escapeIcs = (s) =>
    String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  const pad = (n) => (n < 10 ? "0" : "") + n;

  const downloadFile = (filename, text) => {
    const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const buildIcs = (card) => {
    const tz = getUserTimeZone();
    const title = card.getAttribute("data-title") || "Live Event";
    const start = toBasicDateTime(card.getAttribute("data-start"));
    const end = toBasicDateTime(card.getAttribute("data-end"));
    const locationText = card.getAttribute("data-location") || "";
    const detailsText = card.getAttribute("data-description") || "";

    const url = buildShareUrl(card);

    // Optional per-event reminder in minutes:
    // Add data-reminder="30" on a card to override
    const reminderMin = parseInt(card.getAttribute("data-reminder") || "30", 10);
    const trigger = Number.isFinite(reminderMin) ? `-PT${reminderMin}M` : "-PT30M";

    const now = new Date();
    const dtstamp =
      now.getUTCFullYear() +
      pad(now.getUTCMonth() + 1) +
      pad(now.getUTCDate()) + "T" +
      pad(now.getUTCHours()) +
      pad(now.getUTCMinutes()) +
      pad(now.getUTCSeconds()) + "Z";

    const uid = `event-${Date.now()}@chrissmithmotivatesyou.com`;

    // CRLF is ideal for ICS; most clients accept \n, but we’ll emit \r\n.
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Chris Smith Motivates You//Events//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-TIMEZONE:${tz}`,
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DTSTART;TZID=${tz}:${start}`,
      `DTEND;TZID=${tz}:${end}`,
      `LOCATION:${escapeIcs(locationText)}`,
      `DESCRIPTION:${escapeIcs(detailsText)}\\n\\n${escapeIcs(url)}`,
      `URL:${escapeIcs(url)}`,
      "BEGIN:VALARM",
      `TRIGGER:${trigger}`,
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcs(title)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ];

    return lines.join("\r\n");
  };

  // --- Copy details (Clipboard API) ---
  const copyText = async (text) => {
    // Clipboard API requires secure context in many browsers. [4](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback: old execCommand method (works in more places)
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      document.body.removeChild(ta);
      return false;
    }
  };

  const formatEventDetails = (card) => {
    const title = card.getAttribute("data-title") || "Live Event";
    const start = card.getAttribute("data-start") || "";
    const end = card.getAttribute("data-end") || "";
    const locationText = card.getAttribute("data-location") || "";
    const detailsText = card.getAttribute("data-description") || "";
    const tz = getUserTimeZone();
    const url = buildShareUrl(card);

    return [
      title,
      `When: ${start} to ${end} (${tz})`,
      locationText ? `Where: ${locationText}` : "",
      detailsText ? `Details: ${detailsText}` : "",
      `Link: ${url}`
    ].filter(Boolean).join("\n");
  };

  // --- Share event (Web Share API) ---
  // navigator.share is secure-context only. [5](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)[6](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Share_data_between_apps)
  const shareEvent = async (card) => {
    const title = card.getAttribute("data-title") || "Live Event";
    const url = buildShareUrl(card);
    const text = formatEventDetails(card);

    if (navigator.share && window.isSecureContext) {
      await navigator.share({ title, text, url });
      return true;
    }

    // Fallback: copy link (or full details)
    const ok = await copyText(url);
    if (ok) alert("Link copied to clipboard.");
    else alert("Couldn't share automatically. Copy this link:\n" + url);
    return ok;
  };

  // --- Event delegation for all buttons/links ---
  document.addEventListener("click", async (e) => {
    const google = e.target.closest("[data-add-google]");
    const ics = e.target.closest("[data-add-ics]");
    const copyBtn = e.target.closest("[data-copy-details]");
    const shareBtn = e.target.closest("[data-share-event]");

    if (!google && !ics && !copyBtn && !shareBtn) return;

    const card = e.target.closest(".event-card");
    if (!card) return;

    // Stop default "#" navigation
    e.preventDefault();

    try {
      if (google) {
        const url = buildGoogleUrl(card);
        window.open(url, "_blank", "noopener");
      } else if (ics) {
        const title = card.getAttribute("data-title") || "event";
        const safe = title.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase();
        downloadFile((safe || "event") + ".ics", buildIcs(card));
      } else if (copyBtn) {
        const ok = await copyText(formatEventDetails(card));
        if (ok) alert("Event details copied.");
        else alert("Copy failed. Try selecting the text manually.");
      } else if (shareBtn) {
        await shareEvent(card);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  });
})();

/* -----------------------------------------
   Map / Venue links (Google Maps)
----------------------------------------- */
(() => {
  "use strict";

  const buildMapUrl = (card) => {
    const location = card.getAttribute("data-location") || "";

    if (!location) return "";

    // Encode for URL (spaces → +, commas handled)
    const query = encodeURIComponent(location);

    return "https://www.google.com/maps/search/?api=1&query=" + query;
  };

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-map-link]");
    if (!link) return;

    const card = link.closest(".event-card");
    if (!card) return;

    e.preventDefault();

    const url = buildMapUrl(card);

    if (url) {
      window.open(url, "_blank", "noopener");
    } else {
      alert("Location not available.");
    }
  });
})();