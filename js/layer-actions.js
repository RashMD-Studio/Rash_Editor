// Rash Editor module: layer-actions.js
// Loaded in order by index.html; classic scripts share the app scope.
// ---------- layer buttons ----------
$('#lAdd').onclick = () => { S.layers.splice(S.active + 1, 0, newLayer()); S.active++; refreshAll(); commit(); };
$('#lDup').onclick = () => { const l = cur(), n = newLayer(l.name + ' کپی'); n.ctx.drawImage(l.canvas, 0, 0); n.opacity = l.opacity; n.blend = l.blend; S.layers.splice(S.active + 1, 0, n); S.active++; refreshAll(); commit(); };
$('#lDel').onclick = () => { if (S.layers.length < 2) return toast('حداقل یک لایه لازم است'); S.layers.splice(S.active, 1); S.active = Math.max(0, S.active - 1); refreshAll(); commit(); };
$('#lUp').onclick = () => { if (S.active < S.layers.length - 1) { const a = S.layers; [a[S.active], a[S.active + 1]] = [a[S.active + 1], a[S.active]]; S.active++; refreshAll(); commit(); } };
$('#lDown').onclick = () => { if (S.active > 0) { const a = S.layers; [a[S.active], a[S.active - 1]] = [a[S.active - 1], a[S.active]]; S.active--; refreshAll(); commit(); } };
$('#lMerge').onclick = () => {
  if (S.active < 1) return toast('لایه‌ای پایین‌تر وجود ندارد');
  const top = cur(), low = S.layers[S.active - 1]; low.ctx.save(); low.ctx.globalAlpha = top.opacity / 100; low.ctx.globalCompositeOperation = top.blend; low.ctx.drawImage(top.canvas, 0, 0); low.ctx.restore();
  S.layers.splice(S.active, 1); S.active--; refreshAll(); commit();
};
$('#blend').onchange = e => { cur().blend = e.target.value; render(); commit(); };
$('#lop').oninput = e => { cur().opacity = +e.target.value; $('#lopv').textContent = e.target.value; render(); };
$('#lop').onchange = commit;
