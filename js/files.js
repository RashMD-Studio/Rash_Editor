// Rash Editor module: files.js
// Loaded in order by index.html; classic scripts share the app scope.
// ---------- file / export / dialogs ----------
function dialog(html, setup) { const b = $('#dlgBox'); b.innerHTML = html; $('#dlg').classList.add('show'); setup(b); }
function closeDlg() { $('#dlg').classList.remove('show'); }
$('#dlg').addEventListener('pointerdown', e => { if (e.target.id === 'dlg') closeDlg(); });

function setDoc(w, h, bg) {
  S.w = w; S.h = h; S.layers = [newLayer('پس‌زمینه', bg)]; S.active = 0; S.undo = []; S.redo = []; cropRect = null; resetSliders(); refreshAll(); fit(); commit();
}
$('#mNew').onclick = () => dialog(`<h2>سند جدید</h2><label>عرض (px)<input id="nw" type="number" value="1200" min="16" max="6000"></label><label>ارتفاع (px)<input id="nh" type="number" value="800" min="16" max="6000"></label>
  <label>پس‌زمینه<select id="nb"><option value="#ffffff">سفید</option><option value="#000000">سیاه</option><option value="">شفاف</option></select></label>
  <div class="btns"><button id="dc">انصراف</button><button id="dok" class="primary">ساخت</button></div>`, b => {
  $('#dc', b).onclick = closeDlg;
  $('#dok', b).onclick = () => { const w = Math.min(6000, Math.max(16, +$('#nw', b).value | 0)), h = Math.min(6000, Math.max(16, +$('#nh', b).value | 0)); setDoc(w, h, $('#nb', b).value || null); closeDlg(); };
});
$('#mOpen').onclick = () => $('#file').click();
function loadImage(file) {
  const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => {
    let w = img.naturalWidth, h = img.naturalHeight; const k = Math.min(1, 4000 / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
    if (!S.layers.length || (S.layers.length === 1 && S.undo.length < 2)) setDoc(w, h, null);
    const l = newLayer(file.name.replace(/\.[^.]+$/, '') || 'تصویر');
    const f = Math.min(1, S.w / w, S.h / h); l.ctx.drawImage(img, (S.w - w * f) / 2, (S.h - h * f) / 2, w * f, h * f);
    S.layers.splice(S.active + 1, 0, l); S.active++; refreshAll(); commit(); URL.revokeObjectURL(url); toast('تصویر اضافه شد');
  };
  img.onerror = () => toast('این فایل تصویر معتبر نیست');
  img.src = url;
}
$('#file').onchange = e => { const f = e.target.files[0]; if (f) loadImage(f); e.target.value = ''; };
stage.addEventListener('dragover', e => e.preventDefault());
stage.addEventListener('drop', e => { e.preventDefault(); const f = [...e.dataTransfer.files].find(x => x.type.startsWith('image/')); if (f) loadImage(f); });
document.addEventListener('paste', e => { const f = [...(e.clipboardData?.files || [])].find(x => x.type.startsWith('image/')); if (f) loadImage(f); });

$('#mExport').onclick = () => dialog(`<h2>ذخیره تصویر</h2><label>فرمت<select id="xf"><option value="png">PNG (بدون افت کیفیت)</option><option value="jpg">JPG</option><option value="webp">WEBP</option></select></label>
  <label>کیفیت (برای JPG و WEBP)<input id="xq" type="range" min="40" max="100" value="92"></label>
  <div class="btns"><button id="dc">انصراف</button><button id="dok" class="primary">ذخیره</button></div>`, b => {
  $('#dc', b).onclick = closeDlg;
  $('#dok', b).onclick = async () => {
    const f = $('#xf', b).value, q = +$('#xq', b).value / 100, mime = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }[f];
    let src = flatten();
    if (f === 'jpg') { const c = mk(S.w, S.h), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, S.w, S.h); x.drawImage(src, 0, 0); src = c; }
    const blob = await new Promise(resolve => {
      try { src.toBlob(resolve, mime, q); } catch (err) { resolve(null); }
    });
    if (!blob || !blob.size) return toast('ساخت فایل ناموفق بود؛ فرمت دیگری را امتحان کن');
    const filename = 'rash-editor-' + new Date().toISOString().replace(/[:.]/g, '-') + '.' + f;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    closeDlg();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('دانلود تصویر شروع شد');
  };
});
