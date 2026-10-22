// Rash Editor module: core.js
// Loaded in order by index.html; classic scripts share the app scope.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const view = $('#view'), vctx = view.getContext('2d');
const stage = $('#stage');

// ---------- state ----------
const S = {
  w: 1200, h: 800, layers: [], active: 0, nextId: 1,
  scale: 1, px: 0, py: 0,
  tool: 'brush', size: 12, hard: 80, opacity: 100, tol: 32, fill: false, font: 'Vazirmatn', fsize: 48, bold: false,
  undo: [], redo: [], preview: null, overlay: null, wmMask: null,
};
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); };
const cur = () => S.layers[S.active];

function newLayer(name, fillColor) {
  const canvas = mk(S.w, S.h), ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (fillColor) { ctx.fillStyle = fillColor; ctx.fillRect(0, 0, S.w, S.h); }
  return { id: S.nextId++, name: name || 'لایه ' + S.nextId, canvas, ctx, visible: true, opacity: 100, blend: 'source-over', ox: 0, oy: 0 };
}
