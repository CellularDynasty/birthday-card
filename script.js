/* =====================================================
   A Little Birthday Surprise — interaction logic
   One primary button walks through every step.
   ===================================================== */
(() => {
  'use strict';

  const CFG = window.SURPRISE_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);

  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const br = (s = '') => esc(s).replace(/\n/g, '<br>');

  const app = $('#app');
  const fx = $('#fx');
  const cta = $('#cta');
  const btn = $('#primaryBtn');
  const btnLabel = $('#btnLabel');
  const btnIcon = $('#btnIcon use');
  const tapHint = $('#tapHint');
  const room = $('#room');
  const cake = $('#scene-cake');
  const player = $('#player');
  const soundBtn = $('#soundBtn');
  const scenes = {};
  $$('.scene').forEach(s => { scenes[s.dataset.scene] = s; });

  /* ---------------------------------------------------
     Placeholder photo art (used until real photos are added)
     --------------------------------------------------- */
  const ART = {
    sunset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 225"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d6aa8"/><stop offset=".55" stop-color="#e79a9c"/><stop offset="1" stop-color="#f7c58a"/></linearGradient></defs><rect width="300" height="225" fill="url(#g)"/><circle cx="150" cy="138" r="28" fill="#fde7b0"/><rect y="172" width="300" height="53" fill="#3b2f5e"/><g fill="#2a2049"><circle cx="128" cy="148" r="7"/><rect x="121" y="154" width="14" height="34" rx="6"/><circle cx="172" cy="146" r="7"/><rect x="165" y="152" width="14" height="36" rx="6"/></g></svg>`,
    mountains: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 225"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ec3e0"/><stop offset="1" stop-color="#e8e1f2"/></linearGradient></defs><rect width="300" height="225" fill="url(#g)"/><path d="M0 150l60-70 40 40 50-62 70 80 80-50v137H0z" fill="#8a9fc4"/><path d="M60 80l-14 16 14-4 8 8zM150 58l-16 22 16-6 14 8z" fill="#fff"/><rect y="150" width="300" height="75" fill="#6f9a73"/><path d="M122 225l24-75h8l24 75z" fill="#4b4660"/><path d="M150 214v-16M150 184v-12" stroke="#f5e6a8" stroke-width="3"/></svg>`,
    hands: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 225"><rect width="300" height="225" fill="#e9c9bf"/><circle cx="60" cy="40" r="50" fill="#f4dccf" opacity=".6"/><path d="M60 190c20-50 50-70 100-62 30 4 46 22 78 14v48z" fill="#f2c4b4" stroke="#8a5e5e" stroke-width="3" stroke-linejoin="round"/><path d="M240 180c-24-44-56-60-96-50-26 6-40 20-70 12v38z" fill="#fadccf" stroke="#8a5e5e" stroke-width="3" stroke-linejoin="round"/><path d="M150 100c-8-14-30-6-22 10 5 10 22 20 22 20s17-10 22-20c8-16-14-24-22-10z" fill="#eaa7bc" stroke="#4a2f7a" stroke-width="3" stroke-linejoin="round"/></svg>`,
    city: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 225"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b3f86"/><stop offset=".6" stop-color="#d9708f"/><stop offset="1" stop-color="#f6b27a"/></linearGradient></defs><rect width="300" height="225" fill="url(#g)"/><g fill="#2c2451"><rect x="10" y="150" width="34" height="75"/><rect x="48" y="120" width="28" height="105"/><rect x="82" y="160" width="36" height="65"/><path d="M130 225V100l10-20 6-40 6 40 10 20v125z"/><rect x="166" y="140" width="32" height="85"/><rect x="204" y="112" width="26" height="113"/><rect x="236" y="154" width="50" height="71"/></g><g fill="#ffe6a0"><rect x="56" y="132" width="4" height="5"/><rect x="62" y="150" width="4" height="5"/><rect x="172" y="154" width="4" height="5"/><rect x="212" y="128" width="4" height="5"/><rect x="246" y="170" width="4" height="5"/><rect x="144" y="130" width="4" height="5"/></g></svg>`
  };
  const artURI = k => 'data:image/svg+xml;utf8,' + encodeURIComponent(ART[k] || ART.sunset);

  /* ---------------------------------------------------
     Music: a soft music-box tune made with Web Audio
     (or your own mp3 via config.musicFile)
     --------------------------------------------------- */
  const Music = (() => {
    let ctx = null, master = null, timer = null, el = null, usingFile = false;
    const active = new Set();
    let playing = false;
    const F = { G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
    const part = [
      ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
      ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
      ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
      ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3]
    ];
    const beat = .62;
    const loopLen = part.reduce((a, [, d]) => a + d, 0) * beat + 2.4;

    function ensureCtx() {
      if (ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = .5;
      const dly = ctx.createDelay(); dly.delayTime.value = .32;
      const fb = ctx.createGain(); fb.gain.value = .28;
      const wet = ctx.createGain(); wet.gain.value = .35;
      master.connect(ctx.destination);
      master.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(ctx.destination);
      return true;
    }
    function note(freq, t, dur) {
      const len = Math.max(dur, .6) * 1.6;
      [[1, .5, 'triangle'], [2, .12, 'sine'], [3, .05, 'sine']].forEach(([m, v, type]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.value = freq * m;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v, t + .01);
        g.gain.exponentialRampToValueAtTime(.0001, t + len);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + len + .05);
        active.add(o); o.onended = () => active.delete(o);
      });
    }
    function loop() {
      let t = ctx.currentTime + .08;
      part.forEach(([n, d]) => { note(F[n], t, d * beat); t += d * beat; });
      timer = setTimeout(loop, loopLen * 1000);
    }
    async function startSynth() {
      if (!ensureCtx()) return false;
      if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) { /* ignore */ } }
      clearTimeout(timer);
      loop();
      player.style.setProperty('--len', loopLen + 's');
      return true;
    }
    return {
      get playing() { return playing; },
      async start() {
        if (playing) return;
        let ok = false;
        if (CFG.musicFile) {
          try {
            if (!el) { el = new Audio(CFG.musicFile); el.loop = true; }
            await el.play();
            usingFile = ok = true;
            const setLen = () => { if (isFinite(el.duration)) player.style.setProperty('--len', el.duration + 's'); };
            setLen(); el.onloadedmetadata = setLen;
          } catch (e) { usingFile = false; }
        }
        if (!ok) ok = await startSynth();
        playing = ok;
      },
      stop() {
        clearTimeout(timer);
        active.forEach(o => { try { o.stop(); } catch (e) { /* ignore */ } });
        active.clear();
        if (el) el.pause();
        playing = false;
      },
      suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); if (el && !el.paused) el.pause(); },
      resume() { if (playing) { if (ctx && ctx.state === 'suspended') ctx.resume(); if (usingFile && el) el.play().catch(() => {}); } }
    };
  })();

  let musicTouched = false;
  function syncMusicUI() {
    const on = Music.playing;
    player.classList.toggle('paused', !on);
    soundBtn.querySelector('use').setAttribute('href', on ? '#i-sound' : '#i-mute');
  }
  async function toggleMusic() {
    musicTouched = true;
    if (Music.playing) Music.stop(); else await Music.start();
    syncMusicUI();
  }
  document.addEventListener('visibilitychange', () => { document.hidden ? Music.suspend() : Music.resume(); });

  /* ---------------------------------------------------
     Little effects
     --------------------------------------------------- */
  const COLORS = ['#eaa7bc', '#b9a1de', '#9fd3bb', '#f3d98b', '#f4b6c8'];
  function centerOf(el) {
    const a = app.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 };
  }
  function burst(x, y, n = 20, glyphs = ['♡', '✦', '•', '✧']) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'confetti';
      s.textContent = glyphs[i % glyphs.length];
      s.style.cssText = `left:${x}px;top:${y}px;color:${COLORS[i % COLORS.length]};font-size:${11 + Math.random() * 13}px`;
      fx.appendChild(s);
      const ang = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 130;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 50;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 110}px)) rotate(${Math.random() * 360}deg) scale(1)`, opacity: 0 }
      ], { duration: 1400 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove();
    }
  }
  function burstAt(el, n) { const c = centerOf(el); burst(c.x, c.y, n); }

  function shower(n = 26, duration = 3200) {
    if (reduce) return;
    const w = app.clientWidth;
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        const s = document.createElement('span');
        s.className = 'confetti';
        s.textContent = ['♡', '✦', '✧', '❀'][i % 4];
        s.style.cssText = `left:${Math.random() * w}px;top:-20px;color:${COLORS[i % COLORS.length]};font-size:${12 + Math.random() * 14}px`;
        fx.appendChild(s);
        s.animate([
          { transform: 'translateY(0) rotate(0)', opacity: 0 },
          { opacity: 1, offset: .12 },
          { transform: `translate(${(Math.random() - .5) * 60}px, ${app.clientHeight + 40}px) rotate(${Math.random() * 540}deg)`, opacity: .9 }
        ], { duration: 3200 + Math.random() * 2200, easing: 'ease-in' }).onfinish = () => s.remove();
      }, Math.random() * duration);
    }
  }
  
  function floatHeart(x, y) {
    const h = document.createElement('span');
    h.className = 'float-heart';
    h.textContent = Math.random() > .3 ? '♡' : '✦';
    h.style.cssText = `left:${x}px;top:${y}px;color:${COLORS[Math.floor(Math.random() * COLORS.length)]};font-size:${16 + Math.random() * 14}px;--dx:${(Math.random() - .5) * 60}px`;
    fx.appendChild(h);
    setTimeout(() => h.remove(), 2700);
  }
  $('#heartBtn').addEventListener('click', () => {
    const c = centerOf($('#heartBtn'));
    for (let i = 0; i < 5; i++) setTimeout(() => floatHeart(c.x + (Math.random() - .5) * 20, c.y + 14), i * 110);
  });

  /* Balloons */
  const BALLOON_COLORS = ['#f4b6c8', '#d9c4f0', '#bfe3d2', '#fbe3a5', '#f9cdd6', '#c9b7ea'];
  function spawnBalloons() {
    const wrap = $('#balloons');
    wrap.innerHTML = '';
    const n = 12;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'balloon';
      let x;
      if (i % 3 === 0) x = 32 + Math.random() * 30;
      else if (i % 2) x = 0 + Math.random() * 22;
      else x = 68 + Math.random() * 26;
      const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
      el.style.cssText = `--x:${x}%;--top:${4 + Math.random() * 44}%;--d:${3.2 + Math.random() * 2.6}s;--delay:${(i * .17).toFixed(2)}s;--s:${(.75 + Math.random() * .5).toFixed(2)};--c:${color}`;
      el.innerHTML = `<svg class="b-svg" viewBox="0 0 60 120" aria-hidden="true">
        <path d="M30 4C14 4 5 17 5 32c0 18 14 32 25 36 11-4 25-18 25-36C55 17 46 4 30 4z" fill="${color}" stroke="#4a2f7a" stroke-width="1.6"/>
        <path d="M30 68l-4.500 7h9z" fill="${color}" stroke="#4a2f7a" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M30 75c-7 10 7 20 0 42" fill="none" stroke="#4a2f7a" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="20" cy="22" rx="4" ry="9" fill="#fff" opacity=".45" transform="rotate(20 20 22)"/>
      </svg>`;
      wrap.appendChild(el);
    }
  }

  /* ---------------------------------------------------
     Text + button helpers
     --------------------------------------------------- */
  function caption(prefix, title, sub, instant) {
    const t = $('#' + prefix + 'Title'), u = $('#' + prefix + 'Sub');
    const apply = () => { t.textContent = title; u.textContent = sub; };
    if (instant || reduce) { apply(); return; }
    t.classList.add('swap'); u.classList.add('swap');
    setTimeout(() => { apply(); t.classList.remove('swap'); u.classList.remove('swap'); }, 240);
  }

  function setBtn(cfg, instant) {
    if (!cfg) { cta.classList.add('hidden'); return; }
    const apply = () => {
      btnLabel.textContent = cfg.label;
      btnIcon.setAttribute('href', '#i-' + cfg.icon);
      btn.classList.toggle('ghost', !!cfg.ghost);
    };
    const wasHidden = cta.classList.contains('hidden');
    cta.classList.remove('hidden');
    if (instant || wasHidden || reduce) { apply(); return; }
    btn.classList.add('swap');
    setTimeout(() => { apply(); btn.classList.remove('swap'); }, 190);
  }

  let currentScene = null;
  function showScene(name) {
    Object.entries(scenes).forEach(([k, el]) => el.classList.toggle('active', k === name));
    const sc = scenes[name];
    sc.classList.remove('run'); void sc.offsetWidth; sc.classList.add('run');
    if (sc.scrollTo) sc.scrollTo(0, 0);
    currentScene = name;
  }

  /* ---------------------------------------------------
     Content rendering (from config.js)
     --------------------------------------------------- */
  function renderCard() {
    const c = CFG.card || {};
    const title = CFG.name ? `Happy Birthday, ${CFG.name}!` : (c.title || 'Happy Birthday!');
    $('#cardTitle').textContent = title;
    $('#cardBody').textContent = c.body || '';
    $('#cardSign').textContent = c.sign || '';
  }

  // function renderMemories() {
  //   const grid = $('#memGrid');
  //   const list = CFG.memories || [];
  //   $('.mem-head p').innerHTML = br(CFG.memoriesIntro || '');
  //   grid.innerHTML = '';
  //   const tilt = [-1.2, 1, .8, -.8];
  //   list.forEach((m, i) => {
  //     const fig = document.createElement('figure');
  //     fig.className = 'mem';
  //     fig.tabIndex = 0;
  //     fig.setAttribute('role', 'button');
  //     fig.style.setProperty('--i', i);
  //     fig.style.setProperty('--r', (tilt[i % tilt.length]) + 'deg');
  //     const img = document.createElement('img');
  //     img.loading = 'lazy';
  //     img.alt = m.title || 'Memory';
  //     img.src = m.src || artURI(m.art);
  //     img.onerror = () => { img.onerror = null; img.src = artURI(m.art); };
  //     fig.appendChild(img);
  //     fig.insertAdjacentHTML('beforeend',
  //       `<svg class="tag" viewBox="0 0 24 24"><use href="#i-heart"/></svg>
  //        <figcaption><strong>${esc(m.title)}</strong><small>${esc(m.date)}</small></figcaption>`);
  //     const open = () => openLightbox(img.src, `${m.title || ''}${m.date ? ' · ' + m.date : ''}`);
  //     fig.addEventListener('click', open);
  //     fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  //     grid.appendChild(fig);
  //   });
  // }

  function renderMessage() {
    const m = CFG.message || {};
    const wrap = $('#msgLines');
    wrap.innerHTML = '';
    (m.lines || []).forEach((line, i) => {
      const s = document.createElement('span');
      s.style.setProperty('--i', i);
      s.style.marginLeft = (i % 2 ? 22 : -10) + 'px';
      s.textContent = line;
      wrap.appendChild(s);
    });
    $('#msgFoot').textContent = m.footer || '';
  }

  function renderFinale() {
    const f = CFG.finale || {};
    $('#finTitle').textContent = f.title || 'Happy Birthday';
    $('#finSub').innerHTML = br(f.sub || '');
  }

  // /* Lightbox */
  // const lb = $('#lightbox');
  // function openLightbox(src, cap) { $('#lbImg').src = src; $('#lbCap').textContent = cap; lb.hidden = false; }
  // function closeLightbox() { lb.hidden = true; }
  // lb.addEventListener('click', e => { if (e.target === lb || e.target.id === 'lbClose') closeLightbox(); });
  // document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------------------------------------------------
     The story: every step is one press of the same button
     --------------------------------------------------- */
  const steps = [
    { id: 'countdown', scene: 'countdown', tone: 'light', btn: null },

    { id: 'midnight', scene: 'room', room: 'dark', tone: 'dark', hint: true,
      title: 'It’s 12:00 AM!', sub: 'Your special day is here ♡',
      btn: { label: 'Turn on the lights', icon: 'bulb' } },

    { id: 'lights', scene: 'room', room: 'lit', tone: 'light',
      title: 'The lights are on!', sub: 'Now let’s make it even more special…',
      btn: { label: 'Play the music', icon: 'music' },
      enter() { sparkleBurst(); } },

    { id: 'music', scene: 'room', room: 'lit', tone: 'light', player: true, sound: true,
      title: 'Music is playing!', sub: 'Let the good vibes fill the room…',
      btn: { label: 'Release the balloons', icon: 'balloon' },
      async enter() { if (!Music.playing && !musicTouched) await Music.start(); syncMusicUI(); } },

    { id: 'balloons', scene: 'room', room: 'lit', tone: 'light', player: true, sound: true,
      title: 'Balloons are here!', sub: 'Let’s fill the sky with happiness…',
      btn: { label: 'Cut the cake', icon: 'cake' },
      enter() { spawnBalloons(); } },

    { id: 'cake', scene: 'cake', tone: 'dark', sound: true,
      title: 'Blow the candles!', sub: 'Close your eyes and make a wish…',
      btn: { label: 'Blow the candles', icon: 'wind' } },

    { id: 'blow', scene: 'cake', cake: 'windy', tone: 'dark', sound: true,
      title: 'Blow the candles!', sub: 'Almost there… one more breath',
      btn: { label: 'Blow harder…', icon: 'wind' } },

    { id: 'out', scene: 'cake', cake: 'out', tone: 'dark', sound: true,
      title: 'The candles are out!', sub: 'Your wish is on its way… ♡',
      btn: { label: 'Open your birthday card', icon: 'mail' },
      enter() { const c = centerOf($('.cake-art')); burst(c.x, c.y - 30, 22); } },

    // { id: 'card', scene: 'card', tone: 'light', sound: true,
    //   btn: { label: 'See our memories', icon: 'down' },
    //   enter() { setTimeout(() => shower(18, 2200), 500); } },
    { id: 'card', scene: 'card', tone: 'light', sound: true,
      btn: { label: 'One last thing', icon: 'heart' },
      enter() { setTimeout(() => shower(18, 2200), 500); } },

    // { id: 'memories', scene: 'memories', tone: 'light', sound: true,
    //   btn: { label: 'One last thing', icon: 'heart' } },

    { id: 'message', scene: 'message', tone: 'light', sound: true,
      btn: { label: 'Continue', icon: 'sparkle' } },

    { id: 'finale', scene: 'finale', tone: 'dusk', sound: true,
      btn: { label: 'Replay the surprise', icon: 'replay', ghost: true },
      next: 1, reset: true,
      enter() {
        shower(24, 2800);
        finaleTimer = setInterval(() => {
          const w = app.clientWidth, h = app.clientHeight;
          floatHeart(w * (.12 + Math.random() * .76), h * (.62 + Math.random() * .12));
        }, 900);
      } }
  ];

  let idx = -1, locked = false, finaleTimer = null;

  function sparkleBurst() {
    const c = centerOf(btn);
    burst(c.x, c.y, 16);
  }

  function resetStory() {
    room.classList.remove('lit');
    $('#balloons').innerHTML = '';
    cake.classList.remove('windy', 'out');
    Music.stop(); musicTouched = false; syncMusicUI();
  }

  function go(i) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    const s = steps[i];
    const sceneChanged = s.scene !== currentScene;
    clearInterval(finaleTimer);
    idx = i;

    app.dataset.tone = s.tone || 'light';
    if (sceneChanged) showScene(s.scene);

    if (s.scene === 'room') {
      room.classList.toggle('lit', s.room === 'lit');
      caption('room', s.title, s.sub, sceneChanged);
      player.classList.toggle('show', !!s.player);
    }
    if (s.scene === 'cake') {
      cake.classList.toggle('windy', s.cake === 'windy');
      cake.classList.toggle('out', s.cake === 'out');
      caption('cake', s.title, s.sub, sceneChanged);
    }
    if (s.scene !== 'room') player.classList.remove('show');

    soundBtn.classList.toggle('hidden', !s.sound);
    tapHint.hidden = !s.hint;
    setBtn(s.btn, sceneChanged);
    syncMusicUI();
    if (s.enter) s.enter();
  }

  btn.addEventListener('click', () => {
    if (locked) return;
    locked = true;
    setTimeout(() => { locked = false; }, 750);
    const s = steps[idx];
    if (s.reset) resetStory();
    go(s.next != null ? s.next : idx + 1);
  });
  $('#playerBtn').addEventListener('click', toggleMusic);
  soundBtn.addEventListener('click', toggleMusic);

  /* ---------------------------------------------------
     Countdown
     --------------------------------------------------- */
  const target = new Date(CFG.birthday || '2026-10-04T00:00:00');
  const targetOk = !isNaN(target);
  const openedBefore = targetOk && target - Date.now() > 0;
  let cdTimer = null;

  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const diff = targetOk ? Math.max(0, target - Date.now()) : 0;
    const total = Math.floor(diff / 1000);
    $('#cd-days').textContent = pad(Math.floor(total / 86400));
    $('#cd-hours').textContent = pad(Math.floor(total % 86400 / 3600));
    $('#cd-mins').textContent = pad(Math.floor(total % 3600 / 60));
    $('#cd-secs').textContent = pad(total % 60);
    if (diff <= 0 && idx === 0) {
      clearInterval(cdTimer);
      if (openedBefore) {
        // Midnight arrived while she was watching
        const c = { x: app.clientWidth / 2, y: app.clientHeight * .4 };
        burst(c.x, c.y, 26);
        setTimeout(() => { if (idx === 0) go(1); }, 1200);
      } else {
        // Opened after the big moment: let her start when ready
        setBtn({ label: 'Open your surprise', icon: 'heart' }, true);
      }
    }
  }

  function initCountdown() {
    if (targetOk) {
      const t = target.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const d = target.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      $('#cd-until').textContent = `Until ${t} · ${d}`;
    }
    cdTimer = setInterval(tick, 1000);
    tick();
    if (CFG.showPreviewLink || params.has('preview')) {
      const link = $('#skipLink');
      link.hidden = false;
      link.addEventListener('click', () => { clearInterval(cdTimer); go(1); });
    }
  }

  /* ---------------------------------------------------
     Start
     --------------------------------------------------- */
  renderCard(); renderMessage(); renderFinale();
    // renderCard(); renderMemories(); renderMessage(); renderFinale();

  go(0);
  initCountdown();

  // Handy for testing: index.html?step=5 jumps straight to a step (0–11)
  const jump = parseInt(params.get('step'), 10);
  if (!isNaN(jump) && jump > 0) { clearInterval(cdTimer); go(jump); }
})();
