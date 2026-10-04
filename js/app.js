/* Wedding invitation: no dependencies. Content lives in data/content.js, illustrations in js/art.js */
(() => {
  "use strict";
  const W = window.WEDDING;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s), all = s => document.querySelectorAll(s);

  /* ---------- Language ---------- */
  const pickLang = () => {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && W.i18n[q]) return q;
    try { const s = localStorage.getItem("wedding-lang"); if (s && W.i18n[s]) return s; } catch {}
    return W.i18n[W.defaultLang] ? W.defaultLang : "en";
  };
  let lang = pickLang(), D = W.i18n[lang], T = D.texts, U = D.ui;

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
    kids.flat(Infinity).forEach(c => c != null && c !== false && el.append(c));
    return el;
  }
  // Trusted, hard-coded SVG markup from art.js only (never user text)
  const art = (cls, markup) => { const d = h("div", { class: cls, "aria-hidden": "true" }); d.innerHTML = markup; return d; };
  // Photo with automatic extension detection: "assets/images/hero" tries .jpg, .jpeg, .png, .webp
  function photo(base, alt, rec) {
    const cand = /\.\w{3,4}$/.test(base) ? [base] : [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"].map(e => base + e);
    const img = h("img", { alt, loading: "lazy", decoding: "async" }); let i = 0;
    img.onerror = () => { if (++i < cand.length) img.src = cand[i]; };
    img.onload = () => { if (rec) rec.url = img.src; };
    img.src = cand[0]; return img;
  }
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 1800); };
  const rule = () => { const d = h("div", { class: "divider rv" }); d.innerHTML = Art.divider(); return d; };
  const head = (eyebrow, whisper, title) => [
    h("p", { class: "eyebrow rv", text: eyebrow }),
    whisper && h("p", { class: "script rv", text: whisper }),
    title && h("h2", { class: "rv", text: title })
  ];
  const quote = q => q && q.text ? h("blockquote", { class: "quote rv" }, q.text, q.by ? h("cite", { text: q.by }) : null) : null;
  const section = (id, cls, ...kids) => h("section", { id, class: "sec " + (cls || ""), "aria-labelledby": id + "-t" }, h("div", { class: "wrap" }, kids));

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = h("textarea", { class: "hp" }); t.value = text; document.body.append(t); t.select(); document.execCommand("copy"); t.remove(); }
    toast(U.copied);
  }

  /* ---------- Personalization: ?to=Dr.%20Rina ---------- */
  const guest = (new URLSearchParams(location.search).get("to") || "").replace(/[\u0000-\u001f\u007f<>"'`\\{}]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);

  /* ---------- Music engine (lives outside the DOM so switching language never interrupts it) ---------- */
  const tracks = (() => {
    const a = [...(W.music.tracks || [])];
    if (W.music.shuffle) for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  })();
  let ti = 0, audio = null;
  const fmt = t => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
  function syncAudio() {
    const on = !!audio && !audio.paused;
    all("#music,.pp").forEach(b => { b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); b.setAttribute("aria-label", on ? U.pause : U.play); });
    all(".vinyl").forEach(v => v.classList.toggle("spin", on));
    all(".sk.bk").forEach(b => b.setAttribute("aria-label", U.prev)); all(".sk.nx").forEach(b => b.setAttribute("aria-label", U.next));
    all(".sg").forEach(b => { const c = +b.dataset.i === ti; b.classList.toggle("cur", c); b.classList.toggle("on", c && on); });
    const tr = tracks[ti];
    if (tr) { all(".np-t").forEach(e => e.textContent = tr.title); all(".np-a").forEach(e => e.textContent = tr.artist); }
  }
  const play = () => audio && audio.play().catch(() => toast(U.tapAgain));
  function load(n) {
    if (!audio) return; ti = (n + tracks.length) % tracks.length;
    audio.src = encodeURI(tracks[ti].src); all(".prog i").forEach(i => i.style.width = "0"); all(".tm").forEach(t => t.textContent = "0:00"); syncAudio();
  }
  function go(d) { if (!audio) return; if (d < 0 && audio.currentTime > 3) { audio.currentTime = 0; return; } load(ti + d); play(); }
  const toggle = () => { if (!audio) return toast(U.musicMissing); audio.paused ? play() : audio.pause(); };
  if (tracks.length) {
    audio = new Audio(); audio.preload = "auto";
    audio.addEventListener("play", syncAudio); audio.addEventListener("pause", syncAudio);
    audio.addEventListener("ended", () => go(1));
    audio.addEventListener("error", () => toast(U.musicMissing));
    audio.addEventListener("timeupdate", () => { const p = audio.duration ? audio.currentTime / audio.duration : 0;
      all(".prog i").forEach(i => i.style.width = p * 100 + "%"); all(".tm").forEach(t => t.textContent = fmt(audio.currentTime)); });
    load(0);
  }

  /* ---------- Components ---------- */
  function Hero() {
    return h("section", { id: "hero", class: "hero", "aria-labelledby": "hero-t" }, art("hero-deco", Art.heroDeco()),
      h("div", { class: "hero-art" },
        h("p", { class: "eyebrow rv", text: T.invite }),
        h("h1", { id: "hero-t", class: "rv" }, W.couple.a, h("span", { class: "amp", text: "&" }), W.couple.b),
        h("p", { class: "meta date rv", text: D.dateLabel })));
  }

  function Verse() {
    const v = D.verse, s = h("section", { id: "verse", class: "sec verse", "aria-label": v.ref }, h("div", { class: "wrap" },
      rule(), h("p", { class: "ar rv", lang: "ar", dir: "rtl", text: W.ayat }),
      h("p", { class: "tr rv", text: v.text }), h("p", { class: "eyebrow ref rv", text: v.ref })));
    s.append(Art.corner("l"), Art.corner("r")); return s;
  }

  function Couple() {
    const card = p => h("div", { class: "card person tape rv" },
      h("h3", { class: "pname", text: p.name }), h("p", { class: "cap rel", text: p.rel }),
      h("p", { class: "parents" }, p.parents[0], h("br"), "& " + p.parents[1]),
      h("p", { class: "addr", text: p.address }));
    const s = section("couple", "couple", h("p", { id: "couple-t", class: "script rv", text: T.weddingOf }),
      h("div", { class: "people" }, card(D.bride), h("p", { class: "amp rv", "aria-hidden": "true", text: "&" }), card(D.groom)));
    s.append(Art.corner("l"), Art.corner("r")); return s;
  }

  let cdTimer = null;
  function Countdown() {
    const s = section("countdown", "dark", ...head(T.countdownTitle, "", ""));
    const box = h("div", { class: "count rv", role: "timer", "aria-label": U.timer });
    const cells = U.units.map(l => { const b = h("b", { text: "0" }); box.append(h("div", {}, b, h("span", { text: l }))); return b; });
    const frame = h("div", { class: "lace-frame rv" }); frame.innerHTML = Art.lace();
    frame.append(h("div", { class: "oval" }, photo(W.hero.photo, D.heroAlt)));
    $(".wrap", s).append(frame, quote(D.quotes.hero), box);
    $(".eyebrow", s).id = "countdown-t";
    const target = new Date(W.date).getTime();
    const tick = () => {
      let d = Math.max(0, target - Date.now()) / 1000;
      [86400, 3600, 60, 1].forEach((u, i) => { cells[i].textContent = String(Math.floor(d / u)).padStart(2, "0"); d %= u; });
    };
    if (!isNaN(target)) { tick(); cdTimer = setInterval(tick, 1000); }
    return s;
  }

  function Story() {
    const roman = ["I", "II", "III", "IV", "V", "VI"];
    const chaps = h("div", { class: "chaps" }, D.story.map((c, i) => { const base = W.story[i] || {};
      return h("article", { class: "card chap rv" },
        h("span", { class: "num", "aria-hidden": "true", text: roman[i] || String(i + 1) }),
        c.date ? h("p", { class: "meta", text: c.date }) : null, h("h3", { text: c.title }),
        base.photo ? h("figure", { class: "pol-s chap-ph" }, photo(base.photo, c.title)) : null,
        h("p", { class: "dc", text: c.text }), Art.corner("l"), Art.corner("r"), Art.stick(["hummer", "dove", "rings"][i % 3], "dk p-tr w2 float")); }));
    const s = section("story", "", art("story-art rv", Art.archScene()), ...head("", "", T.storyTitle), chaps, quote(D.quotes.story));
    $("h2", s).id = "story-t"; return s;
  }

  function Events() {
    const cards = W.events.map((e, i) => { const t = D.events[i] || {};
      return h("div", { class: "card ev tape rv" },
        h("h3", { text: t.name }), h("p", { class: "meta", text: t.date }), ...[].concat(t.time || []).map(x => h("p", { class: "meta", text: x })),
        h("p", { text: e.venue }), h("p", { class: "cap", text: e.address })); });
    const s = section("events", "dark", ...head("", "", T.eventsTitle), cards,
      W.venueMap ? h("div", { class: "map rv" }, h("iframe", { title: U.mapTitle + W.venueMap.name, src: "https://www.google.com/maps?q=" + encodeURIComponent(W.venueMap.query) + "&output=embed", loading: "lazy", referrerpolicy: "no-referrer-when-downgrade" })) : null,
      W.venueMap ? h("a", { class: "btn ghost map-btn rv", href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(W.venueMap.query), target: "_blank", rel: "noopener", text: U.viewMap }) : null,
      D.dressCode ? [rule(), h("p", { class: "eyebrow", text: U.dress }), h("p", { class: "rv", text: D.dressCode })] : null);
    $(".wrap", s).prepend(art("way-art rv", Art.way())); $("h2", s).id = "events-t"; return s;
  }

  function Gallery() {
    const grid = h("div", { class: "grid rv" }, W.gallery.map((p, i) => { const alt = D.galleryAlts[i] || "";
      return h("button", { type: "button", "aria-label": U.openPhoto + alt, onclick: () => LB.open(i) },
        p.src ? photo(p.src, alt, p) : h("div", { class: "ph", text: alt })); }));
    const s = section("gallery", "", art("canopy", Art.penjor("l") + Art.penjor("r")), ...head("", "", T.galleryTitle), grid, T.galleryCaption ? h("p", { class: "quote rv", text: T.galleryCaption }) : null);
    $("h2", s).id = "gallery-t"; return s;
  }

  const LB = (() => {
    const d = $("#lightbox"), img = $("img", d); let i = 0, x0 = 0;
    const list = () => W.gallery.filter(p => p.url);
    const show = n => { const L = list(); if (!L.length) return; i = (n + L.length) % L.length; img.style.opacity = 0;
      setTimeout(() => { img.src = L[i].url; img.alt = D.galleryAlts[W.gallery.indexOf(L[i])] || ""; img.style.opacity = 1; }, reduced ? 0 : 150); };
    $(".lb-x", d).onclick = () => d.close();
    $(".lb-prev", d).onclick = () => show(i - 1); $(".lb-next", d).onclick = () => show(i + 1);
    d.addEventListener("keydown", e => { if (e.key === "ArrowLeft") show(i - 1); if (e.key === "ArrowRight") show(i + 1); });
    d.addEventListener("click", e => { if (e.target === d) d.close(); });
    d.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
    d.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); });
    return { open(n) { const L = list(); if (!L.length) return toast(U.noPhotos); const src = W.gallery[n].url; d.showModal(); show(src ? L.findIndex(p => p.url === src) : 0); } };
  })();

  const ICON_PREV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2.5v14H6zM20 5v14L9.5 12z"/></svg>';
  const ICON_NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 5H18v14h-2.5zM4 5l10.5 7L4 19z"/></svg>';
  function Playlist() {
    const rec = h("div", { class: "vinyl" }); rec.innerHTML = Art.vinyl();
    const skip = (cls, icon, d) => { const b = h("button", { type: "button", class: "sk " + cls }); b.innerHTML = icon; b.onclick = () => go(d); return b; };
    const pp = h("button", { type: "button", class: "pp", "aria-pressed": "false" }); pp.onclick = toggle;
    const prog = h("div", { class: "prog", role: "presentation" }, h("i"));
    prog.onclick = e => { if (audio && audio.duration) { const r = prog.getBoundingClientRect(); audio.currentTime = audio.duration * (e.clientX - r.left) / r.width; } };
    return section("playlist", "", h("p", { id: "playlist-t", class: "script rv", text: T.songsTitle }),
      h("div", { class: "player rv" }, h("div", { class: "cover" }, photo(W.hero.photo, D.heroAlt)),
        h("div", { class: "ctl" }, h("div", { class: "btns" }, skip("bk", ICON_PREV, -1), pp, skip("nx", ICON_NEXT, 1)),
          prog, h("span", { class: "tm cap", text: "0:00" }))),
      rec, h("h3", { class: "np-t rv" }), h("p", { class: "np-a meta rv" }),
      h("p", { class: "songs-h eyebrow rv", text: U.songsHint }),
      h("ol", { class: "songs rv" }, tracks.map((t, i) => h("li", {}, h("button", { type: "button", class: "sg", "data-i": i, onclick: () => { load(i); play(); } },
        h("span", { class: "n", text: i + 1 }), h("span", { class: "tt" }, h("b", { text: t.title }), h("i", { text: t.artist })))))));
  }

  let rsvpDone = null;
  function saveForm() {
    const f = $("#rsvp-form"); if (!f) return null;
    const at = f.querySelector("input[name=attendance]:checked");
    return { name: f.elements.namedItem("name").value, attendance: at ? at.value : "", guests: f.elements.namedItem("guests").value,
      message: f.elements.namedItem("message").value, pub: f.elements.namedItem("public").checked };
  }
  function Rsvp(st) {
    const R = W.rsvp, num = h("input", { id: "r-n", name: "guests", value: "1", readonly: "", class: "num", "aria-label": U.guestsLbl });
    const step = (d, t) => h("button", { type: "button", class: "stp", "aria-label": d > 0 ? U.more : U.fewer, text: t,
      onclick: () => { num.value = Math.min(R.maxGuests, Math.max(1, (+num.value || 1) + d)); } });
    const tick = (type, name, v, t) => h("label", { class: "tick" }, h("input", { type, name, value: v, required: name === "attendance" ? "" : null }), h("i", { "aria-hidden": "true" }), t);
    const count = h("div", { class: "row" }, h("span", { class: "cap", text: U.guestsCap }), h("div", { class: "stepper" }, step(-1, "−"), num, step(1, "+")));
    const f = h("form", { id: "rsvp-form", novalidate: "", class: "reply" },
      h("p", { class: "script", text: U.rsvpScript }),
      R.deadline ? h("p", { class: "cap", text: U.respondBy + R.deadline }) : null,
      h("div", { class: "row name" }, h("label", { for: "r-name", class: "mk", text: U.nameMark }),
        h("input", { id: "r-name", name: "name", type: "text", required: "", maxlength: "60", autocomplete: "name", value: guest }), h("span", { class: "cap", text: U.nameCap })),
      h("div", { class: "row" }, tick("radio", "attendance", "yes", U.yes), tick("radio", "attendance", "no", U.no)),
      count,
      h("div", { class: "row note" }, h("label", { for: "r-m", class: "script sm", text: U.words }), h("textarea", { id: "r-m", name: "message", maxlength: "400" })),
      tick("checkbox", "public", "1", U.share),
      h("input", { class: "hp", name: "website", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }),
      h("button", { class: "btn", type: "submit", text: U.send }), h("p", { class: "msg", role: "status" }));
    if (st) { // keep what the guest already typed when the language changes
      f.elements.namedItem("name").value = st.name; num.value = st.guests || "1"; f.elements.namedItem("message").value = st.message; f.elements.namedItem("public").checked = st.pub;
      const r = st.attendance && f.querySelector(`input[name=attendance][value=${st.attendance}]`); if (r) { r.checked = true; count.hidden = st.attendance === "no"; }
    }
    f.addEventListener("change", e => { if (e.target.name === "attendance") count.hidden = e.target.value === "no"; });
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const msg = $(".msg", f), btn = $(".btn", f), fd = new FormData(f);
      msg.className = "msg";
      if (fd.get("website")) return; // honeypot
      const name = String(fd.get("name")).trim();
      if (!name || !fd.get("attendance")) { msg.textContent = U.errReq; msg.classList.add("err"); return; }
      const n = Math.min(W.rsvp.maxGuests, Math.max(1, parseInt(fd.get("guests"), 10) || 1));
      const payload = { name, attendance: fd.get("attendance"), guests: fd.get("attendance") === "yes" ? n : 0,
        message: String(fd.get("message")).trim().slice(0, 400), public: !!fd.get("public"), invitedAs: guest };
      if (!W.rsvp.endpoint) { msg.textContent = U.demo; return; }
      btn.disabled = true; msg.textContent = U.sending;
      try {
        const r = await fetch(W.rsvp.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
        const j = await r.json(); if (!j.ok) throw 0;
        rsvpDone = name; f.replaceWith(h("p", { class: "thanks", text: U.thanks + name }));
      } catch { msg.textContent = U.errSend; msg.classList.add("err"); btn.disabled = false; }
    });
    const body = rsvpDone ? h("p", { class: "thanks", text: U.thanks + rsvpDone }) : f;
    const s = section("rsvp", "", ...head(W.rsvp.deadline, "", T.rsvpTitle), h("div", { class: "card reply-card rv" }, body, art("vine-wrap", Art.vine())));
    $("h2", s).id = "rsvp-t"; return s;
  }

  function Gift() {
    const g = W.gifts, G = D.gifts, cards = [];
    const copyCard = (title, line1, line2, val) => h("div", { class: "card rv" }, h("p", { class: "meta", text: title }),
      h("p", { class: "acct", text: line1 }), h("p", { class: "cap", text: line2 }), h("button", { class: "link", type: "button", onclick: () => copy(val), text: U.copyNum }));
    g.banks.forEach(b => cards.push(copyCard(b.bank, b.number, b.name, b.number)));
    g.ewallets.forEach(w => cards.push(copyCard(w.name, w.number, w.holder, w.number)));
    if (g.qr) cards.push(h("div", { class: "card rv" }, h("p", { class: "meta", text: U.qr }),
      g.qr.src ? h("img", { class: "qr", src: g.qr.src, alt: g.qr.alt, loading: "lazy" }) : h("div", { class: "qr ph", text: U.qrPh }), h("p", { class: "cap", text: g.qr.caption })));
    if (G.addressText) cards.push(h("div", { class: "card rv" }, h("p", { class: "meta", text: U.sendGift }),
      h("p", { text: G.addressLabel }), h("p", { class: "cap", text: G.addressText }), h("button", { class: "link", type: "button", onclick: () => copy(G.addressText), text: U.copyAddr })));
    const s = section("gift", "dark", ...head("", "", T.giftTitle), h("p", { class: "rv", text: T.giftIntro }), h("div", { class: "cards" }, cards));
    $("h2", s).id = "gift-t"; return s;
  }

  function Registry() {
    const items = W.registry.map((r, i) => { const t = D.registry[i] || {};
      return h("div", { class: "card rv" }, h("h3", { text: t.name }), t.note && h("p", { class: "cap", text: t.note }),
        r.url ? h("a", { class: "btn ghost", href: r.url, target: "_blank", rel: "noopener noreferrer", text: U.wishBtn }) : h("p", { class: "cap", text: U.linkSoon })); });
    const s = section("registry", "", ...head("", "", T.registryTitle), h("p", { class: "rv", text: T.registryIntro }), h("div", { class: "cards" }, items));
    $("h2", s).id = "registry-t"; return s;
  }

  let wishData = null;
  function Wishes() {
    const list = h("div", { class: "wishes", "aria-live": "polite" });
    const s = section("wishes", "", ...head("", "", T.wishesTitle), list);
    $("h2", s).id = "wishes-t";
    const paint = ws => ws.slice(0, 50).forEach(w => list.append(h("div", { class: "wish" }, h("b", { text: String(w.name).slice(0, 60) }), h("p", { text: String(w.message).slice(0, 400) }))));
    if (wishData) paint(wishData);
    else if (W.rsvp.endpoint) fetch(W.rsvp.endpoint + "?action=wishes").then(r => r.json()).then(j => { wishData = j.wishes || []; paint(wishData); }).catch(() => {});
    else list.append(h("div", { class: "wish" }, h("b", { text: U.wishName }), h("p", { text: U.wishPh })));
    return s;
  }

  function Closing() {
    const fam = (label, p) => h("div", { class: "fam rv" }, h("p", { class: "eyebrow", text: label }),
      h("p", { class: "pn", text: p.parents[0] }), h("p", { class: "pn", text: "& " + p.parents[1] }), h("p", { class: "addr", text: p.address }));
    return h("section", { id: "closing", class: "sec dark closing", "aria-labelledby": "closing-t" }, h("div", { class: "wrap" },
      rule(), h("div", { class: "cart rv" }, h("p", { id: "closing-t", class: "msg-c", text: T.closing })), quote(D.quotes.close),
      h("p", { class: "script joy rv", text: U.joy }),
      fam(U.brideLbl, D.bride), h("p", { class: "fam-sep rv", "aria-hidden": "true", text: "&" }), fam(U.groomLbl, D.groom),
      art("scene-c rv", Art.scene()), h("p", { class: "meta rv", text: D.dateLabel })));
  }

  /* ---------- Page assembly ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15 });
  function render(st, instant) {
    clearInterval(cdTimer);
    $("#main").replaceChildren(Hero(), Verse(), Couple(), Playlist(), Countdown(), Story(), Events(), Gallery(), Rsvp(st), Gift(), Registry(), Wishes(), Closing());
    ["events", "gift"].forEach(id => $("#" + id).append(Art.corner("l"), Art.corner("r")));
    all("#main .rv").forEach((el, i) => { if (instant) el.classList.add("in"); else { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); } });
    const DECO = {
      verse: [["stamp-flower", "p-tr w2 rot2 float"], ["hummer", "p-bl w2 fly"]], couple: [["dove", "p-tr w3 float"], ["stamp-bird", "p-bl w2 rot1 float2"]],
      playlist: [["lanterns", "p-tl w2 swing"], ["hummer", "p-br w2 fly"]], countdown: [["lanterns", "p-tl w2 swing"], ["lanterns", "p-tr w2 swing flip"], ["lace-fan", "p-br w3 float"]],
      story: [["lily-white", "p-tr w3 sway"], ["stamp-tulip", "p-bl w2 rot1 float"]], events: [["candi", "p-tr w3 float"], ["stamp-bird", "p-bl w2 rot2 float2"]],
      gallery: [["stamp-flower", "p-tl w2 rot1 float"], ["key", "p-br w2 rot2 float2"]], rsvp: [["seal", "p-tr w2 rot2 float"], ["tag", "p-tl w2 rot1 swing"]],
      gift: [["locket", "p-tr w1 float"], ["rings", "p-bl w2 rot1 float2"]], registry: [["gold-flora", "p-tr w2 sway"], ["key", "p-bl w2 rot1 float"]],
      wishes: [["dove", "p-tl w3 float"], ["lov", "p-br w2 sway"]], closing: [["lily-white", "p-bl w4 sway"], ["lily-pink", "p-br w4 sway flip"], ["fan-batik", "p-tr w3 float"]]
    };
    Object.entries(DECO).forEach(([id, l]) => { const s = $("#" + id); if (s) l.forEach(([n, c]) => s.append(Art.stick(n, "dk " + c))); });
    syncAudio();
  }

  /* ---------- Chrome: language switch, opening envelope, side panel ---------- */
  const langSwitch = () => h("div", { class: "langsw", role: "group", "aria-label": "Language / Bahasa" },
    Object.keys(W.i18n).map(k => h("button", { type: "button", "data-l": k, text: k.toUpperCase(), onclick: () => setLang(k) })));

  function applyChrome() {
    document.documentElement.lang = lang; document.title = D.seoTitle;
    $("#open-wo").textContent = T.weddingOf; $("#open-invite").textContent = W.couple.a + " & " + W.couple.b;
    $("#open-to").textContent = T.dear; $("#open-guest").textContent = guest || T.fallbackGuest;
    $("#open-hint").textContent = T.openHint; $("#seal-mono").textContent = W.couple.monogram;
    $("#seal").setAttribute("aria-label", U.openInvite); $(".skip").textContent = U.skip;
    all(".langsw button").forEach(b => { const on = b.dataset.l === lang; b.setAttribute("aria-pressed", on); if (on) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    $(".side-in").replaceChildren(art("side-top", Art.penjor("l") + Art.penjor("r")),
      h("div", { class: "side-txt" }, h("p", { class: "eyebrow", text: T.weddingOf }), h("p", { class: "script", text: W.couple.a + " & " + W.couple.b }), h("p", { class: "meta", text: D.dateLabel })),
      art("side-bt", Art.scene()));
  }
  function setLang(l) {
    if (l === lang || !W.i18n[l]) return;
    const st = saveForm(), y = scrollY;
    lang = l; D = W.i18n[l]; T = D.texts; U = D.ui;
    try { localStorage.setItem("wedding-lang", l); } catch {}
    applyChrome(); render(st, true); scrollTo({ top: y, behavior: "instant" });
  }

  $("#deco").innerHTML = Art.backdrop();
  $("#lang-open").append(langSwitch()); $("#lang-top").replaceWith(langSwitch());
  applyChrome();
  render(null, false);

  const music = $("#music"); music.hidden = false; music.onclick = toggle;
  $("#seal").addEventListener("click", () => {
    $("#envelope").classList.add("opened"); $("#seal").disabled = true;
    if (audio) audio.play().catch(() => {}); // runs from a tap, so browsers allow it
    setTimeout(() => { $("#opening").classList.add("gone"); document.body.classList.remove("locked"); scrollTo(0, 0); }, reduced ? 200 : 1900);
    setTimeout(() => $("#opening").setAttribute("hidden", ""), reduced ? 700 : 2900);
  });

  if (!reduced) {
    const bg = $("[data-parallax]"); let tk = false;
    if (bg) addEventListener("scroll", () => { if (!tk) { tk = true; requestAnimationFrame(() => { bg.style.transform = `translateY(${Math.min(scrollY, 900) * .03}px)`; tk = false; }); } }, { passive: true });
  }
  window.WEDDING_READY = true;
})();
