/* ============================================================
   信封访问门 · 高淑琴院长亲启
   拆信时序：火漆裂 → 封口翻 → 信纸出封 → 金光起 → 入站
   ============================================================ */
(function () {
  'use strict';

  var gate = document.getElementById('gate');
  if (!gate) return;

  var html = document.documentElement;
  var ROOT_KEY = 'px1928_unlocked';
  var SOUND_KEY = 'px_gate_sound';
  var PASS = '1928' + '1413';

  /* ---------- 已解锁：直接移除门页 ---------- */
  if (html.classList.contains('px-unlocked')) {
    if (gate.parentNode) gate.parentNode.removeChild(gate);
    return;
  }
  html.classList.add('px-locked');

  var envelope = document.getElementById('envelope');
  var form = document.getElementById('gateForm');
  var input = document.getElementById('gateCode');
  var btn = document.getElementById('gateBtn');
  var hint = document.getElementById('gateHint');
  var busy = false;

  /* =========================================================
     金尘粒子
     ========================================================= */
  var dust = (function () {
    var cv = document.getElementById('gateDust');
    if (!cv || !cv.getContext) return { start: nop, burst: nop, stop: nop };
    var ctx = cv.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], raf = 0, last = 0;

    function nop() {}

    function size() {
      W = gate.clientWidth || window.innerWidth;
      H = gate.clientHeight || window.innerHeight;
      cv.width = Math.floor(W * DPR);
      cv.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    size();
    window.addEventListener('resize', size);

    function rnd(a, b) { return a + Math.random() * (b - a); }

    function fleck(x, y, o) {
      o = o || {};
      return {
        x: x, y: y, vx: o.vx || 0, vy: o.vy || 0,
        r: o.r || rnd(.7, 2.1),
        a: o.a || rnd(.24, .82),
        sway: rnd(.5, 2.2), phase: rnd(0, 6.28), life: 0,
        hl: o.hl === undefined ? Math.random() < .3 : o.hl,
        grav: o.grav === undefined ? -.05 : o.grav,
        decay: o.decay || .02
      };
    }

    function push(f) { if (parts.length < 380) parts.push(f); }

    function burst(x, y, n, spread) {
      spread = spread || 1;
      for (var i = 0; i < n; i++) {
        var ang = rnd(0, 6.28), sp = rnd(1.1, 7.4) * spread;
        push(fleck(x + rnd(-22, 22), y + rnd(-16, 16), {
          vx: Math.cos(ang) * sp * .95,
          vy: Math.sin(ang) * sp - rnd(1, 4),
          r: rnd(.9, 3), a: rnd(.35, 1),
          grav: -.10, decay: rnd(.010, .026)
        }));
      }
    }

    var tickAcc = 0;
    function ambient() {
      tickAcc += 1;
      if (tickAcc < 14) return;
      tickAcc = 0;
      if (Math.random() < .5) {
        push(fleck(rnd(-10, W + 10), H + rnd(0, 40), {
          vx: rnd(-.5, .5), vy: rnd(-1.1, -.32),
          r: rnd(.5, 1.8), a: rnd(.10, .42), grav: -.004, decay: .004
        }));
      }
    }

    function draw(p) {
      var alpha = p.a * Math.max(0, 1 - p.life * p.decay);
      if (alpha <= .01) return false;
      var x = p.x + Math.sin(p.life * .03 * p.sway + p.phase) * 1.6;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var s = p.r * (p.hl ? 3.1 : 2.6);
      var g = ctx.createRadialGradient(x, p.y, 0, x, p.y, s);
      g.addColorStop(0, 'rgba(255,247,220,' + alpha + ')');
      g.addColorStop(.36, 'rgba(240,198,120,' + alpha * .52 + ')');
      g.addColorStop(1, 'rgba(215,155,70,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, p.y, s, 0, 6.283); ctx.fill();
      if (p.hl) {
        ctx.strokeStyle = 'rgba(255,242,206,' + alpha * .78 + ')';
        ctx.lineWidth = .85;
        ctx.beginPath();
        ctx.moveTo(x - s * 1.55, p.y); ctx.lineTo(x + s * 1.55, p.y);
        ctx.moveTo(x, p.y - s * 1.55); ctx.lineTo(x, p.y + s * 1.55);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    }

    function loop(now) {
      if (!last) last = now;
      var dt = Math.min(42, now - last) / 16.7;
      last = now;
      ctx.clearRect(0, 0, W, H);
      ambient();
      var keep = [], i, p;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        p.life += dt;
        p.vy += p.grav * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y < -70 || p.y > H + 90 || p.x < -80 || p.x > W + 80) continue;
        if (draw(p)) keep.push(p);
      }
      parts = keep;
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (raf) return;
      size(); last = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop(ms) {
      setTimeout(function () {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        ctx.clearRect(0, 0, W, H);
        parts = [];
      }, ms || 0);
    }

    return { start: start, burst: burst, stop: stop };
  })();

  /* =========================================================
     合成音效（无外部文件）
     ========================================================= */
  var snd = (function () {
    var ac = null, master = null, muted = false;
    try { muted = localStorage.getItem(SOUND_KEY) === '0'; } catch (e) {}

    function ensure() {
      if (muted) return null;
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      if (!ac) {
        ac = new C();
        master = ac.createGain();
        master.gain.value = .5;
        master.connect(ac.destination);
      }
      if (ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
      return ac;
    }

    function noise(dur, f0, f1, gain) {
      var c = ensure(); if (!c) return;
      var len = Math.floor(c.sampleRate * dur);
      var buf = c.createBuffer(1, len, c.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) {
        var t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.2);
      }
      var src = c.createBufferSource(); src.buffer = buf;
      var flt = c.createBiquadFilter();
      flt.type = 'bandpass';
      flt.frequency.setValueAtTime(f0, c.currentTime);
      flt.frequency.exponentialRampToValueAtTime(f1, c.currentTime + dur);
      flt.Q.value = .8;
      var g = c.createGain();
      g.gain.setValueAtTime(gain || .5, c.currentTime);
      g.gain.exponentialRampToValueAtTime(.0008, c.currentTime + dur);
      src.connect(flt); flt.connect(g); g.connect(master);
      src.start();
    }

    function bell(freq, at, dur, gain) {
      var c = ensure(); if (!c) return;
      var t0 = c.currentTime + at;
      var o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      var o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.02;
      var g = c.createGain();
      g.gain.setValueAtTime(.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || .22, t0 + .012);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + (dur || 1.6));
      var g2 = c.createGain(); g2.gain.value = .32;
      o.connect(g); o2.connect(g2); g2.connect(g);
      g.connect(master);
      o.start(t0); o2.start(t0);
      o.stop(t0 + (dur || 1.6) + .1); o2.stop(t0 + (dur || 1.6) + .1);
    }

    return {
      warm: function () { ensure(); },
      isMuted: function () { return muted; },
      setMuted: function (v) {
        muted = v;
        try { localStorage.setItem(SOUND_KEY, v ? '0' : '1'); } catch (e) {}
        if (!v) ensure();
      },
      crack: function () { noise(.16, 2600, 700, .45); },
      paper: function () { noise(.55, 1500, 320, .32); noise(.34, 900, 220, .22); },
      chime: function () { bell(784, .02, 2.2, .16); bell(1046.5, .14, 2.0, .13); bell(1568, .3, 1.7, .08); },
      wrong: function () { noise(.2, 420, 160, .3); bell(196, 0, .5, .1); }
    };
  })();

  /* ---------- 声音开关 ---------- */
  var sndBtn = document.getElementById('gateSnd');
  function paintSnd() {
    if (!sndBtn) return;
    var on = !snd.isMuted();
    sndBtn.textContent = '声音 · ' + (on ? '开' : '关');
    sndBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  if (sndBtn) {
    paintSnd();
    sndBtn.addEventListener('click', function () {
      snd.setMuted(!snd.isMuted());
      paintSnd();
      if (!snd.isMuted()) { snd.warm(); snd.chime(); }
    });
  }

  /* ---------- 解锁时序 ---------- */
  function unlock() {
    busy = true;
    try { sessionStorage.setItem(ROOT_KEY, '1'); } catch (e) {}

    var seal = document.querySelector('.env-seal');
    var r = seal ? seal.getBoundingClientRect() : null;
    var gr = gate.getBoundingClientRect();

    form.classList.add('is-gone');
    snd.crack();
    if (r) { dust.start(); dust.burst(r.left - gr.left + r.width / 2, r.top - gr.top + r.height / 2, 30, .8); }

    setTimeout(function () { envelope.classList.add('is-open'); snd.paper(); }, 120);

    setTimeout(function () { envelope.classList.add('is-drawn'); }, 1000);

    setTimeout(function () {
      gate.classList.add('is-casting');
      dust.start();
      dust.burst(gr.width / 2, gr.height * .46, 72, 1.3);
      snd.chime();
    }, 1650);

    setTimeout(function () {
      dust.burst(gr.width / 2, gr.height * .46, 34, .9);
    }, 2400);

    setTimeout(function () {
      gate.classList.add('is-done');
      html.classList.remove('px-locked');
      html.classList.add('px-unlocked');
      try { window.scrollTo(0, 0); } catch (e) {}
      dust.stop(1500);
    }, 2650);

    setTimeout(function () {
      if (gate.parentNode) gate.parentNode.removeChild(gate);
    }, 3800);
  }

  /* ---------- 校验 ---------- */
  function submit() {
    if (busy) return;
    var val = (input.value || '').replace(/\D/g, '');
    if (val === PASS) { unlock(); return; }
    gate.classList.remove('is-shake');
    void gate.offsetWidth;
    gate.classList.add('is-shake');
    hint.textContent = val.length
      ? '启信密码不对，请核对后重试'
      : '请先输入八位启信密码';
    hint.classList.add('is-error');
    snd.wrong();
    input.focus({ preventScroll: true });
    input.select();
    setTimeout(function () { gate.classList.remove('is-shake'); }, 620);
  }

  /* ---------- 交互 ---------- */
  if (btn) btn.addEventListener('click', function () { snd.warm(); submit(); });

  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); snd.warm(); submit(); }
    });
    input.addEventListener('input', function () {
      var digits = (input.value || '').replace(/\D/g, '').slice(0, 8);
      if (digits !== input.value) input.value = digits;
      hint.textContent = '本页为剧本样稿，仅限受邀方查阅';
      hint.classList.remove('is-error');
      if (digits.length === 8) {
        snd.warm();
        setTimeout(function () { if ((input.value || '').length === 8) submit(); }, 220);
      }
    });
  }

  if (envelope) {
    envelope.addEventListener('click', function () {
      if (busy) return;
      snd.warm();
      if ((input.value || '').replace(/\D/g, '').length === 8) { submit(); return; }
      input.focus({ preventScroll: true });
      hint.textContent = '请先输入八位启信密码';
      hint.classList.remove('is-error');
    });
    envelope.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); envelope.click(); }
    });
  }

  setTimeout(function () {
    if (input && !busy) { try { input.focus({ preventScroll: true }); } catch (e) {} }
  }, 420);
})();
