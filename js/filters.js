// Rash Editor module: filters.js
// Loaded in order by index.html; classic scripts share the app scope.
// ---------- filters ----------
const sl = { fBr: 0, fCo: 0, fSa: 0, fHu: 0, fBl: 0 };
const fstr = () => `brightness(${1 + sl.fBr / 100}) contrast(${1 + sl.fCo / 100}) saturate(${1 + sl.fSa / 100}) hue-rotate(${sl.fHu}deg) blur(${sl.fBl}px)`;
Object.keys(sl).forEach(id => {
  const i = $('#' + id), o = i.nextElementSibling; o.textContent = i.value;
  i.oninput = () => { sl[id] = +i.value; o.textContent = i.value; S.preview = Object.values(sl).some(v => v) ? fstr() : null; render(); };
});
function applyFilter(f) {
  const l = cur(); const c = mk(l.canvas.width, l.canvas.height), x = c.getContext('2d', { willReadFrequently: true });
  x.filter = f; x.drawImage(l.canvas, 0, 0); l.canvas = c; l.ctx = x;
}
function resetSliders() { Object.keys(sl).forEach(id => { sl[id] = 0; const i = $('#' + id); i.value = 0; i.nextElementSibling.textContent = 0; }); S.preview = null; render(); }
$('#fApply').onclick = () => { if (!S.preview) return toast('اول یک تنظیم را تغییر دهید'); applyFilter(S.preview); resetSliders(); refreshAll(); commit(); };
$('#fReset').onclick = resetSliders;
function sharpen(l) {
  const w = l.canvas.width, h = l.canvas.height, img = l.ctx.getImageData(0, 0, w, h), s = img.data, o = new Uint8ClampedArray(s), k = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) for (let c = 0; c < 3; c++) {
    let v = 0, n = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) v += s[((y + j) * w + x + i) * 4 + c] * k[n++];
    o[(y * w + x) * 4 + c] = v;
  }
  img.data.set(o); l.ctx.putImageData(img, 0, 0);
}
$$('[data-fx]').forEach(b => b.onclick = () => {
  const l = cur(), fx = b.dataset.fx; if (!l) return;
  if (fx === 'gray') applyFilter('grayscale(1)'); else if (fx === 'sepia') applyFilter('sepia(1)'); else if (fx === 'invert') applyFilter('invert(1)');
  else if (fx === 'sharpen') sharpen(l);
  else {
    S.layers.forEach(L => {
      const rot = fx === 'rotate', c = rot ? mk(L.canvas.height, L.canvas.width) : mk(L.canvas.width, L.canvas.height), x = c.getContext('2d', { willReadFrequently: true });
      x.save();
      if (fx === 'flipH') { x.translate(c.width, 0); x.scale(-1, 1); } else if (fx === 'flipV') { x.translate(0, c.height); x.scale(1, -1); } else { x.translate(c.width, 0); x.rotate(Math.PI / 2); }
      x.drawImage(L.canvas, 0, 0); x.restore(); L.canvas = c; L.ctx = x;
    });
    if (fx === 'rotate') { [S.w, S.h] = [S.h, S.w]; fit(); }
  }
  refreshAll(); commit();
});
