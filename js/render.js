// Rash Editor module: render.js
// Loaded in order by index.html; classic scripts share the app scope.
// ---------- render ----------
let raf = 0;
function render() { if (!raf) raf = requestAnimationFrame(draw); }
function draw() {
  raf = 0;
  const d = window.devicePixelRatio || 1, c = vctx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, view.width, view.height);
  c.setTransform(d * S.scale, 0, 0, d * S.scale, d * S.px, d * S.py);
  // checkerboard
  c.save(); c.beginPath(); c.rect(0, 0, S.w, S.h); c.clip();
  const g = 10 / Math.max(S.scale, 0.5);
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, S.w, S.h); c.fillStyle = '#d6d6dc';
  for (let y = 0, j = 0; y < S.h; y += g, j++) for (let x = (j % 2) * g; x < S.w; x += g * 2) c.fillRect(x, y, g, g);
  c.imageSmoothingEnabled = S.scale < 1;
  S.layers.forEach((l, i) => {
    if (!l.visible) return;
    c.globalAlpha = l.opacity / 100; c.globalCompositeOperation = l.blend;
    c.filter = (S.preview && i === S.active) ? S.preview : 'none';
    c.drawImage(l.canvas, l.ox, l.oy);
  });
  c.restore();
  if (S.wmMask) { c.save(); c.globalAlpha = .48; c.drawImage(S.wmMask, 0, 0); c.restore(); }
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.lineWidth = 1 / S.scale; c.strokeStyle = 'rgba(128,128,140,.6)'; c.strokeRect(0, 0, S.w, S.h);
  if (S.overlay) S.overlay(c);
  $('#sZoom').textContent = Math.round(S.scale * 100) + '٪';
  $('#sSize').textContent = S.w + ' × ' + S.h + ' px';
  $('#sTool').textContent = toolNames[S.tool] || '';
}
