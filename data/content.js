/* ==========================================================
   EDIT ONLY THIS FILE to change content.
   Anything in [SQUARE BRACKETS] is still a placeholder.
   Leave "" for anything you don't want shown yet.
   ========================================================== */
window.WEDDING = {
  lang: "en",
  hero: { photo: "assets/images/hero", alt: "The couple walking together through a tropical garden" },
  couple: { a: "Chiara", b: "Adji", monogram: "C & A" },
  date: "2026-12-19T08:00:00+07:00",   // countdown target: Akad Nikah 08:00 WIB
  dateLabel: "Cepu · Saturday, 19 December 2026",

  texts: {
    dear: "Dear",
    fallbackGuest: "You",
    openHint: "Tap the seal to open",
    invite: "together with our families, we invite you to celebrate our wedding",
    heroWhisper: "",
    countdownTitle: "Counting the days",
    storyTitle: "Our love story",
    eventsTitle: "The day",
    galleryTitle: "Moments",
    galleryCaption: "Two guarded hearts, one quiet wish, and a whirlwind year that turned into forever.",
    rsvpTitle: "Will you join us?",
    giftTitle: "Warmest Wishes",
    giftIntro: "Your blessings and warm wishes are truly more than enough. For those who have kindly asked and wish to share an additional blessing, you may do so through the details below.",
    registryTitle: "Registry",
    registryIntro: "",
    wishesTitle: "Wishes",
    closing: "We have found our quiet certainty in each other. Thank you for walking alongside our story, and we cannot wait to share the beginning of our forever with you."
  },

  story: [
    { date: "", title: "A New Beginning", photo: "assets/images/story-01",
      text: "I moved across the sea seeking a fresh start and a quiet horizon, with love being the furthest thing from my mind. Tucked away in a remote corner of Kalimantan, I poured myself into work. But on a rare weekend away in the city, on ordinary morning, I picked up a tennis racket—never guessing that across the court, my whole world was waiting." },
    { date: "", title: "In God’s Perfect Timing", photo: "assets/images/couple-01",
      text: "For thirty-one years, Adji had kept his heart carefully guarded, wrapped up in work and routine until an unexpected clearing in his days led him to cross my path. The moment we met, his fears gave way to pure certainty. And for me, he was every gentle, specific detail I had whispered in my prayers, walking straight into my life." },
    { date: "", title: "The Sweetest Whirlwind", photo: "assets/images/hero",
      text: "From that first hello, love moved with effortless grace. Early flights to meet family, quiet milestones, and an easy promise of forever. Almost exactly a year after our first meeting, we are stepping into a lifetime together. It all unfolded so fast, yet neither of us ever looked back—because when the heart knows, there is never a single doubt." }
  ],

  events: [
    { name: "Akad Nikah", date: "Saturday, 19 December 2026", time: "08.00 WIB",
      venue: "Gedung Soos Sasono Suko Cepu", address: "Cepu",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Gedung+Soos+Sasono+Suko+Cepu" },
    { name: "Resepsi", date: "Saturday, 19 December 2026",
      time: ["Session 1 · 12.00–13.00 WIB", "Session 2 · 13.00–14.00 WIB"],
      venue: "Gedung Soos Sasono Suko Cepu", address: "Cepu",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Gedung+Soos+Sasono+Suko+Cepu" }
  ],
  venueMap: { name: "Gedung Soos Sasono Suko Cepu", query: "Gedung Soos Sasono Suko Cepu" },
  dressCode: "",

  gallery: [
    { src: "assets/images/couple-01", alt: "The couple standing close together, dressed in batik" },
    { src: "assets/images/hero", alt: "The couple walking together through a tropical garden" },
    { src: "assets/images/story-01", alt: "The couple standing side by side holding white flowers" }
  ],

  // Leave text "" to hide a quote
  quotes: {
    hero:  { text: "I crossed an ocean chasing peace, never knowing I was walking straight into the arms of my answered prayers.", by: "" },
    story: { text: "I was not looking for love, but love found me—and it looked exactly like home.", by: "" },
    close: { text: "Every step, every turn, and every quiet hope was simply leading me to you.", by: "" }
  },

  gifts: {
    banks: [{ bank: "BNI", number: "0696305090", name: "Millenanda Chiara Adnyn" }],
    ewallets: [],
    qr: null,
    address: { label: "Gift address", text: "Balikpapan [full address to be added]" }
  },

  registry: [ { name: "Our wishlist", url: "", note: "" } ],   // paste the Google Sheets link in url

  music: { src: "assets/music/Johnny Stimson - Honeymoon (Official Audio).mp3", title: "Honeymoon", artist: "Johnny Stimson" },

  rsvp: { endpoint: "https://script.google.com/macros/s/AKfycbxjdrHYKcfRBa0RPFD9BDBEtYzTuK43nOALiL273Xw9vEaGazgKIcwexv7Q4d06g8XT/exec", maxGuests: 4, deadline: "" },

  seo: { title: "Chiara & Adji · Wedding Invitation" }
};
