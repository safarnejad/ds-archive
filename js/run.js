// step-by-step algorithm runs inside notes: draws one recorded step at a time (graph + code line + message)
(function () {
  const NS = 'http://www.w3.org/2000/svg', R = 19;
  const fa = n => n === Infinity ? '∞' : n === -Infinity ? '\u2066−∞\u2069'
    : n < 0 ? '\u2066−' + fa(-n) + '\u2069' : String(n).replace(/\d/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]);
  const ltr = h => `<span dir="ltr" class="dj-ltr">${h}</span>`;
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }
  const unit = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

  function drawEdge(svg, e, N, all) {
    const A = N[e.a], B = N[e.b];
    let [cx, cy] = [(A.x + B.x) / 2, (A.y + B.y) / 2];
    if (e.c) [cx, cy] = e.c;
    else if (e.dir && all.some(f => f.a === e.b && f.b === e.a)) {
      const [ux, uy] = unit(B.x - A.x, B.y - A.y);
      cx += -uy * 16; cy += ux * 16;
    }
    const [sx, sy] = unit(cx - A.x, cy - A.y), [tx, ty] = unit(B.x - cx, B.y - cy);
    const p0 = [A.x + sx * R, A.y + sy * R], p2 = [B.x - tx * (R + 1), B.y - ty * (R + 1)];
    const g = el('g', { class: 'dj-e ' + (e.cls || '') }, svg);
    el('path', { d: `M${p0}Q${cx},${cy} ${p2}`, fill: 'none' }, g);
    if (e.dir) {
      const [x, y] = p2, bx = x - tx * 11, by = y - ty * 11;
      el('path', { class: 'dj-head', d: `M${x},${y}L${bx - ty * 4.5},${by + tx * 4.5}L${x - tx * 8},${y - ty * 8}L${bx + ty * 4.5},${by - tx * 4.5}z` }, g);
    }
    if (e.w !== undefined) {
      const t = e.lp || 0.5, q = (a, c, b) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
      const lx = q(p0[0], cx, p2[0]), ly = q(p0[1], cy, p2[1]);
      el('circle', { cx: lx, cy: ly, r: 10, class: 'dj-wbg' }, g);
      el('text', { x: lx, y: ly + 4, class: 'dj-w' }, g).textContent = fa(e.w);
    }
  }

  function drawNode(svg, n) {
    const g = el('g', { class: 'dj-n ' + (n.cls || '') }, svg);
    el('circle', { cx: n.x, cy: n.y, r: R + 5, class: 'dj-ring' }, g);
    el('circle', { cx: n.x, cy: n.y, r: R }, g);
    el('text', { x: n.x, y: n.y + 6, class: 'dj-v' + (/^\d/.test(n.label) ? ' num' : '') }, g)
      .textContent = /^\d+$/.test(n.label) ? fa(n.label) : n.label;
    if (n.badge !== undefined && n.badge !== null) {
      const t = typeof n.badge === 'number' ? fa(n.badge) : n.badge;
      const w = Math.max(34, t.length * 8 + 16), by = n.pos === 'b' ? n.y + R + 18 : n.y - R - 14;
      el('rect', { x: n.x - w / 2, y: by - 12, width: w, height: 19, rx: 9.5, class: 'dj-pill' + (n.ch ? ' ch' : '') }, g);
      el('text', { x: n.x, y: by + 2, class: 'dj-d' }, g).textContent = t;
    }
  }

  // free shapes for arrays, bars, grids and tables:
  // {t: 'rect', x, y, w, h, cls, label, sub} | {t: 'text', x, y, s, cls} | {t: 'poly', pts: [[x, y], ...], cls, label} | {t: 'line', x1, y1, x2, y2, cls, dir}
  function drawShape(svg, s) {
    const g = el('g', { class: 'dj-s ' + (s.cls || '') }, svg);
    if (s.t === 'rect') {
      el('rect', { x: s.x, y: s.y, width: s.w, height: s.h, rx: s.rx === undefined ? 3 : s.rx }, g);
      if (s.label !== undefined) el('text', { x: s.x + s.w / 2, y: s.y + s.h / 2 + 5, class: 'dj-sl' }, g).textContent = typeof s.label === 'number' ? fa(s.label) : s.label;
      if (s.sub !== undefined) el('text', { x: s.x + s.w / 2, y: s.y + s.h + 14, class: 'dj-ss' }, g).textContent = typeof s.sub === 'number' ? fa(s.sub) : s.sub;
    } else if (s.t === 'text') {
      el('text', { x: s.x, y: s.y, class: 'dj-st' }, g).textContent = typeof s.s === 'number' ? fa(s.s) : s.s;
    } else if (s.t === 'poly') {
      el('polygon', { points: s.pts.map(p => p.join(',')).join(' ') }, g);
      if (s.label !== undefined) {
        const cx = s.pts.reduce((a, p) => a + p[0], 0) / s.pts.length, cy = s.pts.reduce((a, p) => a + p[1], 0) / s.pts.length;
        el('text', { x: cx, y: cy + 5, class: 'dj-sl' }, g).textContent = s.label;
      }
    } else if (s.t === 'line') {
      el('path', { d: `M${s.x1},${s.y1}L${s.x2},${s.y2}`, fill: 'none' }, g);
      if (s.dir) {
        const [tx, ty] = unit(s.x2 - s.x1, s.y2 - s.y1), x = s.x2, y = s.y2, bx = x - tx * 9, by = y - ty * 9;
        el('path', { class: 'dj-head', d: `M${x},${y}L${bx - ty * 4},${by + tx * 4}L${x - tx * 6},${y - ty * 6}L${bx + ty * 4},${by - tx * 4}z` }, g);
      }
    }
  }

  // cfg: {view: [w, h], code: [lines] | null, steps: [{line, msg, nodes: {id: {x, y, label, cls, badge, pos, ch}}, edges: [{a, b, w, dir, cls, c, lp}], state}]}
  window.AlgoRun = function (root, cfg) {
    const many = cfg.steps.length > 1;
    root.innerHTML = `<div class="dj-panes"><svg class="dj-graph" viewBox="0 0 ${cfg.view[0]} ${cfg.view[1]}" style="width:${cfg.view[0]}px"></svg>`
      + (cfg.code ? `<pre class="dj-code">${cfg.code.map((l, i) => `<span data-l="${i}">${esc(l) || ' '}</span>`).join('')}</pre>` : '')
      + `</div><div class="dj-msg"></div><div class="dj-queue"></div>`
      + (many ? `<div class="dj-bar"><button data-a="reset">از اول</button><button data-a="prev">قدم قبل</button>`
        + `<button data-a="next" class="dj-main">قدم بعد</button><button data-a="play">اجرای خودکار</button><span class="dj-count"></span></div>` : '');
    const svg = root.querySelector('svg');
    let k = 0, timer = null;
    function draw() {
      const S = cfg.steps[k];
      root.querySelectorAll('.dj-code span').forEach(s => s.classList.toggle('on', +s.dataset.l === S.line));
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      (S.shapes || []).filter(s => !s.top).forEach(s => drawShape(svg, s));
      (S.edges || []).forEach(e => drawEdge(svg, e, S.nodes, S.edges));
      Object.values(S.nodes || {}).forEach(n => drawNode(svg, n));
      (S.shapes || []).filter(s => s.top).forEach(s => drawShape(svg, s));
      root.querySelector('.dj-msg').innerHTML = S.msg || '';
      root.querySelector('.dj-queue').innerHTML = S.state || '';
      if (many) root.querySelector('.dj-count').textContent = `${fa(k + 1)} از ${fa(cfg.steps.length)}`;
    }
    function stop() { clearInterval(timer); timer = null; root.querySelector('[data-a=play]').textContent = 'اجرای خودکار'; }
    if (many) root.querySelector('.dj-bar').addEventListener('click', ev => {
      const a = ev.target.dataset.a;
      if (!a) return;
      if (a === 'play') {
        if (timer) return stop();
        ev.target.textContent = 'توقف';
        timer = setInterval(() => { if (k < cfg.steps.length - 1) { k++; draw(); } else stop(); }, 900);
        return;
      }
      stop();
      if (a === 'next' && k < cfg.steps.length - 1) k++;
      if (a === 'prev' && k > 0) k--;
      if (a === 'reset') k = 0;
      draw();
    });
    draw();
  };
  AlgoRun.fa = fa;
  window.EX = window.EX || {};
  addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-ex]').forEach(e => {
    if (EX[e.dataset.ex]) AlgoRun(e, EX[e.dataset.ex]());
  }));
  AlgoRun.ltr = ltr;
})();
