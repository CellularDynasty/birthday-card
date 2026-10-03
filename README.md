# A Little Birthday Surprise ♡

A mobile-first, interactive birthday story. Plain HTML + CSS + vanilla JS. No backend, no build step.

## Run it
- Quick look: open `index.html` in a browser.
- Recommended: `python3 -m http.server 8000` in this folder, then visit http://localhost:8000

## Customize (edit only `config.js`)
- `birthday`: when the countdown ends (`"YYYY-MM-DDTHH:MM:SS"`, local time of whoever opens it)
- `name`, card text, memories, final message, finale text
- `memories[].src`: put photos in a `photos/` folder, e.g. `"photos/first-day.jpg"` (placeholders show until then)
- `musicFile`: your own mp3 (e.g. `"song.mp3"`); empty = built-in music-box tune

## Test it
- `index.html?preview` shows a "peek at the surprise" link under the countdown
- `index.html?step=5` jumps to a step (0–11)

## The flow
Countdown → 12:00 AM → lights → music → balloons → cake → blow → blow harder → candles out → card → memories → message → finale.
One button drives all of it. After the countdown, "Replay" restarts from the lights.

## Deploy (static)
Drag the folder onto Netlify Drop, or push to GitHub and enable Pages, or use Vercel/Cloudflare Pages. Nothing to configure.

Notes: fonts load from Google Fonts (falls back to system handwriting fonts offline). Music needs the first tap to start (browser rule), which the button provides.
