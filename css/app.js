/* Wedding invitation: no dependencies. Content lives in data/content.js */
(() => {
  "use strict";
  const W = window.WEDDING, T = W.texts;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);

  /* ---------- Helpers ---------- */
  // Safe DOM builder: text always goes through textContent (no HTML injection)
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    kids.flat().forEach(c => c != null && c !== false && el.append(c));
    return el;
  }
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 1800); };
  const rule = () => h("hr", { class: "rule rv" });
  const head = (eyebrow, whisper, title) => [
    h("p", { class: "eyebrow rv", text: eyebrow }),
    whisper && h("p", { class: "script rv", text: whisper }),
    title && h("h2", { class: "rv", text: title })
  ];
  const quote = q => q && q.text ? h("blockquote", { class: "quote rv" }, q.text, h("cite", { text: q.by })) : null;
  const section = (id, cls, ...kids) => h("section", { id, class: "sec " + (cls || ""), "aria-labelledby": id + "-t" }, h("div", { class: "wrap" }, kids));

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = h("textarea", { class: "hp" }); t.value = text; document.body.append(t); t.select(); document.execCommand("copy"); t.remove(); }
    toast("Copied");
  }

  /* ---------- Personalization: ?to=Dr.%20Rina ---------- */
  function getGuestName() {
    const raw = new URLSearchParams(location.search).get("to") || "";
    return raw.replace(/[\u0000-\u001f\u007f<>"'`\\{}]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
  }
  const guest = getGuestName();

  /* ---------- Components ---------- */
  function Hero() {
    const joglo = `<svg class="joglo" viewBox="0 0 200 130" aria-hidden="true">
      <path pathLength="1" d="M92 12h16l6 40 62 36H22l62-36z"/>
      <path pathLength="1" d="M10 96q90-22 180 0"/>
      <path pathLength="1" d="M34 96v22M70 96v22M130 96v22M166 96v22M24 118h152"/></svg>`;
    const s = section("hero", "hero");
    s.prepend(h("div", { class: "bg", "data-parallax": "", "aria-hidden": "true" }));
    const wrap = $(".wrap", s);
    wrap.insertAdjacentHTML("beforeend", joglo);
    wrap.append(
      h("p", { class: "eyebrow rv", text: T.invite }),
      h("h1", { id: "hero-t", class: "rv" }, W.couple.a, h("span", { class: "amp", text: "&" }), W.couple.b),
      h("p", { class: "script rv", text: T.heroWhisper }),
      h("p", { class: "meta date rv", text: W.dateLabel }),
      quote(W.quotes.hero));
    return s;
  }

  function Countdown() {
    const s = section("countdown", "dark", ...head(T.countdownTitle, "", ""));
    const box = h("div", { class: "count rv", role: "timer", "aria-label": "Time remaining" });
    const cells = ["Days", "Hours", "Min", "Sec"].map(l => { const b = h("b", { text: "0" }); box.append(h("div", {}, b, h("span", { text: l }))); return b; });
    $(".wrap", s).append(box);
    $(".eyebrow", s).id = "countdown-t";
    const target = new Date(W.date).getTime();
    const tick = () => {
      let d = Math.max(0, target - Date.now()) / 1000;
      [86400, 3600, 60, 1].forEach((u, i) => { cells[i].textContent = String(Math.floor(d / u)).padStart(2, "0"); d %= u; });
    };
    if (isNaN(target)) $(".wrap", s).append(h("p", { class: "cap", text: "[Set a valid date in content.js]" }));
    else { tick(); setInterval(tick, 1000); }
    return s;
  }

  function Story() {
    const tl = h("div", { class: "tl" }, W.story.map(c => h("article", { class: "rv" },
      h("p", { class: "meta", text: c.date }), h("h3", { text: c.title }), h("p", { text: c.text }),
      c.photo ? h("div", { class: "arch" }, h("img", { src: c.photo, alt: c.title, loading: "lazy", decoding: "async" })) : null)));
    const s = section("story", "", ...head("", "", T.storyTitle), tl, quote(W.quotes.story));
    $("h2", s).id = "story-t"; return s;
  }

  function Events() {
    const cards = W.events.map(e => h("div", { class: "card ev rv" },
      h("h3", { text: e.name }), h("p", { class: "meta", text: e.date }), h("p", { class: "meta", text: e.time }),
      h("p", { text: e.venue }), h("p", { class: "cap", text: e.address }),
      e.mapUrl ? h("a", { class: "btn ghost", href: e.mapUrl, target: "_blank", rel: "noopener", text: "View on map" }) : null));
    const s = section("events", "dark", ...head("", "", T.eventsTitle), cards,
      W.dressCode ? [rule(), h("p", { class: "eyebrow", text: "Dress code" }), h("p", { class: "rv", text: W.dressCode })] : null);
    $("h2", s).id = "events-t"; return s;
  }

  function Gallery() {
    const items = W.gallery;
    const grid = h("div", { class: "grid rv" }, items.map((p, i) => h("button", { type: "button", "aria-label": "Open photo: " + p.alt, onclick: () => LB.open(i) },
      p.src ? h("img", { src: p.src, alt: p.alt, loading: "lazy", decoding: "async" }) : h("div", { class: "ph", text: p.alt }))));
    const s = section("gallery", "", ...head("", "", T.galleryTitle), grid);
    $("h2", s).id = "gallery-t"; return s;
  }

  const LB = (() => {
    const d = $("#lightbox"), img = $("img", d); let i = 0, x0 = 0;
    const list = () => W.gallery.filter(p => p.src);
    const show = n => { const L = list(); if (!L.length) return; i = (n + L.length) % L.length; img.style.opacity = 0;
      setTimeout(() => { img.src = L[i].src; img.alt = L[i].alt; img.style.opacity = 1; }, reduced ? 0 : 150); };
    $(".lb-x", d).onclick = () => d.close();
    $(".lb-prev", d).onclick = () => show(i - 1); $(".lb-next", d).onclick = () => show(i + 1);
    d.addEventListener("keydown", e => { if (e.key === "ArrowLeft") show(i - 1); if (e.key === "ArrowRight") show(i + 1); });
    d.addEventListener("click", e => { if (e.target === d) d.close(); });
    d.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
    d.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); });
    return { open(n) { const L = list(); if (!L.length) return toast("Add photos in content.js"); const src = W.gallery[n].src; d.showModal(); show(src ? L.findIndex(p => p.src === src) : 0); } };
  })();

  function Rsvp() {
    const f = h("form", { id: "rsvp-form", novalidate: "" },
      h("label", { for: "r-name", text: "Your name" }), h("input", { id: "r-name", name: "name", type: "text", required: "", maxlength: "60", autocomplete: "name", value: guest }),
      h("fieldset", {}, h("legend", { text: "Attendance" }),
        ...[["yes", "Joyfully attending"], ["no", "Regretfully declining"]].map(([v, l]) =>
          h("label", { class: "radio" }, h("input", { type: "radio", name: "attendance", value: v, required: "" }), l))),
      h("label", { for: "r-n", text: "Number of guests" }),
      h("input", { id: "r-n", name: "guests", type: "number", min: "1", max: String(W.rsvp.maxGuests), value: "1", inputmode: "numeric" }),
      h("label", { for: "r-m", text: "Message (optional)" }), h("textarea", { id: "r-m", name: "message", maxlength: "400" }),
      h("label", { class: "radio" }, h("input", { type: "checkbox", name: "public", value: "1" }), "Show my message in Wishes"),
      h("input", { class: "hp", name: "website", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }),
      h("button", { class: "btn", type: "submit", text: "Send RSVP" }), h("p", { class: "msg", role: "status" }));
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const msg = $(".msg", f), btn = $(".btn", f), fd = new FormData(f);
      msg.className = "msg";
      if (fd.get("website")) return; // honeypot
      const name = String(fd.get("name")).trim();
      if (!name || !fd.get("attendance")) { msg.textContent = "Please enter your name and choose attendance."; msg.classList.add("err"); return; }
      const n = Math.min(W.rsvp.maxGuests, Math.max(1, parseInt(fd.get("guests"), 10) || 1));
      const payload = { name, attendance: fd.get("attendance"), guests: fd.get("attendance") === "yes" ? n : 0,
        message: String(fd.get("message")).trim().slice(0, 400), public: !!fd.get("public"), invitedAs: guest };
      if (!W.rsvp.endpoint) { msg.textContent = "[Demo mode: set rsvp.endpoint in content.js to save responses]"; return; }
      btn.disabled = true; msg.textContent = "Sending…";
      try {
        const r = await fetch(W.rsvp.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
        const j = await r.json(); if (!j.ok) throw 0;
        f.replaceWith(h("p", { class: "thanks", text: "Thank you, " + name }));
      } catch { msg.textContent = "Could not send. Check your connection and try again."; msg.classList.add("err"); btn.disabled = false; }
    });
    const s = section("rsvp", "", ...head(W.rsvp.deadline, "", T.rsvpTitle), f);
    $("h2", s).id = "rsvp-t"; return s;
  }

  function Gift() {
    const g = W.gifts, cards = [];
    const copyCard = (title, line1, line2, val) => h("div", { class: "card rv" }, h("p", { class: "meta", text: title }),
      h("p", { class: "acct", text: line1 }), h("p", { class: "cap", text: line2 }), h("button", { class: "link", type: "button", onclick: () => copy(val), text: "Copy number" }));
    g.banks.forEach(b => cards.push(copyCard(b.bank, b.number, b.name, b.number)));
    g.ewallets.forEach(w => cards.push(copyCard(w.name, w.number, w.holder, w.number)));
    if (g.qr) cards.push(h("div", { class: "card rv" }, h("p", { class: "meta", text: "QR code" }),
      g.qr.src ? h("img", { class: "qr", src: g.qr.src, alt: g.qr.alt, loading: "lazy" }) : h("div", { class: "qr ph", text: "[QR image]" }), h("p", { class: "cap", text: g.qr.caption })));
    if (g.address && g.address.text) cards.push(h("div", { class: "card rv" }, h("p", { class: "meta", text: "Send a gift" }),
      h("p", { text: g.address.label }), h("p", { class: "cap", text: g.address.text }), h("button", { class: "link", type: "button", onclick: () => copy(g.address.text), text: "Copy address" })));
    const s = section("gift", "dark", ...head("", "", T.giftTitle), h("p", { class: "rv", text: T.giftIntro }), h("div", { class: "cards" }, cards));
    $("h2", s).id = "gift-t"; return s;
  }

  function Registry() {
    const items = W.registry.map(r => h("div", { class: "card rv" }, h("h3", { text: r.name }), r.note && h("p", { class: "cap", text: r.note }),
      r.url ? h("a", { class: "btn ghost", href: r.url, target: "_blank", rel: "noopener noreferrer", text: "View wishlist" }) : h("p", { class: "cap", text: "[Add link in content.js]" })));
    const s = section("registry", "", ...head("", "", T.registryTitle), h("p", { class: "rv", text: T.registryIntro }), h("div", { class: "cards" }, items));
    $("h2", s).id = "registry-t"; return s;
  }

  function Wishes() {
    const list = h("div", { class: "wishes", "aria-live": "polite" });
    const s = section("wishes", "", ...head("", "", T.wishesTitle), list);
    $("h2", s).id = "wishes-t";
    if (W.rsvp.endpoint) fetch(W.rsvp.endpoint + "?action=wishes").then(r => r.json()).then(j =>
      (j.wishes || []).slice(0, 50).forEach(w => list.append(h("div", { class: "wish" }, h("b", { text: String(w.name).slice(0, 60) }), h("p", { text: String(w.message).slice(0, 400) }))))).catch(() => {});
    else list.append(h("div", { class: "wish" }, h("b", { text: "[Guest name]" }), h("p", { text: "[Wishes appear here once the RSVP endpoint is connected]" })));
    return s;
  }

  function Closing() {
    const s = section("closing", "dark", h("p", { class: "script rv", text: W.couple.monogram }), h("p", { class: "rv", id: "closing-t", text: T.closing }), rule(), quote(W.quotes.close),
      h("p", { class: "meta rv", style: "margin-top:32px", text: W.couple.a + " & " + W.couple.b }));
    return s;
  }

  /* ---------- Opening, music, motion ---------- */
  document.documentElement.lang = W.lang; document.title = W.seo.title;
  $("#open-to").textContent = T.dear;
  $("#open-guest").textContent = guest || T.fallbackGuest;
  $("#open-invite").textContent = W.couple.a + " & " + W.couple.b;
  $("#open-hint").textContent = T.openHint; $("#seal-mono").textContent = W.couple.monogram;

  $("#main").append(Hero(), Countdown(), Story(), Events(), Gallery(), Rsvp(), Gift(), Registry(), Wishes(), Closing());

  const music = $("#music"); let audio = null;
  if (W.music.src) {
    audio = new Audio(W.music.src); audio.loop = true; audio.preload = "none"; music.hidden = false;
    const sync = () => { const on = !audio.paused; music.classList.toggle("on", on); music.setAttribute("aria-pressed", on); music.setAttribute("aria-label", on ? "Pause music" : "Play music"); };
    music.onclick = () => audio.paused ? audio.play().then(sync).catch(() => toast("Tap again to play")) : (audio.pause(), sync());
    audio.addEventListener("play", sync); audio.addEventListener("pause", sync);
  }

  $("#seal").addEventListener("click", () => {
    $("#opening").classList.add("gone"); document.body.classList.remove("locked");
    if (audio) audio.play().catch(() => {}); // user gesture; silently skipped if blocked
    setTimeout(() => $("#opening").setAttribute("hidden", ""), 1000);
    scrollTo(0, 0);
  });

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll(".rv").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); });

  if (!reduced) {
    const bg = $("[data-parallax]"); let tk = false;
    addEventListener("scroll", () => { if (!tk) { tk = true; requestAnimationFrame(() => { bg.style.transform = `translateY(${Math.min(scrollY, 900) * .06}px)`; tk = false; }); } }, { passive: true });
  }
})();
