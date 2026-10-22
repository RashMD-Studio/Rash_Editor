// Rash Editor module: layers-panel.js
// Loaded in order by index.html; classic scripts share the app scope.
// ---------- layers panel ----------
function renderLayers() {
  const box = $('#layers'); box.textContent = '';
  for (let i = S.layers.length - 1; i >= 0; i--) {
    const l = S.layers[i], el = document.createElement('div');
    el.className = 'layer' + (i === S.active ? ' sel' : '');
    const th = document.createElement('canvas'); th.width = 36; th.height = 36;
    const k = Math.min(36 / l.canvas.width, 36 / l.canvas.height), tw = l.canvas.width * k, tc = th.getContext('2d');
    tc.drawImage(l.canvas, (36 - tw) / 2, (36 - l.canvas.height * k) / 2, tw, l.canvas.height * k);
    const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = l.name;
    nm.ondblclick = () => { const t = document.createElement('input'); t.value = l.name; t.style.width = '100%'; nm.replaceWith(t); t.focus(); t.select();
      const done = () => { l.name = t.value.trim() || l.name; renderLayers(); }; t.onblur = done; t.onkeydown = e => { if (e.key === 'Enter') t.blur(); }; };
    const eye = document.createElement('button'); eye.className = 'eye' + (l.visible ? '' : ' off'); eye.textContent = l.visible ? 'نمایش' : 'مخفی';
    eye.onclick = e => { e.stopPropagation(); l.visible = !l.visible; renderLayers(); render(); commit(); };
    el.append(th, nm, eye);
    el.onclick = () => { S.active = i; renderLayers(); syncLayerCtl(); };
    box.append(el);
  }
}
function syncLayerCtl() { const l = cur(); if (!l) return; $('#blend').value = l.blend; $('#lop').value = l.opacity; $('#lopv').textContent = l.opacity; }
function refreshAll() { renderLayers(); syncLayerCtl(); render(); }
