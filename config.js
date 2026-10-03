/* =====================================================
   Customize the surprise here — no other file needs editing.
   ===================================================== */
window.SURPRISE_CONFIG = {

  // When the countdown ends. Local time of whoever opens the page.
  // Format: "YYYY-MM-DDTHH:MM:SS"
  birthday: "2026-10-07T00:00:00",

  // Her name (optional). If filled in, the card says "Happy Birthday, Name!"
  name: "Nandani",

  // Show a "peek at the surprise now" link under the countdown.
  // Keep false for the real thing. For testing, open the page with ?preview
  showPreviewLink: false,

  // Optional: use your own song instead of the built-in music-box tune.
  // Put an mp3 next to index.html and write its name, e.g. "song.mp3". Leave "" for the built-in tune.
  musicFile: "",

  // The birthday card
  card: {
    title: "Happy Birthday!",
    body: "You deserve all the love,\nhappiness and beautiful\nthings in this world.",
    sign: "Thank you for being you."
  },

  // Memories. Put photos in a "photos" folder and set src, e.g. "photos/first-day.jpg".
  // While src is empty (or the file is missing), a little illustrated placeholder is shown.
  // art options for placeholders: "sunset", "mountains", "hands", "city"
  // memories: [
  //   { src: "", art: "sunset",    title: "The First Day",   date: "12 Mar 2021" },
  //   { src: "", art: "mountains", title: "Our Adventures",  date: "20 Aug 2022" },
  //   { src: "", art: "hands",     title: "You & Me",        date: "10 Nov 2023" },
  //   { src: "", art: "city",      title: "More to Come",    date: "For a lifetime" }
  // ],
  // memoriesIntro: "A collection of moments that\nmean the world to you.",

  // The last words (one line per entry)
  message: {
    lines: ["You make", "life brighter", "just by existing."],
    footer: "Thank you for being you ♡"
  },

  // The very last screen
  finale: {
    title: "Happy Birthday",
    sub: "Dosto se sort krle ab jyada pareshan mt ho"
  }
};
