// Rash Editor module: tools.js
// Loaded in order by index.html; classic scripts share the app scope.
// ---------- tools ----------
const toolNames = { move: 'جابجایی', brush: 'قلم‌مو', eraser: 'پاک‌کن', fill: 'سطل رنگ', picker: 'قطره‌چکان', rect: 'مستطیل', ellipse: 'بیضی', line: 'خط', text: 'متن', crop: 'برش', watermark: 'حذف واترمارک', hand: 'دست' };
const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const fgc = () => $('#fg').value;

function rangeOpt(label, key, min, max, suffix = '') {
  const l = document.createElement('label'), i = document.createElement('input'), o = document.createElement('output');
  i.type = 'range'; i.min = min; i.max = max; i.value = S[key]; o.textContent = S[key] + suffix; o.style.cssText = 'width:44px;font-family:var(--font-mono);font-size:11px';
  i.oninput = () => { S[key] = +i.value; o.textContent = S[key] + suffix; };
  l.append(label, i, o); return l;
}
function checkOpt(label, key) {
  const l = document.createElement('label'), i = document.createElement('input'); i.type = 'checkbox'; i.checked = S[key];
  i.onchange = () => S[key] = i.checked; l.append(i, label); return l;
}
function setTool(t) {
  S.tool = t; S.overlay = null; hideText();
  $$('#tools [data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  const o = $('#opts'); o.textContent = '';
  if (t === 'brush') o.append(rangeOpt('اندازه', 'size', 1, 200, 'px'), rangeOpt('نرمی لبه', 'hard', 0, 100, '٪'), rangeOpt('شفافیت', 'opacity', 1, 100, '٪'));
  if (t === 'eraser') o.append(rangeOpt('اندازه', 'size', 1, 200, 'px'), rangeOpt('نرمی لبه', 'hard', 0, 100, '٪'), rangeOpt('قدرت', 'opacity', 1, 100, '٪'));
  if (t === 'fill') o.append(rangeOpt('تلورانس', 'tol', 0, 255));
  if (['rect', 'ellipse', 'line'].includes(t)) { o.append(rangeOpt('ضخامت', 'size', 1, 100, 'px')); if (t !== 'line') o.append(checkOpt('توپر', 'fill')); }
  if (t === 'text') {
    const f = document.createElement('select');
    ['Vazirmatn', 'Tahoma', 'Arial', 'Georgia', 'Courier New', 'Impact'].forEach(n => f.add(new Option(n, n)));
    f.value = S.font; f.onchange = () => { S.font = f.value; styleText(); };
    const lf = document.createElement('label'); lf.append('فونت', f);
    const fs = rangeOpt('اندازه', 'fsize', 8, 300, 'px'); fs.querySelector('input').addEventListener('input', styleText);
    o.append(lf, fs, checkOpt('ضخیم', 'bold')); o.lastChild.querySelector('input').addEventListener('change', styleText);
  }
  if (t === 'crop') { const b = document.createElement('button'); b.textContent = 'اعمال برش'; b.className = 'primary'; b.onclick = applyCrop; o.append(b); }
  if (t === 'watermark') {
    o.append(rangeOpt('اندازه قلم', 'size', 4, 160, 'px'));
    const apply = document.createElement('button'); apply.textContent = 'حذف ناحیه علامت‌گذاری‌شده'; apply.className = 'primary'; apply.onclick = removeWatermark;
    const clear = document.createElement('button'); clear.textContent = 'پاک‌کردن علامت‌گذاری'; clear.onclick = clearWatermarkMask;
    o.append(apply, clear, Object.assign(document.createElement('span'), { textContent: 'روی واترمارک و کمی اطرافش بکشید' }));
  }
  if (t === 'move') o.append('لایه فعال را بکشید');
  if (t === 'picker') o.append('روی تصویر کلیک کنید تا رنگ برداشته شود');
  if (t === 'hand') o.append('بکشید تا صفحه جابجا شود. با چرخ موس زوم کنید.');
  view.style.cursor = t === 'hand' ? 'grab' : t === 'move' ? 'move' : t === 'text' ? 'text' : 'crosshair';
  render();
}

// brush tip
function tip(color, size, hard, erase) {
  const d = Math.max(2, Math.ceil(size)), c = mk(d, d), x = c.getContext('2d'), r = d / 2;
  const g = x.createRadialGradient(r, r, 0, r, r, r), [R, G, B] = erase ? [0, 0, 0] : hex2rgb(color), h = hard / 100;
  g.addColorStop(0, `rgba(${R},${G},${B},1)`); g.addColorStop(Math.min(.999, h), `rgba(${R},${G},${B},1)`); g.addColorStop(1, `rgba(${R},${G},${B},0)`);
  x.fillStyle = g; x.fillRect(0, 0, d, d); return c;
}
function stamp(l, t, from, to, erase) {
  const ctx = l.ctx, d = t.width, step = Math.max(1, d * .15), dist = Math.hypot(to.x - from.x, to.y - from.y), n = Math.max(1, Math.ceil(dist / step));
  ctx.save(); ctx.globalAlpha = S.opacity / 100; ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
  for (let i = 1; i <= n; i++) { const k = i / n; ctx.drawImage(t, from.x + (to.x - from.x) * k - d / 2, from.y + (to.y - from.y) * k - d / 2); }
  ctx.restore();
}

// flood fill
function floodFill(l, sx, sy, color, tol) {
  const w = l.canvas.width, h = l.canvas.height; sx |= 0; sy |= 0;
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return;
  const img = l.ctx.getImageData(0, 0, w, h), d = img.data, i0 = (sy * w + sx) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
  const [R, G, B] = hex2rgb(color), seen = new Uint8Array(w * h), st = [sx, sy];
  const ok = i => Math.abs(d[i] - t[0]) <= tol && Math.abs(d[i + 1] - t[1]) <= tol && Math.abs(d[i + 2] - t[2]) <= tol && Math.abs(d[i + 3] - t[3]) <= tol;
  while (st.length) {
    const y = st.pop(), x = st.pop(); let xx = x;
    while (xx >= 0 && !seen[y * w + xx] && ok((y * w + xx) * 4)) xx--; xx++;
    let up = false, dn = false;
    while (xx < w && !seen[y * w + xx] && ok((y * w + xx) * 4)) {
      const p = y * w + xx; seen[p] = 1; d[p * 4] = R; d[p * 4 + 1] = G; d[p * 4 + 2] = B; d[p * 4 + 3] = 255;
      if (y > 0) { const o = ok(((y - 1) * w + xx) * 4) && !seen[(y - 1) * w + xx]; if (o && !up) { st.push(xx, y - 1); up = true; } else if (!o) up = false; }
      if (y < h - 1) { const o = ok(((y + 1) * w + xx) * 4) && !seen[(y + 1) * w + xx]; if (o && !dn) { st.push(xx, y + 1); dn = true; } else if (!o) dn = false; }
      xx++;
    }
  }
  l.ctx.putImageData(img, 0, 0);
}
function flatten() {
  const c = mk(S.w, S.h), x = c.getContext('2d');
  S.layers.forEach(l => { if (!l.visible) return; x.globalAlpha = l.opacity / 100; x.globalCompositeOperation = l.blend; x.drawImage(l.canvas, l.ox || 0, l.oy || 0); });
  return c;
}

// shapes
function drawShape(ctx, t, a, b, color, lw, fill) {
  ctx.save(); ctx.lineWidth = lw; ctx.strokeStyle = ctx.fillStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (t === 'line') { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  else {
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
    if (t === 'rect') ctx.rect(x, y, w, h); else ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7);
    fill ? ctx.fill() : ctx.stroke();
  }
  ctx.restore();
}

// text
const tb = $('#textbox'); let textPos = null;
function styleText() { tb.style.font = `${S.bold ? '700 ' : ''}${S.fsize * S.scale}px ${S.font}`; tb.style.color = fgc(); tb.style.height = 'auto'; }
function hideText() { tb.style.display = 'none'; tb.value = ''; textPos = null; }
function showText(p, e) {
  const r = stage.getBoundingClientRect(); textPos = p; styleText();
  tb.style.display = 'block'; tb.style.left = (e.clientX - r.left) + 'px'; tb.style.top = (e.clientY - r.top - S.fsize * S.scale * .55) + 'px'; tb.value = ''; setTimeout(() => tb.focus(), 0);
}
function commitText() {
  if (!textPos || !tb.value.trim()) return hideText();
  const l = cur(); l.ctx.save(); l.ctx.fillStyle = fgc(); l.ctx.textBaseline = 'middle'; l.ctx.font = `${S.bold ? '700 ' : ''}${S.fsize}px ${S.font}`;
  l.ctx.fillText(tb.value, textPos.x, textPos.y); l.ctx.restore(); hideText(); renderLayers(); render(); commit();
}
tb.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') commitText(); if (e.key === 'Escape') hideText(); });

// crop
let cropRect = null;
function applyCrop() {
  if (!cropRect) return toast('اول ناحیه برش را بکشید');
  const x = Math.round(Math.max(0, Math.min(cropRect.a.x, cropRect.b.x))), y = Math.round(Math.max(0, Math.min(cropRect.a.y, cropRect.b.y)));
  const w = Math.round(Math.min(S.w, Math.max(cropRect.a.x, cropRect.b.x)) - x), h = Math.round(Math.min(S.h, Math.max(cropRect.a.y, cropRect.b.y)) - y);
  if (w < 2 || h < 2) return toast('ناحیه برش خیلی کوچک است');
  S.layers.forEach(l => { const c = mk(w, h), cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(l.canvas, -x, -y); l.canvas = c; l.ctx = cx; });
  S.w = w; S.h = h; cropRect = null; S.overlay = null; refreshAll(); fit(); commit(); toast('برش اعمال شد');
}
