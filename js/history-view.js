// Rash Editor module: history-view.js
// Loaded in order by index.html; classic scripts share the app scope.
// ---------- history ----------
function snapshot() {
  return {
    w: S.w, h: S.h, active: S.active,
    layers: S.layers.map(l => { const c = mk(l.canvas.width, l.canvas.height); c.getContext('2d').drawImage(l.canvas, 0, 0); return { id: l.id, name: l.name, visible: l.visible, opacity: l.opacity, blend: l.blend, data: c }; }),
  };
}
function restore(sn) {
  S.w = sn.w; S.h = sn.h; S.active = sn.active;
  S.layers = sn.layers.map(m => {
    const canvas = mk(m.data.width, m.data.height), ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(m.data, 0, 0);
    return { id: m.id, name: m.name, visible: m.visible, opacity: m.opacity, blend: m.blend, canvas, ctx, ox: 0, oy: 0 };
  });
  refreshAll();
}
function commit() { // call AFTER a change
  S.undo.push(snapshot()); if (S.undo.length > 25) S.undo.shift();
  S.redo = []; syncHist();
}
function syncHist() { $('#mUndo').disabled = S.undo.length < 2; $('#mRedo').disabled = !S.redo.length; }
function undo() { if (S.undo.length < 2) return; S.redo.push(S.undo.pop()); restore(S.undo[S.undo.length - 1]); syncHist(); }
function redo() { if (!S.redo.length) return; const s = S.redo.pop(); S.undo.push(s); restore(s); syncHist(); }

// ---------- view transform ----------
function resizeView() {
  const r = stage.getBoundingClientRect(), d = window.devicePixelRatio || 1;
  view.width = Math.max(1, r.width * d); view.height = Math.max(1, r.height * d);
  render();
}
function fit() {
  const r = stage.getBoundingClientRect();
  S.scale = Math.min((r.width - 40) / S.w, (r.height - 40) / S.h, 1);
  S.px = (r.width - S.w * S.scale) / 2; S.py = (r.height - S.h * S.scale) / 2;
  render();
}
function toDoc(e) {
  const r = view.getBoundingClientRect();
  return { x: (e.clientX - r.left - S.px) / S.scale, y: (e.clientY - r.top - S.py) / S.scale };
}
function zoomAt(cx, cy, f) {
  const ns = Math.min(32, Math.max(0.05, S.scale * f));
  S.px = cx - (cx - S.px) * (ns / S.scale); S.py = cy - (cy - S.py) * (ns / S.scale); S.scale = ns; render();
}
