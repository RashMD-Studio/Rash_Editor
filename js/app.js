// Rash Editor module: app.js
// Loaded in order by index.html; classic scripts share the app scope.
// ---------- misc wiring ----------
$('#mUndo').onclick = undo; $('#mRedo').onclick = redo; $('#mFit').onclick = fit;
$('#m100').onclick = () => { const r = stage.getBoundingClientRect(); S.scale = 1; S.px = (r.width - S.w) / 2; S.py = (r.height - S.h) / 2; render(); };
$$('#tools [data-tool]').forEach(b => b.onclick = () => setTool(b.dataset.tool));
$('#fg').oninput = () => { if (S.tool === 'text') styleText(); };
const keys = { v: 'move', b: 'brush', e: 'eraser', g: 'fill', i: 'picker', r: 'rect', o: 'ellipse', l: 'line', t: 'text', c: 'crop', h: 'hand' };
document.addEventListener('keydown', e => {
  // Keep native editing shortcuts inside text fields; editor shortcuts work elsewhere.
  if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) && e.target.type !== 'range' && e.target.type !== 'color') return;
  const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
  if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && k === 'y') { e.preventDefault(); redo(); return; }
  if (mod && k === 'o') { e.preventDefault(); $('#mOpen').click(); return; }
  if (mod && k === 'n') { e.preventDefault(); $('#mNew').click(); return; }
  if (mod && k === '0') { e.preventDefault(); fit(); return; }
  if (mod && (k === '=' || k === '+')) { e.preventDefault(); const r = view.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1.2); return; }
  if (mod && k === '-') { e.preventDefault(); const r = view.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1 / 1.2); return; }
  if (mod || e.altKey) return;
  if (k === ' ') { space = true; e.preventDefault(); view.style.cursor = 'grab'; return; }
  if (k === 'x') { const a = $('#fg'), b = $('#bg2'); [a.value, b.value] = [b.value, a.value]; return; }
  if (k === '[') { S.size = Math.max(1, S.size - 4); setTool(S.tool); return; }
  if (k === ']') { S.size = Math.min(200, S.size + 4); setTool(S.tool); return; }
  if (k === 'enter' && S.tool === 'crop') applyCrop();
  if (keys[k]) setTool(keys[k]);
});
document.addEventListener('keyup', e => { if (e.key === ' ') { space = false; setTool(S.tool); } });
new ResizeObserver(() => { const keep = S.layers.length; resizeView(); if (keep && !resizeView.once) { resizeView.once = 1; fit(); } }).observe(stage);

// ---------- startup: start with one transparent editable layer ----------
(function initEditor() {
  S.layers = [newLayer('لایه ۱', null)];
  S.active = 0;
  renderLayers();
  syncLayerCtl();
  setTool('brush');
  resizeView();
  fit();
  commit();
  syncHist();
})();

// Save shortcut
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    $('#mExport').click();
  }
});
