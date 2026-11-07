/*
  Wedding Gift Registry – Chiara & Adji
  Desain mengikuti undangan: kertas krem bertekstur, hijau olive, aksen maroon,
  EB Garamond + Cormorant Garamond + Pinyon Script.

  Cara pasang:
    1) Taruh file ini di folder yang sama dengan index.html
    2) Isi csvUrl dan whatsapp di bagian CONFIG di bawah
    3) Tambahkan sebelum </body>:   <script src="registry.js"></script>
    4) Buat tombol di undangan:     <button data-open-registry>Wedding Gift</button>

  Status barang diambil dari kolom "Status" di tab "Publik" Google Sheets:
  tulis "Sudah" kalau barang sudah diberikan, "Belum" kalau masih tersedia.
  Perubahan di sheet muncul di undangan dalam beberapa menit (Google memperbarui CSV yang dipublikasikan secara berkala).
*/
(function () {
  "use strict";

  /* ================= EDIT BAGIAN INI ================= */
  var CONFIG = {
    csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvVKXhbj3uRVD9mklTOdqC7gft3y-TdJjb2pxDSRcJcNLhuJJq2zQV0x9wCwso9yGZ6_vsRPkxrNDD/pub?gid=917878084&single=true&output=csv",
    whatsapp: "6282242049458",  // nomor WA Chiara: awali 62, tanpa + dan tanpa 0 di depan
    refreshMs: 60000,          // cek ulang status tiap 60 detik selama daftar terbuka
    loadFonts: false           // undangan sudah memuat EB Garamond, Cormorant Garamond, Pinyon Script
  };
  /* ================= SELESAI ================= */

  var C = Object.assign(
    {},
    CONFIG,
    { demo: false, demoEditable: false, autoDark: false, demoItems: [], lang: null },
    window.REGISTRY_CONFIG || {}
  );

  var TEXT = {
    id: {
      kicker: "Kirim Hadiah",
      title: "Wishlist Kami",
      intro: "Doa restu dan kehadiran Anda adalah hadiah paling berharga bagi kami. Namun, apabila Anda berkenan memberikan tanda kasih, berikut beberapa referensi yang dapat dijadikan pilihan.",
      how: "Silakan memilih barang dan konfirmasi melalui WhatsApp agar daftar ini tetap terbarui.",
      all: "Semua",
      free: "Masih tersedia",
      view: "Lihat produk",
      confirm: "Konfirmasi via WhatsApp",
      takenBadge: "Sudah diberi, terima kasih",
      no: "No.",
      loading: "Memuat daftar…",
      error: "Daftar belum bisa dimuat. Coba lagi sebentar lagi ya.",
      empty: "Belum ada barang di daftar ini.",
      allTaken: "Semua barang sudah diberikan. Terima kasih banyak!",
      close: "Tutup",
      updated: "Diperbarui pukul",
      left: function (n, total) { return n + " dari " + total + " barang masih tersedia"; },
      sim: function (taken) { return taken ? "Simulasi: tandai Belum" : "Simulasi: tandai Sudah"; },
      wa: function (item) {
        return "Halo Chiara! Aku mau memberikan hadiah: " + item + ". Boleh dikonfirmasi dulu apakah masih tersedia?\n\nNama saya: ";
      }
    },
    en: {
      kicker: "Wedding Gift",
      title: "Our Registry",
      intro: "Your presence and prayers are the greatest gifts to us. Should you kindly wish to bless us with a token of love for our new journey, we have put together a few ideas below.",
      how: "Please select an item and confirm via WhatsApp so we can keep the registry updated.",
      all: "All",
      free: "Still available",
      view: "View product",
      confirm: "Confirm via WhatsApp",
      takenBadge: "Already given, thank you",
      no: "No.",
      loading: "Loading the list…",
      error: "We couldn’t load the list. Please try again in a moment.",
      empty: "There are no items on this list yet.",
      allTaken: "Every item has been given. Thank you so much!",
      close: "Close",
      updated: "Updated at",
      left: function (n, total) { return n + " of " + total + " items still available"; },
      sim: function (taken) { return taken ? "Simulation: mark as Available" : "Simulation: mark as Given"; },
      wa: function (item) {
        return "Hi Chiara! I’d like to give you this gift: " + item + ". Could you confirm that it’s still available?\n\nMy name: ";
      }
    }
  };

  var NOISE_DARK = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .32 0 0 0 0 .22 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  var NOISE_LIGHT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .96 0 0 0 0 .94 0 0 0 0 .88 0 0 0 .10 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  var CSS = `
.rg-overlay{
  --c-paper:var(--rg-paper,#f3eee4);
  --c-card:var(--rg-card,#faf6ee);
  --c-ink:var(--rg-ink,#373a2d);
  --c-body:var(--rg-body,#454138);
  --c-forest:var(--rg-forest,#525b3c);
  --c-forest-deep:var(--rg-forest-deep,#3c4333);
  --c-on-forest:var(--rg-on-forest,#f5efe3);
  --c-on-forest-soft:var(--rg-on-forest-soft,#cbd1bc);
  --c-maroon:var(--rg-maroon,#6a2f3b);
  --c-sage:var(--rg-sage,#6f7a58);
  --c-line:var(--rg-line,#bfbdb0);
  --c-chip:var(--rg-chip,#ebe5d6);
  --f-body:var(--rg-font-body,'EB Garamond','Cormorant Garamond',Georgia,'Times New Roman',serif);
  --f-head:var(--rg-font-head,'Cormorant Garamond','EB Garamond',Georgia,'Times New Roman',serif);
  --f-script:var(--rg-font-script,'Pinyon Script','Great Vibes','Snell Roundhand',cursive);
  --noise-dark:${NOISE_DARK};
  --noise-light:${NOISE_LIGHT};
}
@media (prefers-color-scheme:dark){
  .rg-auto-dark{
    --c-paper:#1f2218;--c-card:#2a2e22;--c-ink:#f1ecdf;--c-body:#d9d4c6;
    --c-forest:#aab58f;--c-forest-deep:#2d3325;--c-on-forest:#f5efe3;--c-on-forest-soft:#cbd1bc;
    --c-maroon:#e0a9b1;--c-sage:#b3bd99;--c-line:#4a5038;--c-chip:#353a2a;
  }
  .rg-auto-dark .rg-btn{color:#232619;}
  .rg-auto-dark .rg-head{background-color:#3c4333;}
}
.rg-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:flex-end;justify-content:center;background:rgba(44,51,36,.62);padding-top:env(safe-area-inset-top,0px);font-family:var(--f-body);box-sizing:border-box;}
.rg-overlay *{box-sizing:border-box;}
.rg-overlay.rg-open{display:flex;}
.rg-sheet{width:100%;max-width:560px;max-height:92vh;max-height:92dvh;background-color:var(--c-paper);background-image:var(--noise-dark);color:var(--c-body);border-radius:22px 22px 0 0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 -10px 44px rgba(20,24,14,.4);font-size:17px;line-height:1.5;animation:rg-up .25s ease;}
@media (min-width:640px){.rg-overlay{align-items:center;padding:24px;}.rg-sheet{border-radius:22px;max-height:88vh;}}
@keyframes rg-up{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.rg-sheet{animation:none}.rg-skel{animation:none}}
.rg-head{position:relative;flex:none;padding:26px 24px 22px;text-align:center;background-color:var(--c-forest);background-image:var(--noise-light);color:var(--c-on-forest);}
.rg-kicker{margin:0;font-variant:small-caps;letter-spacing:.24em;font-size:14px;color:var(--c-on-forest-soft);}
.rg-title{margin:2px 40px 8px;font-family:var(--f-script);font-weight:400;font-size:42px;line-height:1.15;color:var(--c-on-forest);}
.rg-intro{margin:0 auto 12px;max-width:440px;font-style:italic;font-size:17px;color:var(--c-on-forest);}
.rg-how{margin:0;font-variant:small-caps;letter-spacing:.12em;font-size:14px;color:var(--c-on-forest-soft);}
.rg-close{position:absolute;top:12px;right:12px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(245,239,227,.55);background:transparent;color:var(--c-on-forest);font-size:24px;line-height:1;cursor:pointer;font-family:var(--f-head);}
.rg-tabs{flex:none;display:flex;justify-content:center;gap:10px;padding:18px 18px 4px;overflow-x:auto;}
.rg-tab{flex:none;min-height:40px;padding:0 18px;border-radius:999px;border:1px solid var(--c-line);background:transparent;color:var(--c-ink);font-family:var(--f-body);font-variant:small-caps;letter-spacing:.14em;font-size:15px;cursor:pointer;}
.rg-tab[aria-pressed='true']{background:var(--c-forest);border-color:var(--c-forest);color:var(--c-on-forest);}
.rg-meta{flex:none;padding:8px 18px 0;text-align:center;font-style:italic;font-size:15px;color:var(--c-sage);}
.rg-body{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 20px calc(24px + env(safe-area-inset-bottom,0px));}
.rg-list{list-style:none;margin:0;padding:0;}
.rg-item{position:relative;margin-top:26px;padding:10px;background:var(--c-card);box-shadow:0 1px 0 rgba(0,0,0,.04),0 8px 22px rgba(60,67,51,.10);}
.rg-frame{border:1px solid var(--c-line);padding:24px 16px 20px;text-align:center;}
.rg-num{display:block;margin-bottom:4px;font-variant:small-caps;letter-spacing:.22em;font-size:13px;color:var(--c-sage);}
.rg-name{display:block;margin:0 0 4px;font-family:var(--f-head);font-style:italic;font-weight:500;font-size:28px;line-height:1.15;color:var(--c-ink);}
.rg-note{display:block;margin-top:6px;font-style:italic;font-size:16px;color:var(--c-maroon);}
.rg-actions{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:18px;}
.rg-btn{display:inline-flex;align-items:center;justify-content:center;width:100%;max-width:320px;min-height:48px;padding:0 24px;border-radius:999px;border:1px solid var(--c-forest);background:var(--c-forest);color:var(--c-on-forest);font-family:var(--f-body);font-size:14px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;}
.rg-link{display:inline-block;padding:8px 0 3px;border-bottom:2px solid var(--c-forest);color:var(--c-forest);font-family:var(--f-body);font-size:14px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;}
.rg-taken{background:color-mix(in srgb,var(--c-card) 82%,var(--c-paper));}
.rg-taken .rg-name{opacity:.62;text-decoration:line-through;text-decoration-thickness:1px;}
.rg-seal{position:absolute;top:-17px;left:50%;transform:translateX(-50%);width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#6b7650,#4a5436);color:#f5efe3;font-size:17px;box-shadow:inset 0 0 0 3px rgba(245,239,227,.16),0 2px 6px rgba(0,0,0,.28);}
.rg-sim{display:block;margin:14px auto 0;padding:6px 12px;border:1px dashed var(--c-sage);border-radius:6px;background:transparent;color:var(--c-sage);font-family:var(--f-body);font-style:italic;font-size:14px;cursor:pointer;}
.rg-state{padding:36px 8px;text-align:center;font-style:italic;color:var(--c-sage);}
.rg-skel{height:96px;margin-top:22px;background:linear-gradient(90deg,var(--c-chip),var(--c-card),var(--c-chip));background-size:200% 100%;animation:rg-sh 1.2s linear infinite;}
@keyframes rg-sh{to{background-position:-200% 0}}
.rg-btn:focus-visible,.rg-link:focus-visible,.rg-tab:focus-visible,.rg-close:focus-visible,.rg-sim:focus-visible{outline:2px solid var(--c-maroon);outline-offset:3px;}
`;

  /* ---------- util ---------- */
  function parseCSV(text) {
    var rows = [], row = [], f = "", q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else { q = false; } }
        else { f += c; }
      } else if (c === '"') { q = true; }
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(f); f = ""; rows.push(row); row = [];
      } else { f += c; }
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    return rows;
  }

  function cleanUrl(u) {
    u = (u || "").trim().replace(/[,;\s]+$/, "");
    return /^https?:\/\//i.test(u) ? u : "";
  }

  function normalize(rows) {
    return rows.slice(1).map(function (r) {
      return {
        name: (r[0] || "").trim(),
        url: cleanUrl(r[1]),
        taken: /^sudah$/i.test((r[2] || "").trim())
      };
    }).filter(function (x) { return x.name; });
  }

  function h(tag, props) {
    var el = document.createElement(tag), k, v, kids = Array.prototype.slice.call(arguments, 2);
    props = props || {};
    for (k in props) {
      v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    kids.forEach(function add(c) {
      if (c == null || c === false) return;
      if (Array.isArray(c)) { c.forEach(add); return; }
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }

  /* ---------- state ---------- */
  var lang = detectLang(), items = [], filter = "all", status = "idle";
  var updatedAt = null, timer = null, lastFocus = null, prevOverflow = "", ui = null;

  function detectLang() {
    var l = String(C.lang || document.documentElement.lang || "id").toLowerCase();
    return l.indexOf("en") === 0 ? "en" : "id";
  }
  function T() { return TEXT[lang]; }

  function load() {
    if (C.demo) {
      if (!items.length) items = normalize([["h"]].concat(C.demoItems));
      updatedAt = new Date();
      return Promise.resolve();
    }
    if (!C.csvUrl) return Promise.reject(new Error("csvUrl belum diisi di registry.js"));
    var url = C.csvUrl + (C.csvUrl.indexOf("?") > -1 ? "&" : "?") + "t=" + Date.now();
    return fetch(url, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function (txt) {
      items = normalize(parseCSV(txt));
      updatedAt = new Date();
    });
  }

  function refresh() {
    return load().then(function () { status = "ok"; }).catch(function (e) {
      console.warn("[registry]", e);
      if (!items.length) status = "error";
    }).then(render);
  }

  /* ---------- UI ---------- */
  function build() {
    if (ui) return;
    if (C.loadFonts) {
      document.head.appendChild(h("link", {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=EB+Garamond:ital,wght@0,400;1,400&family=Pinyon+Script&display=swap"
      }));
    }
    var style = h("style", { id: "rg-style" });
    style.textContent = CSS;
    document.head.insertBefore(style, document.head.firstChild); // site styles can still fine-tune it

    ui = {};
    ui.kicker = h("p", { class: "rg-kicker" });
    ui.title = h("h2", { class: "rg-title", id: "rg-title" });
    ui.intro = h("p", { class: "rg-intro" });
    ui.how = h("p", { class: "rg-how" });
    ui.close = h("button", { class: "rg-close", type: "button", onclick: close }, "×");
    ui.tabs = h("div", { class: "rg-tabs" });
    ui.meta = h("div", { class: "rg-meta" });
    ui.list = h("ul", { class: "rg-list" });
    ui.state = h("div");
    ui.body = h("div", { class: "rg-body" }, ui.state, ui.list);
    ui.sheet = h("div", { class: "rg-sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "rg-title" },
      h("div", { class: "rg-head" }, ui.kicker, ui.title, ui.intro, ui.how, ui.close),
      ui.tabs, ui.meta, ui.body);
    ui.overlay = h("div", {
      class: "rg-overlay" + (C.autoDark ? " rg-auto-dark" : ""),
      onclick: function (e) { if (e.target === ui.overlay) close(); }
    }, ui.sheet);
    document.body.appendChild(ui.overlay);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ui.overlay.classList.contains("rg-open")) close();
    });
  }

  function card(it) {
    var tx = T();
    var wa = "https://wa.me/" + String(C.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(tx.wa(it.name));
    return h("li", { class: "rg-item" + (it.taken ? " rg-taken" : "") },
      it.taken ? h("span", { class: "rg-seal", "aria-hidden": "true" }, "✓") : null,
      h("div", { class: "rg-frame" },
        h("span", { class: "rg-num" }, tx.no + " " + (items.indexOf(it) + 1)),
        h("span", { class: "rg-name" }, it.name),
        it.taken ? h("span", { class: "rg-note" }, tx.takenBadge) : null,
        it.taken ? null : h("div", { class: "rg-actions" },
          h("a", { class: "rg-btn", href: wa, target: "_blank", rel: "noopener" }, tx.confirm),
          it.url ? h("a", { class: "rg-link", href: it.url, target: "_blank", rel: "noopener" }, tx.view) : null),
        C.demoEditable ? h("button", {
          class: "rg-sim", type: "button",
          onclick: function () { it.taken = !it.taken; render(); }
        }, tx.sim(it.taken)) : null));
  }

  function render() {
    if (!ui) return;
    var tx = T(), freeCount = items.filter(function (x) { return !x.taken; }).length;
    ui.kicker.textContent = tx.kicker;
    document.getElementById("rg-title").textContent = tx.title;
    ui.intro.textContent = tx.intro;
    ui.how.textContent = tx.how;
    ui.close.setAttribute("aria-label", tx.close);

    ui.tabs.textContent = "";
    [["all", tx.all], ["free", tx.free]].forEach(function (p) {
      ui.tabs.appendChild(h("button", {
        class: "rg-tab", type: "button", "aria-pressed": String(filter === p[0]),
        onclick: function () { filter = p[0]; render(); }
      }, p[1]));
    });

    ui.meta.textContent = "";
    if (items.length) {
      var s = tx.left(freeCount, items.length);
      if (updatedAt) s += " · " + tx.updated + " " + updatedAt.toLocaleTimeString(lang === "en" ? "en-GB" : "id-ID", { hour: "2-digit", minute: "2-digit" });
      ui.meta.textContent = s;
    }

    ui.state.textContent = "";
    ui.list.textContent = "";
    if (status === "loading" && !items.length) {
      ui.state.appendChild(h("div", { class: "rg-state" }, tx.loading));
      for (var i = 0; i < 3; i++) ui.state.appendChild(h("div", { class: "rg-skel" }));
      return;
    }
    if (status === "error" && !items.length) {
      ui.state.appendChild(h("div", { class: "rg-state" }, tx.error));
      return;
    }
    var shown = items.filter(function (x) { return filter === "all" || !x.taken; });
    if (!items.length) ui.state.appendChild(h("div", { class: "rg-state" }, tx.empty));
    else if (!shown.length) ui.state.appendChild(h("div", { class: "rg-state" }, tx.allTaken));
    shown.forEach(function (it) { ui.list.appendChild(card(it)); });
  }

  function open() {
    build();
    lastFocus = document.activeElement;
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    ui.overlay.classList.add("rg-open");
    status = items.length ? "ok" : "loading";
    render();
    ui.close.focus();
    refresh();
    clearInterval(timer);
    if (!C.demo && C.refreshMs) timer = setInterval(refresh, C.refreshMs);
  }

  function close() {
    if (!ui) return;
    ui.overlay.classList.remove("rg-open");
    document.documentElement.style.overflow = prevOverflow;
    clearInterval(timer);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function setLang(l) { C.lang = l; lang = detectLang(); render(); }

  document.addEventListener("click", function (e) {
    var trg = e.target.closest ? e.target.closest("[data-open-registry]") : null;
    if (trg) { e.preventDefault(); open(); }
  });

  new MutationObserver(function () { if (!C.lang) { lang = detectLang(); render(); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  window.RegistryGift = { open: open, close: close, setLang: setLang };
})();
