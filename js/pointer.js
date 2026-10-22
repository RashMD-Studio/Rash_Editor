// Rash Editor module: pointer.js
// Loaded in order by index.html; classic scripts share the app scope.
// ---------- pointer ----------
let drag = null, space = false;
view.addEventListener('pointerdown', e => {
  view.setPointerCapture(e.pointerId);
  const p = toDoc(e), l = cur(), t = S.tool;
  if (tb.style.display === 'block') commitText();
  if (e.button === 1 || space || t === 'hand') { drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, px: S.px, py: S.py }; view.style.cursor = 'grabbing'; return; }
  if (!l || !l.visible) { toast('لایه فعال مخفی است'); return; }
  if (t === 'watermark') {
    ensureWatermarkMask(); paintWatermarkMask(p, p); drag = { mode: 'watermark', last: p }; render();
  } else if (t === 'brush' || t === 'eraser') {
    const tp = tip(fgc(), S.size, S.hard, t === 'eraser'); drag = { mode: 'paint', tip: tp, last: p };
    stamp(l, tp, p, p, t === 'eraser'); render();
  } else if (t === 'fill') { floodFill(l, p.x, p.y, fgc(), S.tol); renderLayers(); render(); commit(); }
  else if (t === 'picker') {
    const x = Math.floor(p.x), y = Math.floor(p.y);
    if (x >= 0 && y >= 0 && x < S.w && y < S.h) { const d = flatten().getContext('2d').getImageData(x, y, 1, 1).data; $('#fg').value = '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''); toast('رنگ برداشته شد'); }
  }
  else if (['rect', 'ellipse', 'line'].includes(t)) drag = { mode: 'shape', a: p, b: p };
  else if (t === 'move') drag = { mode: 'move', a: p };
  else if (t === 'crop') { drag = { mode: 'crop', a: p }; cropRect = { a: p, b: p }; }
  else if (t === 'text') showText(p, e);
});
view.addEventListener('pointermove', e => {
  const p = toDoc(e); $('#sPos').textContent = `x: ${Math.round(p.x)}  y: ${Math.round(p.y)}`;
  if (!drag) return;
  const l = cur();
  if (drag.mode === 'pan') { S.px = drag.px + e.clientX - drag.sx; S.py = drag.py + e.clientY - drag.sy; render(); }
  else if (drag.mode === 'watermark') { paintWatermarkMask(drag.last, p); drag.last = p; render(); }
  else if (drag.mode === 'paint') { stamp(l, drag.tip, drag.last, p, S.tool === 'eraser'); drag.last = p; render(); }
  else if (drag.mode === 'shape') {
    drag.b = e.shiftKey && S.tool !== 'line' ? { x: drag.a.x + Math.sign(p.x - drag.a.x) * Math.max(Math.abs(p.x - drag.a.x), Math.abs(p.y - drag.a.y)), y: drag.a.y + Math.sign(p.y - drag.a.y) * Math.max(Math.abs(p.x - drag.a.x), Math.abs(p.y - drag.a.y)) } : p;
    S.overlay = c => drawShape(c, S.tool, drag.a, drag.b, fgc(), S.size, S.fill); render();
  }
  else if (drag.mode === 'move') { l.ox = p.x - drag.a.x; l.oy = p.y - drag.a.y; render(); }
  else if (drag.mode === 'crop') {
    cropRect.b = p;
    S.overlay = c => {
      const x = Math.min(cropRect.a.x, p.x), y = Math.min(cropRect.a.y, p.y), w = Math.abs(p.x - cropRect.a.x), h = Math.abs(p.y - cropRect.a.y);
      c.save(); c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.rect(-5000, -5000, 10000 + S.w, 10000 + S.h); c.rect(x, y, w, h); c.fill('evenodd');
      c.strokeStyle = '#fff'; c.lineWidth = 1.5 / S.scale; c.setLineDash([6 / S.scale, 4 / S.scale]); c.strokeRect(x, y, w, h); c.restore();
    }; render();
  }
});
function endDrag() {
  if (!drag) return; const l = cur(), m = drag.mode;
  if (m === 'pan') view.style.cursor = S.tool === 'hand' ? 'grab' : 'crosshair';
  if (m === 'watermark') { render(); }
  if (m === 'paint') { renderLayers(); commit(); }
  if (m === 'shape') { drawShape(l.ctx, S.tool, drag.a, drag.b, fgc(), S.size, S.fill); S.overlay = null; renderLayers(); render(); commit(); }
  if (m === 'move') {
    const dx = Math.round(l.ox), dy = Math.round(l.oy);
    if (dx || dy) { const c = mk(S.w, S.h), x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(l.canvas, dx, dy); l.canvas = c; l.ctx = x; }
    l.ox = l.oy = 0; renderLayers(); render(); if (dx || dy) commit();
  }
  drag = null;
}
view.addEventListener('pointerup', endDrag); view.addEventListener('pointercancel', endDrag);
view.addEventListener('wheel', e => {
  e.preventDefault(); const r = view.getBoundingClientRect();
  zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
}, { passive: false });
