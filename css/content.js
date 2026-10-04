/* ==========================================================
   EDIT ONLY THIS FILE to change content.
   Anything in [SQUARE BRACKETS] is a placeholder to replace.
   Leave "" for photos/links you don't have yet; sections hide or show a placeholder.
   ========================================================== */
window.WEDDING = {
  lang: "en",
  couple: { a: "[Name One]", b: "[Name Two]", monogram: "[A&B]" },
  date: "2026-12-31T10:00:00+07:00",   // ISO format, used by the countdown
  dateLabel: "[Wedding date, e.g. Saturday, 31 December 2026]",

  texts: {
    dear: "Dear",
    fallbackGuest: "You",
    openHint: "Tap the seal to open",
    invite: "together with our families, we invite you to celebrate our wedding",
    heroWhisper: "[Short tagline]",
    countdownTitle: "Counting the days",
    storyTitle: "Our story",
    eventsTitle: "The day",
    galleryTitle: "Moments",
    rsvpTitle: "Will you join us?",
    giftTitle: "Wedding gift",
    giftIntro: "[Your gift message. Your presence is the greatest gift.]",
    registryTitle: "Registry",
    registryIntro: "[Short note about the registry]",
    wishesTitle: "Wishes",
    closing: "[Closing thank-you message]"
  },

  // Love story: use YOUR real story only
  story: [
    { date: "[When]", title: "[Chapter title]", text: "[Your story text]", photo: "" },
    { date: "[When]", title: "[Chapter title]", text: "[Your story text]", photo: "" },
    { date: "[When]", title: "[Chapter title]", text: "[Your story text]", photo: "" }
  ],

  events: [
    { name: "[Ceremony]", date: "[Date]", time: "[Time]", venue: "[Venue name]",
      address: "[Full address]", mapUrl: "" },
    { name: "[Reception]", date: "[Date]", time: "[Time]", venue: "[Venue name]",
      address: "[Full address]", mapUrl: "" }
  ],
  dressCode: "[Dress code guidance]",

  // Put files in /assets/ and write the path, e.g. "assets/photo1.jpg"
  gallery: [
    { src: "", alt: "[Describe photo 1]" }, { src: "", alt: "[Describe photo 2]" },
    { src: "", alt: "[Describe photo 3]" }, { src: "", alt: "[Describe photo 4]" },
    { src: "", alt: "[Describe photo 5]" }, { src: "", alt: "[Describe photo 6]" }
  ],

  // Approved quotes only. Never paste song lyrics.
  quotes: {
    hero:  { text: "[Approved quote 1]", by: "[Source]" },
    story: { text: "[Approved quote 2]", by: "[Source]" },
    close: { text: "[Approved quote 3]", by: "[Source]" }
  },

  gifts: {
    banks: [{ bank: "[Bank name]", number: "[Account number]", name: "[Account holder]" }],
    ewallets: [{ name: "[E-wallet]", number: "[Phone/ID]", holder: "[Holder name]" }],
    qr: { src: "", alt: "QR code for gift payment", caption: "[QR provider]" },
    address: { label: "[Recipient name]", text: "[Physical gift address]" }  // set text "" to hide
  },

  registry: [
    { name: "[Store / wishlist name]", url: "", note: "[Optional note]" }
  ],

  music: { src: "", title: "[Song title]" },   // e.g. "assets/music.mp3"

  rsvp: {
    endpoint: "",      // paste your Google Apps Script Web App URL here (public URL, no secrets)
    maxGuests: 4,
    deadline: "[RSVP deadline]"
  },

  seo: { title: "[Name One] & [Name Two] · Wedding Invitation" }
};
