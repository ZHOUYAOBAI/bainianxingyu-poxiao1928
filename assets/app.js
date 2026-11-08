/* ============================================================
   百年星语·破晓 1928 · 音乐剧数字剧本
   ============================================================ */
(function () {
  'use strict';
  var D = window.PX;
  if (!D) { console.error('数据未载入'); return; }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var el = function (tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* ───────────── 封面引用 ───────────── */
  (function hero() {
    var m = D.meta;
    var team = $('.hero-team .flag') || $('.hero-team');
    team.textContent = m.team;
    $('.hero-tag').textContent = m.tag;
    var c = $('.hero-credits');
    c.innerHTML = '';
    m.credits.forEach(function (p) {
      var s = el('span');
      s.appendChild(el('b', null, p[0]));
      s.appendChild(document.createTextNode(p[1]));
      c.appendChild(s);
    });
    var d = el('span', 'dim', m.date.replace(/[（）]/g, ''));
    c.appendChild(d);
  })();

  /* ───────────── 01 剧情简介 ───────────── */
  (function story() {
    var box = $('#storyBody');
    D.synopsis.forEach(function (p) {
      box.appendChild(el('p', null, p));
    });
  })();

  /* ───────────── 02 分幕导览（作者另稿《剧.docx》） ───────────── */
  (function guide() {
    var J = D.ju && D.ju.guide;
    if (!J) return;
    $('#guideLead').textContent = J.lead;
    var box = $('#guideActs');
    J.acts.forEach(function (a) {
      var card = el('div', 'g-act');
      var h = el('h3', 'g-act-title');
      h.appendChild(el('span', 'g-act-no', a.label));
      h.appendChild(el('span', 'g-act-name', a.title));
      card.appendChild(h);
      var meta = el('div', 'g-act-meta');
      [['时间', a.time], ['核心事件', a.event]].forEach(function (kv) {
        var pair = el('span', 'g-act-kv');
        pair.appendChild(el('span', 'g-act-k', kv[0]));
        pair.appendChild(el('span', 'g-act-v', kv[1]));
        meta.appendChild(pair);
      });
      card.appendChild(meta);
      var list = el('div', 'g-scenes');
      a.scenes.forEach(function (s) {
        var sc = el('div', 'g-scene');
        var sh = el('div', 'g-scene-head');
        sh.appendChild(el('span', 'g-scene-no', s.no));
        sh.appendChild(el('span', 'g-scene-name', '《' + s.name + '》'));
        sc.appendChild(sh);
        s.lines.forEach(function (L) {
          sc.appendChild(el('p', L.t === 'music' ? 'g-music' : 'g-plot', L.s));
        });
        list.appendChild(sc);
      });
      card.appendChild(list);
      box.appendChild(card);
    });
    var t = $('#guideRhythm');
    var thead = el('thead');
    var tr = el('tr');
    J.rhythm.head.forEach(function (h) { tr.appendChild(el('th', null, h)); });
    thead.appendChild(tr);
    t.appendChild(thead);
    var tb = el('tbody');
    J.rhythm.rows.forEach(function (r) {
      var row = el('tr');
      r.forEach(function (c) { row.appendChild(el('td', null, c)); });
      tb.appendChild(row);
    });
    t.appendChild(tb);
  })();

  /* ───────────── 08 创作意义（作者另稿《剧.docx》） ───────────── */
  (function meaning() {
    var M = D.ju && D.ju.meaning;
    if (!M) return;
    $('#meaningLabel').textContent = M.label;
    $('#meaningLead').textContent = M.lead;
    var st = $('#meaningStats');
    M.stats.forEach(function (p) {
      var d = el('div', 'm-stat');
      d.appendChild(el('b', 'm-stat-n', p[0]));
      d.appendChild(el('span', 'm-stat-l', p[1]));
      st.appendChild(d);
    });
    var box = $('#meaningPoints');
    M.points.forEach(function (p) {
      var c = el('div', 'm-point');
      var h = el('h3', 'm-point-title');
      h.appendChild(el('span', 'm-point-n', p.n));
      h.appendChild(el('span', 'm-point-t', p.title));
      c.appendChild(h);
      p.paras.forEach(function (t) { c.appendChild(el('p', 'm-para', t)); });
      if (p.listLead) {
        c.appendChild(el('p', 'm-list-lead', p.listLead));
        var ul = el('ul', 'm-list');
        p.list.forEach(function (li) { ul.appendChild(el('li', null, li)); });
        c.appendChild(ul);
      }
      box.appendChild(c);
    });
    $('#briefLabel').textContent = M.briefLabel;
    $('#briefNote').textContent = M.briefNote;
    $('#briefText').textContent = M.brief;
  })();

  /* ───────────── 02 人物表 ───────────── */
  var castCat = function (v) {
    v = v || '';
    if (/童声/.test(v)) return '童声';
    if (/合唱|群|人声/.test(v)) return '合唱群';
    if (/不唱|说白|说话|旁白/.test(v)) return '说白';
    if (/女/.test(v)) return '女声';
    if (/男/.test(v)) return '男声';
    return '其他';
  };
  var castFilter = '全部', castQuery = '';

  function renderCast() {
    var tb = $('#castTable tbody');
    tb.innerHTML = '';
    var shown = 0;
    D.roster.forEach(function (c) {
      var cat = castCat(c.voice);
      if (castFilter !== '全部' && cat !== castFilter) return;
      if (castQuery) {
        var hay = (c.name + c.role + c.voice + c.age).toLowerCase();
        if (hay.indexOf(castQuery.toLowerCase()) < 0) return;
      }
      shown++;
      var tr = el('tr');
      var td0 = el('td');
      var b = el('button', null, c.name);
      b.type = 'button';
      b.dataset.who = c.name;
      b.title = '在正文中高亮「' + c.name + '」';
      b.addEventListener('click', function () { toggleRole(c.name); });
      td0.appendChild(b);
      if (/虚声/.test(c.name)) {
        var sp = el('span', 'who-note', '（虚声）');
        td0.appendChild(sp);
      }
      tr.appendChild(td0);
      tr.appendChild(el('td', null, c.role));
      tr.appendChild(el('td', null, c.voice));
      tr.appendChild(el('td', null, c.age));
      tb.appendChild(tr);
    });
    $('#castNote').textContent = D.notes.join(' ');
    $('#castNote').textContent += shown < D.roster.length ? '　当前显示 ' + shown + ' / ' + D.roster.length + ' 人。' : '';
  }

  function renderCastFilters() {
    var box = $('#castFilters');
    var cats = ['全部'];
    D.roster.forEach(function (c) {
      var k = castCat(c.voice);
      if (cats.indexOf(k) < 0) cats.push(k);
    });
    cats.forEach(function (k) {
      var b = el('button', 'chip' + (k === castFilter ? ' on' : ''), k);
      b.type = 'button';
      b.addEventListener('click', function () {
        castFilter = k;
        $$('#castFilters .chip').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        renderCast();
      });
      box.appendChild(b);
    });
  }

  (function castIndex() {
    var tb = $('#castIndex tbody');
    D.index_rows.forEach(function (c) {
      var tr = el('tr');
      tr.appendChild(el('td', null, c.name));
      tr.appendChild(el('td', null, c.role));
      tr.appendChild(el('td', null, c.voice));
      tr.appendChild(el('td', null, c.note));
      tb.appendChild(tr);
    });
  })();

  /* ───────────── 03 分曲表 ───────────── */
  var songFilter = '全部', songQuery = '';

  function renderSongs() {
    var tb = $('#songTable tbody');
    tb.innerHTML = '';
    D.songs.forEach(function (s) {
      if (songFilter !== '全部' && s.form !== songFilter) return;
      if (songQuery) {
        var hay = (s.no + s.title + s.form + s.singer + s.key + s.tempo).toLowerCase();
        if (hay.indexOf(songQuery.toLowerCase()) < 0) return;
      }
      var tr = el('tr');
      tr.dataset.no = s.no;
      tr.appendChild(el('td', null, 'No. ' + s.no));
      tr.appendChild(el('td', null, s.title));
      tr.appendChild(el('td', 'form', s.form));
      tr.appendChild(el('td', null, s.singer));
      tr.appendChild(el('td', null, s.key));
      tr.appendChild(el('td', null, s.meter));
      tr.appendChild(el('td', null, s.tempo));
      tr.appendChild(el('td', null, s.dur || '—'));
      tr.addEventListener('click', function () { gotoSong(s.no); });
      tb.appendChild(tr);
    });
  }

  (function songSummary() {
    var n = $('#songSummary');
    if (n && D.song_summary) n.textContent = D.song_summary;
  })();

  function renderSongFilters() {
    var box = $('#songFilters');
    var cats = ['全部'];
    D.songs.forEach(function (s) { if (cats.indexOf(s.form) < 0) cats.push(s.form); });
    cats.forEach(function (k) {
      var b = el('button', 'chip' + (k === songFilter ? ' on' : ''), k);
      b.type = 'button';
      b.addEventListener('click', function () {
        songFilter = k;
        $$('#songFilters .chip').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        renderSongs();
      });
      box.appendChild(b);
    });
  }

  var lastSong = null;
  function gotoSong(no) {
    var t = $('#no-' + no);
    if (!t) return;
    t.scrollIntoView({ behavior: 'smooth', block: 'center' });
    t.classList.add('hit');
    $$('.song.hit').forEach(function (x) { if (x !== t) x.classList.remove('hit'); });
    setTimeout(function () { t.classList.remove('hit'); }, 2400);
    if (lastSong) lastSong.classList.remove('on');
    var row = $('#songTable tbody tr[data-no="' + no + '"]');
    if (row) { row.classList.add('on'); lastSong = row; }
  }

  /* ───────────── 04 剧本正文 ───────────── */
  function renderItem(it) {
    if (it.type === 'prose') return el('div', 'prose', it.text);
    if (it.type === 'narration') return el('div', 'narration', it.text);
    if (it.type === 'sd') return el('div', 'sd', it.text);
    if (it.type === 'curtain') return el('div', 'curtain', '（' + it.text + '）');
    if (it.type === 'say') {
      var d = el('div', 'say');
      d.dataset.who = it.who;
      var w = el('span', 'say-who', it.who);
      var tx = el('span', 'say-tex');
      if (it.paren) {
        var p = el('span', 'paren', '（' + it.paren + '）');
        tx.appendChild(p);
      }
      tx.appendChild(document.createTextNode(it.text));
      d.appendChild(w); d.appendChild(tx);
      return d;
    }
    return null;
  }

  function renderItems(items) {
    var frag = document.createDocumentFragment();
    var i = 0;
    while (i < items.length) {
      var it = items[i];
      /* 唱词：连续的 lyric 归为一组，组名取该组首行的演唱者 */
      if (it.type === 'lyric' || it.type === 'speaker' || it.type === 'singcue') {
        var g = el('div', 'lyric-group');
        var who = it.who || '';
        if (who) { g.dataset.who = who; g.appendChild(el('span', 'lyric-who', who)); }
        var lines = el('p', 'lyric-lines');
        var j = i;
        if (it.type === 'speaker') j++;                 // 跳过纯标签行
        if (it.type === 'singcue') {
          var cue = el('span', 'cue', '（' + it.paren + '）');
          g.appendChild(cue);
          if (it.text) lines.appendChild(el('span', null, it.text));
          j++;
        }
        while (j < items.length && items[j].type === 'lyric') {
          lines.appendChild(el('span', null, items[j].text));
          j++;
        }
        if (j < items.length && items[j].type === 'rhyme') {
          var zh = items[j].text != null ? items[j].text : items[j].zh;
          g.appendChild(el('span', 'rhyme', zh ? '（' + zh + '）' : ''));
          j++;
        }
        g.appendChild(lines);
        frag.appendChild(g);
        i = j;
        continue;
      }
      if (it.type === 'rhyme') { i++; continue; }
      var n = renderItem(it);
      if (n) frag.appendChild(n);
      i++;
    }
    return frag;
  }

  function renderScript() {
    var body = $('#scriptBody');
    body.innerHTML = '';
    D.acts.forEach(function (a, ai) {
      var art = el('article', 'act');
      art.id = 'act-' + (ai + 1);
      var head = el('header', 'act-head');
      head.appendChild(el('span', 'act-no', a.label));
      head.appendChild(el('h2', null, a.sub));
      var yr = a.sub.match(/（(.+?)）/);
      head.appendChild(el('span', 'act-year', yr ? yr[1] : ''));
      art.appendChild(head);

      a.blocks.forEach(function (b) {
        if (b.t === 'scene') {
          var sec = el('section', 'scene');
          sec.id = 'sc-' + b.no;
          sec.dataset.block = '1';
          var sh = el('header', 'scene-head');
          sh.appendChild(el('span', 'scene-no', '场 ' + b.no));
          if (b.insert) sh.appendChild(el('span', 'scene-ins', b.insert));
          sh.appendChild(el('h3', null, b.place));
          if (b.time) sh.appendChild(el('span', 'scene-time', b.time));
          sec.appendChild(sh);
          sec.appendChild(renderItems(b.items));
          art.appendChild(sec);
          return;
        }
        if (b.t === 'song') {
          var so = el('section', 'song');
          so.id = 'no-' + b.no;
          so.dataset.block = '1';
          var hh = el('header', 'song-head');
          hh.appendChild(el('span', 'song-no', 'No. ' + b.no));
          hh.appendChild(el('h4', null, b.title));
          if (b.form) hh.appendChild(el('span', 'song-form', b.form));
          if (b.singer) hh.appendChild(el('span', 'song-singer', b.singer));
          var meta = el('ul', 'song-meta');
          [b.key, b.meter, b.tempo, b.dur].forEach(function (v) {
            if (v) meta.appendChild(el('li', null, v));
          });
          if (meta.children.length) hh.appendChild(meta);
          var fold = el('button', 'fold', '▾');
          fold.type = 'button';
          fold.title = '收起／展开';
          fold.addEventListener('click', function () { so.classList.toggle('folded'); });
          hh.appendChild(fold);
          so.appendChild(hh);
          var sb = el('div', 'song-body');
          sb.appendChild(renderItems(b.items));
          so.appendChild(sb);
          art.appendChild(so);
          return;
        }
        if (b.t === 'curtain') {
          var cu = el('div', 'curtain');
          cu.appendChild(el('span', null, '（' + b.text + '）'));
          art.appendChild(cu);
          return;
        }
        if (b.t === 'open' && b.items.length) {
          var op = el('div', 'cont');
          op.dataset.block = '1';
          op.appendChild(renderItems(b.items));
          art.appendChild(op);
        }
      });
      body.appendChild(art);
    });
  }

  function renderActNav() {
    var nav = $('#actnav');
    D.acts.forEach(function (a, ai) {
      var l = el('a', null, a.label + ' · ' + a.sub.split('（')[0]);
      l.href = '#act-' + (ai + 1);
      nav.appendChild(l);
    });
  }

  /* ───────────── 角色高亮 ───────────── */
  var role = null;
  function toggleRole(name) {
    if (role === name) { role = null; document.body.classList.remove('rolemode'); }
    else { role = name; document.body.classList.add('rolemode'); }
    applyRole();
    var btn = $('#clearRole');
    if (role) { btn.hidden = false; btn.textContent = '取消高亮：' + role; }
    else btn.hidden = true;
  }
  function applyRole() {
    $$('.lyric-group, .say').forEach(function (n) {
      n.classList.toggle('hit', !!role && n.dataset.who === role);
    });
  }

  /* ───────────── 正文检索 ───────────── */
  function clearMarks(root) {
    $$('mark', root).forEach(function (m) {
      var p = m.parentNode;
      p.replaceChild(document.createTextNode(m.textContent), m);
      p.normalize();
    });
  }
  function markIn(root, q) {
    if (!q) return 0;
    var count = 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var targets = [];
    var n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      if (n.parentNode && n.parentNode.nodeName === 'MARK') continue;
      targets.push(n);
    }
    targets.forEach(function (node) {
      var txt = node.nodeValue;
      var lower = txt.toLowerCase(), needle = q.toLowerCase();
      var idx = lower.indexOf(needle);
      if (idx < 0) return;
      var frag = document.createDocumentFragment();
      var pos = 0;
      while (idx >= 0) {
        if (idx > pos) frag.appendChild(document.createTextNode(txt.slice(pos, idx)));
        var mk = el('mark', null, txt.substr(idx, q.length));
        frag.appendChild(mk);
        count++;
        pos = idx + q.length;
        idx = lower.indexOf(needle, pos);
      }
      if (pos < txt.length) frag.appendChild(document.createTextNode(txt.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
    return count;
  }

  var scriptQuery = '';
  function runScriptSearch() {
    var root = $('#scriptBody');
    clearMarks(root);
    var blocks = $$('[data-block]', root);
    var q = scriptQuery.trim();
    if (!q) {
      blocks.forEach(function (b) { b.style.display = ''; });
      $('#hitCounter').textContent = '';
      return;
    }
    var hits = 0, shown = 0;
    blocks.forEach(function (b) {
      var txt = b.textContent.toLowerCase();
      if (txt.indexOf(q.toLowerCase()) < 0) { b.style.display = 'none'; return; }
      b.style.display = '';
      shown++;
      hits += markIn(b, q);
    });
    $('#hitCounter').textContent = '命中 ' + hits + ' 处 · ' + shown + ' 个段落';
  }

  /* ───────────── 05 年表 ───────────── */
  var TL = [
    { y: '1928.10.13', w: '夜', t: '蒙自芷村一间茅屋，十七名代表围着马灯开会。吴澄主持会议，把「谁没有地、地要回到谁手里」写进决议。', ref: '第一幕 场 2 · No. 3 凝聚' },
    { y: '1928.10.13', w: '同夜后段', t: '搜查队随后进门，草堆里的会议记录险些被翻出来。', ref: '第一幕 场 3 · No. 4 守夜人' },
    { y: '1929', w: '此后两年', t: '她和李国柱办《女声》、建联络点、织红心布，把三颗星是安全、两颗星是危险定为暗号。', ref: '第二幕 场 5–7 · No. 10–16' },
    { y: '1930.11', w: '冬', t: '敌人在蒙自苗寨凭针脚认出那块布，她被捕。', ref: '第三幕 场 7B · No. 16B 火不说话' },
    { y: '1930.12.31', w: '清晨', t: '吴澄、王德三、李国柱、张经辰四人唱完《国际歌》，走向昆明北郊地台刑场。她怀着孩子，进牢房前刚把十七个寨子的名单烧尽。', ref: '第三幕 场 8–9 · No. 19–23', now: true },
    { y: '2024.09.29', w: '下午', t: '纪念馆「火种」特展区的改造方案当天下午就要上报：文物要不要移进恒温库，红心布要不要做成纪念品，直播镜头该不该对着展柜。', ref: '序幕 场 1 · No. 1–2' },
    { y: '2024.09.30', w: '烈士纪念日', t: '批复下来。终幕跨时空同框，吴小芸按住苏云的手，不让任何人替死者绣上那颗星。', ref: '第三幕 场 10 · No. 24–26' },
    { y: '2026.07', w: '夏', t: '十八岁的小满回到同一排展柜前，把军校录取通知书折成四折，压在第三颗星的位置底下。母亲替父亲说了十二年的话，终于不必再说。', ref: '终幕·下半 · No. 27 第三颗星', now: true }
  ];
  (function timeline() {
    var ol = $('#tl');
    var inner = el('div', 'tl-inner');
    TL.forEach(function (n) {
      var li = el('li');
      if (n.now) li.className = 'now';
      li.appendChild(el('span', 'dot'));
      li.appendChild(el('div', 'yr', n.y));
      li.appendChild(el('div', 'wh', n.w));
      li.appendChild(el('div', 'tx', n.t));
      li.appendChild(el('div', 'li', n.ref));
      inner.appendChild(li);
    });
    ol.appendChild(inner);
  })();

  /* ───────────── 06 制作 ───────────── */
  (function credits() {
    var dl = $('#endCredits');
    D.meta.credits.forEach(function (c) {
      dl.appendChild(el('dt', null, c[0]));
      dl.appendChild(el('dd', null, c[1]));
    });
    dl.appendChild(el('dt', null, '出品'));
    dl.appendChild(el('dd', null, D.meta.team.replace('原创红色音乐剧', '').trim()));
    dl.appendChild(el('dt', null, '版本'));
    dl.appendChild(el('dd', null, D.meta.format + '　' + D.meta.date.replace(/[（）]/g, '')));
  })();

  /* ───────────── 交互装配 ───────────── */
  renderCastFilters(); renderCast();
  renderSongFilters(); renderSongs();
  renderScript(); renderActNav();

  $('#castSearch').addEventListener('input', function (e) {
    castQuery = e.target.value.trim(); renderCast();
  });
  $('#songSearch').addEventListener('input', function (e) {
    songQuery = e.target.value.trim(); renderSongs();
  });
  $('#scriptSearch').addEventListener('input', function (e) {
    scriptQuery = e.target.value; runScriptSearch();
  });
  $('#clearRole').addEventListener('click', function () {
    if (role) toggleRole(role);
  });

  $('#foldAll').addEventListener('click', function () {
    $$('.song').forEach(function (s) { s.classList.add('folded'); });
    this.textContent = '全部展开';
    this.dataset.mode = 'fold';
  });
  $('#expandAll').addEventListener('click', function () {
    $$('.song').forEach(function (s) { s.classList.remove('folded'); });
    this.textContent = '全部收起';
    this.dataset.mode = 'expand';
  });

  /* 字号 */
  var fs = parseFloat(localStorage.getItem('px-fs') || 16);
  function setFs(v) {
    fs = Math.max(14, Math.min(22, v));
    document.documentElement.style.setProperty('--fs', fs + 'px');
    localStorage.setItem('px-fs', fs);
  }
  setFs(fs);
  $('#fontUp').addEventListener('click', function () { setFs(fs + 1); });
  $('#fontDown').addEventListener('click', function () { setFs(fs - 1); });

  /* 抽屉 */
  var drawer = $('#drawer');
  $('#menuBtn').addEventListener('click', function () {
    drawer.hidden = !drawer.hidden;
  });
  drawer.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') drawer.hidden = true;
  });

  /* 打印 */
  $('#printBtn').addEventListener('click', function () { window.print(); });

  /* 进度条 */
  var prog = $('#progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 滚动高亮 */
  var topnav = $('#topnav');
  var actnav = $('#actnav');
  var sections = ['story', 'guide', 'people', 'score', 'script', 'timeline', 'star', 'meaning', 'end'].map(function (id) {
    return document.getElementById(id);
  });
  var acts = $$('.act');
  function spy() {
    var y = window.scrollY + 140;
    var cur = '';
    sections.forEach(function (s) {
      if (s && s.offsetTop <= y) cur = s.id;
    });
    $$('a', topnav).forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('href') === '#' + cur);
    });
    var act = '';
    acts.forEach(function (a) { if (a.offsetTop <= y) act = a.id; });
    $$('a', actnav).forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('href') === '#' + act);
    });
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* 绣：第三颗星的针脚 */
  var needle = $('#needle');
  if (needle) {
    var svg = needle.ownerSVGElement;
    var pt = svg.createSVGPoint();
    function place(x, y, rot) {
      pt.x = x; pt.y = y;
      var m = svg.getScreenCTM().inverse();
      var p = pt.matrixTransform(m);
      needle.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ') rotate(' + rot + ')');
    }
    place(149, 206, 0);
    window.addEventListener('resize', function () { place(149, 206, 0); });
    needle.style.transition = 'transform .6s cubic-bezier(.22,.61,.36,1)';
    window.addEventListener('scroll', function () {
      var r = svg.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        var t = (window.innerHeight - r.top) / (window.innerHeight + r.height);
        place(149 + t * 0, 206 - t * 46, -t * 26);
      }
    }, { passive: true });
  }
})();
