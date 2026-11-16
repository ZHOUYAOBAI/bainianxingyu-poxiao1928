/* ============================================================
   展示站保护层
   · 导出／打印须凭导出口令（八位），口令正确后顶栏才出现「打印／导出」
   · 屏蔽常规截取：右键菜单、复制剪切、拖拽、另存为、查看源码、开发者工具
   · 失焦即模糊：切走标签／窗口时正文自动虚化，挡住「切走再截屏」与后台录屏
   · 未授权打印（浏览器菜单路径）输出虚化页
   边界说明：操作系统级截屏（PrtSc／录屏／手机拍照）网页层无法根治，
   真正可靠的边界仍是访问口令 + 不外传。
   ============================================================ */
(function () {
  'use strict';

  var EXPORT_PASS = '8888' + '8888';   /* 导出口令 */
  var KEY = 'px1928_export';
  var html = document.documentElement;

  function unlocked() {
    try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function markUnlocked() {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    html.classList.add('px-export');
  }

  /* ---------- 口令弹窗 ---------- */
  var modal, code, msg, okBtn, cancelBtn;

  function build() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'px-modal';
    modal.id = 'pxExportModal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="px-modal-box" role="dialog" aria-modal="true" aria-label="导出口令">' +
        '<p class="px-modal-title">导出口令</p>' +
        '<p class="px-modal-tip">导出与打印需要口令。</p>' +
        '<input class="px-modal-input" id="pxExportCode" type="password" inputmode="numeric" ' +
          'maxlength="8" placeholder="八位口令" autocomplete="off" spellcheck="false">' +
        '<p class="px-modal-msg" id="pxExportMsg"></p>' +
        '<div class="px-modal-btns">' +
          '<button type="button" class="px-modal-btn" id="pxExportCancel">取消</button>' +
          '<button type="button" class="px-modal-btn is-primary" id="pxExportOk">确认</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    code = modal.querySelector('#pxExportCode');
    msg = modal.querySelector('#pxExportMsg');
    okBtn = modal.querySelector('#pxExportOk');
    cancelBtn = modal.querySelector('#pxExportCancel');

    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    cancelBtn.addEventListener('click', close);
    okBtn.addEventListener('click', submit);
    code.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    code.addEventListener('input', function () {
      var d = code.value.replace(/\D/g, '').slice(0, 8);
      if (d !== code.value) code.value = d;
      if (msg.textContent) { msg.textContent = ''; msg.classList.remove('is-error'); }
    });
  }

  function open() {
    build();
    msg.textContent = '';
    msg.classList.remove('is-error');
    modal.hidden = false;
    html.classList.add('px-modal-open');
    try { code.value = ''; code.focus({ preventScroll: true }); } catch (e) {}
  }
  function close() {
    if (!modal) return;
    modal.hidden = true;
    html.classList.remove('px-modal-open');
  }
  function submit() {
    var v = (code.value || '').replace(/\D/g, '');
    if (v === EXPORT_PASS) {
      markUnlocked();
      close();
      doPrint();
      return;
    }
    msg.textContent = v.length ? '口令不对，请核对后重试' : '请先输入八位导出口令';
    msg.classList.add('is-error');
    modal.classList.remove('is-shake');
    void modal.offsetWidth;
    modal.classList.add('is-shake');
    try { code.focus({ preventScroll: true }); code.select(); } catch (e) {}
  }

  /* ---------- 导出入口 ---------- */
  var printOK = false;      /* 本次打印是否已授权 */
  var printing = false;     /* 打印流程进行中（打印面板会抢焦点，此时不虚化） */
  var printTimer = null;
  function markPrinting(on) {
    printing = on;
    if (printTimer) { clearTimeout(printTimer); printTimer = null; }
    if (on) printTimer = setTimeout(function () { printing = false; }, 8000);
  }
  function doPrint() {
    printOK = true;
    markPrinting(true);
    setTimeout(function () {
      window.print();
      setTimeout(function () { printOK = false; }, 1200);
    }, 60);
  }
  function requestExport() {
    if (unlocked()) { doPrint(); return; }
    open();
  }

  /* ---------- 屏蔽常规截取 ---------- */
  function inField(t) {
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  }

  document.addEventListener('contextmenu', function (e) {
    if (inField(e.target)) return;
    e.preventDefault();
  });

  document.addEventListener('copy', function (e) {
    if (inField(e.target)) return;
    e.preventDefault();
  });
  document.addEventListener('cut', function (e) {
    if (inField(e.target)) return;
    e.preventDefault();
  });
  document.addEventListener('selectstart', function (e) {
    if (inField(e.target)) return;
    e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) { e.preventDefault(); });

  document.addEventListener('keydown', function (e) {
    var k = e.key, mod = e.ctrlKey || e.metaKey, fld = inField(e.target);

    /* 系统截屏快捷键：PrtSc、macOS ⌘⇧3/4/5、Windows 徽标⇧S */
    if (k === 'PrintScreen' || e.code === 'PrintScreen') { e.preventDefault(); return; }
    if (mod && e.shiftKey && (/^Digit[3456]$/.test(e.code) || /^[3456]$/.test(k))) {
      e.preventDefault(); return;
    }
    if (mod && e.shiftKey && (k === 's' || k === 'S')) { e.preventDefault(); return; }

    if (k === 'F12') { e.preventDefault(); return; }
    if (mod && e.shiftKey && /^[IJC]$/i.test(k)) { e.preventDefault(); return; }
    if (mod && (k === 'u' || k === 'U')) { e.preventDefault(); return; }
    if (mod && (k === 's' || k === 'S')) { e.preventDefault(); return; }
    if (mod && !fld && (k === 'c' || k === 'C' || k === 'x' || k === 'X')) { e.preventDefault(); return; }
    if (mod && (k === 'p' || k === 'P')) { e.preventDefault(); requestExport(); return; }
  }, true);

  /* ---------- 失焦即模糊 ---------- */
  var veil = null;
  function ensureVeil() {
    if (veil) return;
    veil = document.createElement('div');
    veil.className = 'px-veil';
    veil.hidden = true;
    veil.setAttribute('aria-hidden', 'true');
    document.body.appendChild(veil);
  }
  function veilOn() {
    ensureVeil();
    veil.hidden = false;
    html.classList.add('px-blur');
  }
  function veilOff() {
    if (veil) veil.hidden = true;
    html.classList.remove('px-blur');
  }
  var veilTimer = null;
  function veilDelay() {
    if (veilTimer) clearTimeout(veilTimer);
    veilTimer = setTimeout(function () {
      veilTimer = null;
      if (printing) return;
      if (document.hidden || !document.hasFocus()) veilOn();
    }, 350);
  }
  function veilCancel() {
    if (veilTimer) { clearTimeout(veilTimer); veilTimer = null; }
    if (!document.hidden && document.hasFocus()) {
      markPrinting(false);      /* 回到页面即表示打印面板已关闭 */
      veilOff();
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (printing) return;
    if (document.hidden) veilOn();
    else veilCancel();
  });
  window.addEventListener('blur', veilDelay);
  window.addEventListener('focus', veilCancel);

  /* ---------- 打印：未授权则输出虚化页 ---------- */
  window.addEventListener('beforeprint', function () {
    markPrinting(true);
    veilOff();                       /* 打印预览需要看到清晰版面 */
    if (!printOK) html.classList.add('px-print-guard');
  });
  window.addEventListener('afterprint', function () {
    printOK = false;
    markPrinting(false);
    html.classList.remove('px-print-guard');
    if (document.hidden || !document.hasFocus()) veilOn(); else veilOff();
  });

  /* 顶栏「打印／导出」按钮：口令通过后才出现 */
  function bind() {
    if (unlocked()) markUnlocked();
    var btn = document.getElementById('printBtn');
    if (btn && !btn.dataset.pxBound) {
      btn.dataset.pxBound = '1';
      btn.addEventListener('click', requestExport);
    }
    var ex = document.getElementById('exportBtn');
    if (ex && !ex.dataset.pxBound) {
      ex.dataset.pxBound = '1';
      ex.addEventListener('click', function () {
        var d = document.getElementById('drawer');
        if (d) d.hidden = true;
        requestExport();
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();

  window.pxRequestExport = requestExport;
})();
