// Local, browser-only watermark retouch helper. No uploads or external services.
function ensureWatermarkMask() {
  if (!S.wmMask || S.wmMask.width !== S.w || S.wmMask.height !== S.h) {
    S.wmMask = mk(S.w, S.h);
  }
}
function paintWatermarkMask(from, to) {
  ensureWatermarkMask();
  const c = S.wmMask.getContext('2d');
  c.save(); c.strokeStyle = 'rgba(255,35,70,1)'; c.fillStyle = 'rgba(255,35,70,1)';
  c.lineWidth = Math.max(4, S.size); c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(from.x, from.y); c.lineTo(to.x, to.y); c.stroke();
  c.beginPath(); c.arc(to.x, to.y, c.lineWidth / 2, 0, Math.PI * 2); c.fill(); c.restore();
}
function clearWatermarkMask() {
  if (S.wmMask) S.wmMask.getContext('2d').clearRect(0, 0, S.w, S.h);
  render(); toast('علامت‌گذاری پاک شد');
}
function removeWatermark() {
  const layer = cur();
  if (!layer || !layer.visible) return toast('اول یک لایهٔ قابل‌مشاهده انتخاب کنید');
  if (!S.wmMask) return toast('اول ناحیهٔ واترمارک را با قلم قرمز مشخص کنید');
  const w = S.w, h = S.h;
  const maskData = S.wmMask.getContext('2d', {willReadFrequently:true}).getImageData(0, 0, w, h).data;
  const img = layer.ctx.getImageData(0, 0, w, h), d = img.data;
  const mask = new Uint8Array(w * h), queue = new Int32Array(w * h);
  let count = 0, head = 0, tail = 0;
  for (let p = 0; p < w*h; p++) if (maskData[p*4+3] > 10) { mask[p] = 1; count++; }
  if (!count) return toast('ناحیه‌ای مشخص نشده است');
  // Seed marked pixels bordering untouched pixels, then propagate inward.
  const neighbors = [-w-1,-w,-w+1,-1,1,w-1,w,w+1];
  for (let p = 0; p < w*h; p++) {
    if (!mask[p]) continue;
    const x = p % w, y = (p / w) | 0;
    let edge = false;
    for (const off of neighbors) {
      const q = p + off;
      if (q < 0 || q >= w*h) continue;
      const qx = q % w, qy = (q / w) | 0;
      if (Math.abs(qx-x)>1 || Math.abs(qy-y)>1) continue;
      if (!mask[q]) { edge = true; break; }
    }
    if (edge) { mask[p] = 2; queue[tail++] = p; }
  }
  if (!tail) return toast('ناحیه تا لبهٔ تصویر رسیده؛ علامت‌گذاری را کوچک‌تر کنید');
  // Breadth-first color propagation gives a simple local inpainting effect.
  while (head < tail) {
    const p = queue[head++], x = p % w, y = (p / w) | 0;
    let rr=0, gg=0, bb=0, aa=0, n=0;
    for (const off of neighbors) {
      const q=p+off; if(q<0||q>=w*h) continue;
      const qx=q%w, qy=(q/w)|0; if(Math.abs(qx-x)>1||Math.abs(qy-y)>1||mask[q]===1) continue;
      const i=q*4; rr+=d[i]; gg+=d[i+1]; bb+=d[i+2]; aa+=d[i+3]; n++;
    }
    if(n) { const i=p*4; d[i]=rr/n; d[i+1]=gg/n; d[i+2]=bb/n; d[i+3]=aa/n; }
    // Mark this pixel as filled; add adjacent unresolved pixels once.
    mask[p]=2;
    for (const off of neighbors) {
      const q=p+off; if(q<0||q>=w*h) continue;
      const qx=q%w, qy=(q/w)|0; if(Math.abs(qx-x)>1||Math.abs(qy-y)>1||mask[q]!==1) continue;
      mask[q]=2; queue[tail++]=q;
    }
  }
  layer.ctx.putImageData(img, 0, 0);
  clearWatermarkMask(); renderLayers(); render(); commit();
  toast('ناحیه پردازش شد؛ نتیجه را بررسی کنید');
}
