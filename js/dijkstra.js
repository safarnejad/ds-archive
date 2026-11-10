// step-by-step Dijkstra run (note 28): runs the code below on the CLRS 24.6 graph and records every executed line
(function () {
  const root = document.getElementById('dijkstra-run');
  if (!root) return;
  const P = { s: [50, 145], t: [170, 60], x: [310, 60], y: [170, 220], z: [310, 220] };
  const E = [['s','t',10],['s','y',5],['t','x',1],['t','y',2],['y','t',3],['y','x',9],['y','z',2],['x','z',4],['z','x',6],['z','s',7]];
  const CODE = [
    'd[s] = 0; Q = [(0, s)]',
    'while Q:',
    '  du, u = heapq.heappop(Q)',
    '  if u in done:  # stale item',
    '    continue',
    '  done.add(u)',
    '  for v in Adj[u]:',
    '    if d[v] > du + w(u, v):  # relax',
    '      d[v] = du + w(u, v); parent[v] = u',
    '      heapq.heappush(Q, (d[v], v))',
  ];
  const fa = n => n === Infinity ? '∞' : String(n).replace(/\d/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]);
  const V = Object.keys(P);
  const ltr = h => `<span dir="ltr" class="dj-ltr">${h}</span>`;
  const pair = (dd, v) => ltr(`(${fa(dd)}, <i>${v}</i>)`);

  // run the algorithm, snapshot after each line
  const steps = [];
  const d = {}, par = {}, done = new Set();
  V.forEach(v => { d[v] = Infinity; par[v] = null; });
  let Q = [], u = null, du = null, edge = null;
  const snap = (line, msg) => steps.push({ line, msg, d: { ...d }, par: { ...par }, done: new Set(done),
    Q: [...Q].sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1)), u, edge });
  d.s = 0; Q.push([0, 's']);
  snap(0, 'فاصلۀ مبدأ صفر است و فقط <i>s</i> در صف است.');
  for (;;) {
    snap(1, Q.length ? 'صف خالی نیست، پس ادامه می‌دهیم.' : 'صف خالی شد؛ الگوریتم تمام است.');
    if (!Q.length) break;
    Q.sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1));
    [du, u] = Q.shift(); edge = null;
    snap(2, `کوچک‌ترین زوج صف ${pair(du, u)} بیرون می‌آید.`);
    if (done.has(u)) { snap(3, `<i>${u}</i> قبلاً نهایی شده؛ این زوج کهنه است.`); snap(4, 'از آن رد می‌شویم.'); continue; }
    snap(3, `<i>${u}</i> هنوز نهایی نشده است.`);
    done.add(u);
    snap(5, `فاصلۀ <i>${u}</i> نهایی شد: ${fa(du)}.`);
    for (const [a, v, w] of E) {
      if (a !== u) continue;
      edge = [a, v];
      snap(6, `یال ${ltr(`<i>${u}</i> → <i>${v}</i>`)} با وزن ${fa(w)}.`);
      if (d[v] > du + w) {
        snap(7, `${ltr(`${fa(du)} + ${fa(w)} = ${fa(du + w)} &lt; ${fa(d[v])}`)}؛ پس فاصلۀ <i>${v}</i> کم می‌شود.`);
        d[v] = du + w; par[v] = u;
        snap(8, `<code>d[${v}]</code> شد ${fa(d[v])} و پدرش <i>${u}</i>.`);
        Q.push([d[v], v]);
        snap(9, `زوج ${pair(d[v], v)} به صف اضافه شد.`);
      } else snap(7, `${ltr(`${fa(du)} + ${fa(w)} = ${fa(du + w)} ≥ ${fa(d[v])}`)}؛ تغییری نمی‌کند.`);
    }
    edge = null;
  }
  u = null; snap(1, 'صف خالی شد. یال‌های پررنگ درخت کوتاه‌ترین مسیر از <i>s</i> هستند.');
  steps.splice(steps.length - 2, 1);

  // layout
  root.innerHTML = `
    <div class="dj-panes">
      <svg class="dj-graph" viewBox="0 0 360 300" role="img" aria-label="گراف"></svg>
      <pre class="dj-code">${CODE.map((l, i) => `<span data-l="${i}">${l.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`).join('')}</pre>
    </div>
    <div class="dj-msg"></div>
    <div class="dj-queue"></div>
    <div class="dj-bar">
      <button data-a="reset">از اول</button>
      <button data-a="prev">قدم قبل</button>
      <button data-a="next" class="dj-main">قدم بعد</button>
      <button data-a="play">اجرای خودکار</button>
      <span class="dj-count"></span>
    </div>`;
  const svg = root.querySelector('svg'), NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; };
  const defs = el('defs', {});
  [['ar', '#cbd5e1'], ['arb', '#1e3a8a'], ['arh', '#d97706']].forEach(([id, c]) => {
    const m = el('marker', { id, viewBox: '0 0 12 10', refX: 12, refY: 5, markerWidth: 12, markerHeight: 10, markerUnits: 'userSpaceOnUse', orient: 'auto' }, defs);
    el('path', { d: 'M0,0L12,5L0,10L3,5z', fill: c, 'shape-rendering': 'geometricPrecision' }, m);
  });
  const R = 19, edges = {};
  for (const [a, b, w] of E) {
    const [x1, y1] = P[a], [x2, y2] = P[b];
    let path, lx, ly;
    if (a === 'z' && b === 's') { path = 'M300,236 C260,298 70,300 46,166'; lx = 175; ly = 282; }
    else {
      const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
      const twin = E.some(e => e[0] === b && e[1] === a), o = twin ? 7 : 0, ox = -uy * o, oy = ux * o;
      const sx = x1 + ux * R + ox, sy = y1 + uy * R + oy, ex = x2 - ux * (R + 1) + ox, ey = y2 - uy * (R + 1) + oy;
      path = `M${sx},${sy}L${ex},${ey}`; lx = (sx + ex) / 2 + ox * 1.9; ly = (sy + ey) / 2 + oy * 1.9;
      if (a === 'y' && b === 'x') { lx -= 14; ly += 14; }
    }
    const g = el('g', { class: 'dj-e' });
    const p = el('path', { d: path, fill: 'none' }, g);
    el('circle', { cx: lx, cy: ly, r: 9, class: 'dj-wbg' }, g);
    const t = el('text', { x: lx, y: ly + 4, class: 'dj-w' }, g); t.textContent = fa(w);
    edges[a + b] = { g, p };
  }
  const nodes = {};
  for (const v of V) {
    const [x, y] = P[v], g = el('g', { class: 'dj-n' });
    const ring = el('circle', { cx: x, cy: y, r: R + 5, class: 'dj-ring' }, g);
    const c = el('circle', { cx: x, cy: y, r: R }, g);
    const t = el('text', { x, y: y + 6, class: 'dj-v' }, g); t.textContent = v;
    const by = y < 145 ? y - R - 14 : y + R + 18;
    const pill = el('rect', { x: x - 17, y: by - 12, width: 34, height: 19, rx: 9.5, class: 'dj-pill' }, g);
    const dt = el('text', { x, y: by + 2, class: 'dj-d' }, g);
    nodes[v] = { g, c, ring, dt, pill };
  }

  let k = 0, timer = null;
  const prevD = i => (i > 0 ? steps[i - 1].d : null);
  function draw() {
    const S = steps[k], pd = prevD(k);
    root.querySelectorAll('.dj-code span').forEach(s => s.classList.toggle('on', +s.dataset.l === S.line));
    for (const v of V) {
      const n = nodes[v];
      n.g.setAttribute('class', 'dj-n' + (S.done.has(v) ? ' done' : S.d[v] < Infinity ? ' seen' : '') + (S.u === v ? ' cur' : ''));
      n.dt.textContent = fa(S.d[v]);
      n.pill.setAttribute('class', 'dj-pill' + (pd && pd[v] !== S.d[v] ? ' ch' : ''));
    }
    for (const [a, b] of E) {
      const e = edges[a + b], tree = S.par[b] === a, hot = S.edge && S.edge[0] === a && S.edge[1] === b;
      e.g.setAttribute('class', 'dj-e' + (hot ? ' hot' : tree ? ' tree' : ''));
      e.p.setAttribute('marker-end', `url(#${hot ? 'arh' : tree ? 'arb' : 'ar'})`);
    }
    root.querySelector('.dj-msg').innerHTML = S.msg;
    root.querySelector('.dj-queue').innerHTML = 'صف: ' + (S.Q.length ? S.Q.map(([dd, v]) => `<span>${pair(dd, v)}</span>`).join('') : '<span class="empty">خالی</span>');
    root.querySelector('.dj-count').textContent = `${fa(k + 1)} از ${fa(steps.length)}`;
  }
  function stop() { clearInterval(timer); timer = null; root.querySelector('[data-a=play]').textContent = 'اجرای خودکار'; }
  root.querySelector('.dj-bar').addEventListener('click', ev => {
    const a = ev.target.dataset.a; if (!a) return;
    if (a === 'play') {
      if (timer) return stop();
      ev.target.textContent = 'توقف';
      timer = setInterval(() => { if (k < steps.length - 1) { k++; draw(); } else stop(); }, 900);
      return;
    }
    stop();
    if (a === 'next' && k < steps.length - 1) k++;
    if (a === 'prev' && k > 0) k--;
    if (a === 'reset') k = 0;
    draw();
  });
  draw();
})();
