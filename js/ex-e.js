// figures for sessions 24–28: edge types, bipartite check, SCC, DAG shortest paths, arbitrage, Dijkstra with a negative edge
(function () {
  const { fa, ltr } = AlgoRun;
  const EX = window.EX;
  const iv = v => `<i>${v}</i>`;
  const dec = x => fa(x).replace('.', '٫');
  const list = (title, xs) => `${title}: ` + (xs.length ? xs.map(x => `<span>${x}</span>`).join('') : '<span class="empty">خالی</span>');
  const nodesOf = (P, f) => Object.fromEntries(Object.keys(P).map(v => [v, { x: P[v][0], y: P[v][1], label: v, ...f(v) }]));
  const COL = { c1: '#3b82f6', c2: '#16a34a', c3: '#d97706', c4: '#db2777' };
  const key = (c, t) => `<span style="background:${COL[c]}"></span>${t}`;

  // ---------- session 24: the four edge types (DFS_times + edge_type of the note) ----------
  EX.s24edgeTypes = () => {
    const P = { a: [50, 60], b: [180, 60], c: [330, 60], d: [50, 200], e: [180, 200], f: [330, 200] };
    const E = [['a', 'b'], ['a', 'd'], ['b', 'e'], ['c', 'e'], ['c', 'f'], ['d', 'b'], ['e', 'd']];
    const Adj = {};
    for (const v in P) Adj[v] = [];
    E.forEach(([a, b]) => Adj[a].push(b));
    const parent = {}, start = {}, finish = {};
    let time = 0;
    (function run() {
      const visit = u => {
        start[u] = time++;
        for (const v of Adj[u]) if (!(v in parent)) { parent[v] = u; visit(v); }
        finish[u] = time++;
      };
      for (const s in P) if (!(s in parent)) { parent[s] = null; visit(s); }
    })();
    const type = (u, v) => parent[v] === u ? 'c1'
      : start[u] < start[v] && finish[v] < finish[u] ? 'c2'
        : start[v] <= start[u] && finish[u] <= finish[v] ? 'c3' : 'c4';
    return { view: [380, 260], code: null, steps: [{
      nodes: nodesOf(P, v => ({ badge: `${fa(start[v])}/${fa(finish[v])}`, pos: P[v][1] < 120 ? 't' : 'b' })),
      edges: E.map(([a, b]) => ({ a, b, dir: true, cls: type(a, b) })),
      msg: `جست‌وجو از ${iv('a')} و سپس از ${iv('c')} شروع می‌شود؛ عدد کنار هر رأس ${ltr('start/finish')} است.`,
      state: `<div class="dj-legend">${key('c1', 'یال درخت')} ${key('c2', 'رو به جلو')} ${key('c3', 'بازگشتی')} ${key('c4', 'متقاطع')}</div>`
        + `مثلاً ${ltr(`(${iv('d')}, ${iv('b')})`)} بازگشتی است چون بازۀ ${iv('d')} درون بازۀ ${iv('b')} است، و ${ltr(`(${iv('c')}, ${iv('e')})`)} متقاطع است چون بازه‌هایشان جدا از هم‌اند.` }] };
  };

  // ---------- session 24: two-colouring (is_bipartite of the note) ----------
  EX.s24bipartite = () => {
    const P = { a: [60, 50], b: [150, 50], c: [185, 128], d: [150, 206], e: [60, 206], f: [25, 128],
      x: [340, 50], y: [290, 190], z: [400, 190] };
    const L = [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f'], ['f', 'a']], T = [['x', 'y'], ['y', 'z'], ['z', 'x']];
    function check(V, E) {
      const Adj = {}, color = {};
      V.forEach(v => Adj[v] = []);
      E.forEach(([a, b]) => { Adj[a].push(b); Adj[b].push(a); });
      V.forEach(v => Adj[v].sort());
      let bad = null;
      const visit = u => {
        for (const v of Adj[u]) {
          if (!(v in color)) { color[v] = 1 - color[u]; if (!visit(v)) return false; }
          else if (color[v] === color[u]) { bad = [u, v]; return false; }
        }
        return true;
      };
      let ok = true;
      for (const s of V) if (!(s in color)) { color[s] = 0; if (!visit(s)) { ok = false; break; } }
      return { color, bad, ok };
    }
    const A = check(['a', 'b', 'c', 'd', 'e', 'f'], L), B = check(['x', 'y', 'z'], T);
    const color = { ...A.color, ...B.color };
    const isBad = (a, b) => B.bad && ((B.bad[0] === a && B.bad[1] === b) || (B.bad[0] === b && B.bad[1] === a));
    return { view: [430, 250], code: null, steps: [{
      nodes: nodesOf(P, v => ({ cls: v in color ? (color[v] ? 'c3' : 'c1') : '' })),
      edges: L.concat(T).map(([a, b]) => ({ a, b, cls: isBad(a, b) ? 'hot' : '' })),
      msg: `دور زوج سمت چپ با دو رنگ رنگ می‌شود (${A.ok ? 'دوبخشی است' : 'دوبخشی نیست'})؛ در مثلث سمت راست یال ${ltr(`{${iv(B.bad[0])}, ${iv(B.bad[1])}}`)} دو سر هم‌رنگ دارد، پس ${B.ok ? 'دوبخشی است' : 'دوبخشی نیست'}.`,
      state: `<div class="dj-legend">${key('c1', 'رنگ ۰')} ${key('c3', 'رنگ ۱')}</div>هر رأس رنگ مخالف پدرش را می‌گیرد؛ دور فرد بالاخره دو رأس هم‌رنگ را به هم وصل می‌کند.` }] };
  };

  // ---------- session 25: SCC graph (CLRS fig 22.9, without the self-loop on h) ----------
  const sccP = { a: [50, 60], b: [150, 60], c: [250, 60], d: [350, 60], e: [50, 190], f: [150, 190], g: [250, 190], h: [350, 190] };
  const sccE = [['a', 'b'], ['b', 'c'], ['b', 'e'], ['b', 'f'], ['c', 'd'], ['c', 'g'], ['d', 'c'], ['d', 'h'], ['e', 'a'], ['e', 'f'], ['f', 'g'], ['g', 'f'], ['g', 'h']];
  function sccRun(record) {
    const V = Object.keys(sccP), Adj = {};
    V.forEach(v => Adj[v] = []);
    sccE.forEach(([a, b]) => Adj[a].push(b));
    const seen = new Set(), order = [], stack = [], comp = {}, cidx = {};
    let phase = 1, hot = null;
    const snap = (line, msg) => record && record.push({ line, msg,
      nodes: nodesOf(sccP, v => ({ cls: (v === stack[stack.length - 1] ? 'cur ' : '') + (phase === 1
        ? (order.includes(v) ? 'done' : seen.has(v) ? 'seen' : '')
        : v in comp ? 'c' + (cidx[comp[v]] + 1) : ''),
      badge: order.includes(v) ? order.indexOf(v) + 1 : null, pos: sccP[v][1] < 120 ? 't' : 'b' })),
      edges: sccE.map(([a, b]) => phase === 1
        ? { a, b, dir: true, cls: hot && hot[0] === a && hot[1] === b ? 'hot' : '' }
        : { a: b, b: a, dir: true, cls: hot && hot[0] === b && hot[1] === a ? 'hot' : comp[a] && comp[a] === comp[b] ? 'c' + (cidx[comp[a]] + 1) : '' }),
      state: phase === 1
        ? list('پشته', stack.map(v => ltr(`visit(${iv(v)})`))) + ' &nbsp; ' + list('order', order.map(iv))
        : list('پشته', stack.map(v => ltr(`assign(${iv(v)})`))) + ' &nbsp; ' + list('ترتیب شروع', order.slice().reverse().map(iv)) });
    const visit = u => {
      seen.add(u); stack.push(u); hot = null; snap(4, `${ltr(`visit(${iv(u)})`)} شروع شد.`);
      for (const v of Adj[u]) {
        hot = [u, v];
        if (!seen.has(v)) { snap(7, `${iv(v)} دیده نشده؛ به آن می‌رویم.`); visit(v); }
        else snap(6, `${iv(v)} قبلاً دیده شده.`);
      }
      hot = null; order.push(u); snap(8, `${iv(u)} تمام شد و شمارۀ پایان ${fa(order.length)} گرفت.`);
      stack.pop();
    };
    for (const s of V) if (!seen.has(s)) { snap(11, `${iv(s)} دیده نشده؛ DFS از آن شروع می‌شود.`); visit(s); }
    phase = 2; hot = null;
    const AdjT = {};
    V.forEach(v => AdjT[v] = []);
    V.forEach(u => Adj[u].forEach(v => AdjT[v].push(u)));
    snap(16, `مرحلۀ دوم: همۀ یال‌ها برعکس شدند (${ltr(`${iv('G')}<sup>T</sup>`)}). رأس‌ها را به ترتیب نزولی شمارۀ پایان شروع می‌کنیم.`);
    let k = 0;
    const assign = (u, c) => {
      comp[u] = c; stack.push(u); hot = null; snap(19, `${iv(u)} به مؤلفۀ ${iv(c)} رفت.`);
      for (const v of AdjT[u]) {
        hot = [u, v];
        if (!(v in comp)) assign(v, c);
        else snap(21, `${iv(v)} قبلاً مؤلفه دارد؛ از این یال رد می‌شویم.`);
      }
      stack.pop(); hot = null;
    };
    for (const s of order.slice().reverse()) if (!(s in comp)) {
      cidx[s] = k++; snap(25, `${iv(s)} هنوز مؤلفه ندارد؛ مؤلفۀ تازه‌ای از آن شروع می‌شود.`); assign(s, s);
      const mem = V.filter(v => comp[v] === s);
      snap(23, `مؤلفۀ ${ltr(`{${mem.map(iv).join(', ')}}`)} کامل شد؛ از ${iv(s)} در ${ltr(`${iv('G')}<sup>T</sup>`)} به بیرون آن راهی نیست.`);
    }
    return { comp, cidx, order };
  }
  EX.s25scc = () => {
    const code = ['def SCC(V, Adj):', '  # 1. DFS on G, order by decreasing finish time', '  seen, order = set(), []', '  def visit(u):', '    seen.add(u)',
      '    for v in Adj[u]:', '      if v not in seen:', '        visit(v)', '    order.append(u)', '  for s in V:', '    if s not in seen:', '      visit(s)',
      '  # 2. DFS on transpose graph in that order', '  AdjT = {u: [] for u in V}', '  for u in V:', '    for v in Adj[u]:', '      AdjT[v].append(u)',
      '  comp = {}', '  def assign(u, c):', '    comp[u] = c', '    for v in AdjT[u]:', '      if v not in comp:', '        assign(v, c)',
      '  for s in reversed(order):', '    if s not in comp:', '      assign(s, s)', '  return comp'];
    const steps = [];
    sccRun(steps);
    const last = steps[steps.length - 1];
    steps.push({ ...last, line: 26, msg: 'پایان. هر رنگ یک مؤلفۀ قویاً همبند است و مؤلفه‌ها به ترتیب توپولوژیکی گراف مؤلفه‌ها پیدا شدند.' });
    return { view: [400, 250], code, steps };
  };
  EX.s25components = () => {
    const { comp, cidx } = sccRun(null);
    const reps = Object.keys(cidx).sort((a, b) => cidx[a] - cidx[b]);
    const mem = r => Object.keys(sccP).filter(v => comp[v] === r);
    const cls = v => 'c' + (cidx[comp[v]] + 1);
    // the component of each vertex shaded behind the graph
    const shapes = reps.map(r => {
      const xs = mem(r).map(v => sccP[v]);
      const x0 = Math.min(...xs.map(p => p[0])) - 32, x1 = Math.max(...xs.map(p => p[0])) + 32;
      const y0 = Math.min(...xs.map(p => p[1])) - 32, y1 = Math.max(...xs.map(p => p[1])) + 32;
      const pts = xs.length === 3
        ? (() => { const cx = xs.find(p => !xs.some(q => q !== p && q[0] === p[0])) || xs[0];
          return [[x0, y0], [x1, y0], [x1, cx[1] + 32], [x0 + 64, cx[1] + 32], [x0 + 64, y1], [x0, y1]]; })()
        : [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      return { t: 'poly', pts, cls: cls(r) };
    });
    const nodes = nodesOf(sccP, v => ({ cls: cls(v) }));
    const edges = sccE.map(([a, b]) => ({ a, b, dir: true, cls: comp[a] === comp[b] ? cls(a) : '' }));
    // condensed DAG below
    const name = r => mem(r).join('');
    const cx = i => 50 + 100 * i, cy = 330;
    reps.forEach((r, i) => { nodes['C' + r] = { x: cx(i), y: cy, label: name(r), cls: cls(r) }; });
    const dag = new Set();
    sccE.forEach(([a, b]) => { if (comp[a] !== comp[b]) dag.add(comp[a] + '>' + comp[b]); });
    [...dag].forEach(s => {
      const [p, q] = s.split('>'), i = cidx[p], j = cidx[q];
      edges.push({ a: 'C' + p, b: 'C' + q, dir: true, c: j - i > 1 ? [(cx(i) + cx(j)) / 2, cy + (i % 2 ? 70 : -70)] : null });
    });
    shapes.push({ t: 'line', x1: 20, y1: 255, x2: 380, y2: 255, cls: 'ghost' });
    return { view: [400, 400], code: null, steps: [{ nodes, edges, shapes,
      msg: `بالا گراف ${iv('G')} با چهار مؤلفۀ قویاً همبند؛ پایین گراف مؤلفه‌ها ${ltr(`${iv('G')}<sup>SCC</sup>`)} که هر مؤلفه در آن یک رأس است.`,
      state: `گراف مؤلفه‌ها ${fa(dag.size)} یال دارد و دور ندارد: همۀ یال‌هایش از چپ به راست می‌روند.` }] };
  };

  // ---------- session 26: DAG shortest paths (CLRS fig 24.5) ----------
  EX.s26dag = () => {
    const V = ['r', 's', 't', 'x', 'y', 'z'];
    const E = [['r', 's', 5], ['r', 't', 3], ['s', 't', 2], ['s', 'x', 6], ['t', 'x', 7], ['t', 'y', 4], ['t', 'z', 2], ['x', 'y', -1], ['x', 'z', 1], ['y', 'z', -2]];
    const Adj = {}, W = {};
    V.forEach(v => Adj[v] = []);
    E.forEach(([a, b, w]) => { Adj[a].push(b); W[a + b] = w; });
    // topological_sort of session 24
    const par0 = {}, order = [];
    const visit = u => { for (const v of Adj[u]) if (!(v in par0)) { par0[v] = u; visit(v); } order.push(u); };
    for (const s of V) if (!(s in par0)) { par0[s] = null; visit(s); }
    const topo = order.reverse();
    const P = {};
    topo.forEach((v, i) => P[v] = [40 + 80 * i, 200]);
    const code = ['def DAG_shortest_paths(V, Adj, w, s):', '  d = {v: math.inf for v in V}', '  parent = {v: None for v in V}', '  d[s] = 0',
      '  for u in topological_sort(V, Adj):', '    for v in Adj[u]:', '      relax(u, v, w, d, parent)', '  return d, parent'];
    const d = {}, parent = {}, done = new Set(), steps = [];
    V.forEach(v => { d[v] = Infinity; parent[v] = null; });
    let u = null, hot = null, ch = null;
    const arc = (a, b) => { const span = topo.indexOf(b) - topo.indexOf(a); return span > 1 ? [(P[a][0] + P[b][0]) / 2, 200 - 75 * span] : null; };
    const snap = (line, msg) => steps.push({ line, msg,
      nodes: nodesOf(P, v => ({ badge: d[v], pos: 'b', ch: v === ch, cls: (v === u ? 'cur ' : '') + (done.has(v) ? 'done' : d[v] < Infinity ? 'seen' : '') })),
      edges: E.map(([a, b, w]) => ({ a, b, w, dir: true, c: arc(a, b), cls: hot && hot[0] === a && hot[1] === b ? 'hot' : parent[b] === a ? 'tree' : '' })),
      state: `ترتیب توپولوژیکی: ${ltr(topo.map(iv).join(', '))}` });
    d.s = 0; snap(3, `رأس‌ها به ترتیب توپولوژیکی از چپ به راست چیده شده‌اند؛ مبدأ ${iv('s')} است.`);
    for (u of topo) {
      hot = null; ch = null;
      snap(4, d[u] === Infinity ? `نوبت ${iv(u)}؛ فاصله‌اش ∞ است، پس relax یال‌هایش چیزی را عوض نمی‌کند.` : `نوبت ${iv(u)}؛ فاصله‌اش ${fa(d[u])} و دیگر عوض نمی‌شود.`);
      for (const v of Adj[u]) {
        hot = [u, v]; ch = null;
        const w = W[u + v];
        if (d[v] > d[u] + w) {
          const old = d[v]; d[v] = d[u] + w; parent[v] = u; ch = v;
          snap(6, `${ltr(`${fa(d[u])} + ${fa(w)} = ${fa(d[v])} < ${fa(old)}`)}؛ ${ltr(`d[${iv(v)}]`)} کم شد.`);
        } else snap(6, d[u] === Infinity ? `${ltr(`∞ + ${fa(w)}`)} کمتر نیست؛ تغییری نمی‌کند.` : `${ltr(`${fa(d[u])} + ${fa(w)} = ${fa(d[u] + w)} ≥ ${fa(d[v])}`)}؛ تغییری نمی‌کند.`);
      }
      done.add(u);
    }
    u = null; hot = null; ch = null;
    snap(7, `پایان. هر یال یک بار relax شد؛ با وجود یال‌های منفی فاصله‌ها درست‌اند: ${ltr(topo.map(v => `${iv(v)}: ${fa(d[v])}`).join(', '))}.`);
    return { view: [480, 260], code, steps };
  };

  // ---------- session 27: currency arbitrage ----------
  EX.s27arbitrage = () => {
    const P = { USD: [210, 50], EUR: [370, 230], GBP: [50, 230] };
    const R = [['USD', 'EUR', 0.9], ['EUR', 'GBP', 0.9], ['GBP', 'USD', 1.25]];
    const r3 = x => Math.round(x * 1000) / 1000;
    const W = R.map(([a, b, r]) => [a, b, r, -Math.log(r)]);
    const prod = R.reduce((p, e) => p * e[2], 1), sum = W.reduce((s, e) => s + e[3], 0);
    const shapes = W.map(([a, b, r, w]) => {
      const mx = (P[a][0] + P[b][0]) / 2, my = (P[a][1] + P[b][1]) / 2;
      const ox = a === 'USD' ? 52 : a === 'EUR' ? 0 : -52, oy = a === 'EUR' ? 30 : -10;
      return [{ t: 'text', x: mx + ox, y: my + oy - 8, s: `نرخ ${dec(r)}` }, { t: 'text', x: mx + ox, y: my + oy + 10, s: `وزن \u2066${dec(r3(w))}\u2069` }];
    }).flat();
    return { view: [420, 290], code: null, steps: [{ shapes,
      nodes: nodesOf(P, () => ({ cls: 'seen' })),
      edges: W.map(([a, b]) => ({ a, b, dir: true, cls: 'hot' })),
      msg: `حاصل‌ضرب نرخ‌ها روی این دور ${ltr(`${dec(0.9)} × ${dec(0.9)} × ${dec(1.25)} = ${dec(r3(prod * 1000) / 1000)}`)} است، بیشتر از ۱؛ پس با هر دور ${dec(Math.round((prod - 1) * 10000) / 100)}٪ سود می‌کنیم.`,
      state: `وزن هر یال ${ltr('−ln r')} است و مجموع وزن‌ها ${ltr(`${dec(r3(W[0][3]))} + ${dec(r3(W[1][3]))} + (${dec(r3(W[2][3]))}) = ${dec(r3(sum))}`)}؛ دور منفی همان فرصت آربیتراژ است.` }] };
  };

  // ---------- session 28: one negative edge breaks Dijkstra ----------
  EX.s28negative = () => {
    const P = { s: [50, 130], a: [200, 50], b: [200, 210], c: [350, 50] };
    const E = [['s', 'a', 2], ['s', 'b', 3], ['a', 'c', 1], ['b', 'a', -2]];
    const code = ['def dijkstra(V, Adj, w, s):', '  d = {v: math.inf for v in V}', '  parent = {v: None for v in V}', '  d[s] = 0', '  Q = [(0, s)]', '  done = set()',
      '  while Q:', '    du, u = heapq.heappop(Q)', '    if u in done:  # stale item', '      continue', '    done.add(u)', '    for v in Adj[u]:',
      '      if d[v] > du + w(u, v):  # relax', '        d[v] = du + w(u, v)', '        parent[v] = u', '        heapq.heappush(Q, (d[v], v))', '  return d, parent'];
    const V = Object.keys(P), d = {}, par = {}, done = new Set(), steps = [];
    V.forEach(v => { d[v] = Infinity; par[v] = null; });
    // true distances: Bellman-Ford
    const delta = { s: 0, a: Infinity, b: Infinity, c: Infinity };
    for (let i = 0; i < V.length - 1; i++) for (const [a, b, w] of E) if (delta[a] + w < delta[b]) delta[b] = delta[a] + w;
    let Q = [], u = null, hot = null, ch = null;
    const cmp = (x, y) => x[0] - y[0] || (x[1] < y[1] ? -1 : 1);
    const pr = (x, v) => ltr(`(${fa(x)}, ${iv(v)})`);
    const snap = (line, msg) => steps.push({ line, msg,
      nodes: nodesOf(P, v => ({ badge: d[v], pos: P[v][1] > 130 ? 'b' : 't', ch: v === ch, cls: (v === u ? 'cur ' : '') + (done.has(v) ? 'done' : d[v] < Infinity ? 'seen' : '') })),
      edges: E.map(([a, b, w]) => ({ a, b, w, dir: true, cls: hot && hot[0] === a && hot[1] === b ? 'hot' : par[b] === a ? 'tree' : '' })),
      state: list('صف', [...Q].sort(cmp).map(([x, v]) => pr(x, v))) });
    d.s = 0; Q.push([0, 's']); snap(4, `فقط ${iv('s')} در صف است. یال ${ltr(`(${iv('b')}, ${iv('a')})`)} وزن منفی دارد.`);
    while (Q.length) {
      Q.sort(cmp); let du; [du, u] = Q.shift(); hot = null; ch = null;
      if (done.has(u)) { snap(9, `${pr(du, u)} بیرون آمد ولی ${iv(u)} قبلاً نهایی شده؛ رد می‌شویم و یال‌های ${iv(u)} دوباره relax نمی‌شوند.`); continue; }
      done.add(u); snap(10, `${pr(du, u)} بیرون آمد و ${iv(u)} نهایی شد.`);
      for (const [a, v, w] of E) {
        if (a !== u) continue;
        hot = [a, v]; ch = null;
        if (d[v] > du + w) {
          d[v] = du + w; par[v] = u; Q.push([d[v], v]); ch = v;
          snap(15, `${ltr(`${fa(du)} + ${fa(w)} = ${fa(d[v])}`)}؛ ${ltr(`d[${iv(v)}]`)} شد ${fa(d[v])}` + (done.has(v) ? `، ولی ${iv(v)} قبلاً نهایی شده بود.` : '.'));
        } else snap(12, `${ltr(`${fa(du)} + ${fa(w)} ≥ ${fa(d[v])}`)}؛ تغییری نمی‌کند.`);
      }
      hot = null;
    }
    u = null; ch = null;
    const wrong = V.filter(v => d[v] !== delta[v]);
    snap(16, `پایان: دکسترا ${ltr(`d[${iv('c')}] = ${fa(d.c)}`)} می‌دهد ولی مسیر ${ltr('s → b → a → c'.replace(/\w/g, iv))} وزن ${ltr(`${fa(3)} − ${fa(2)} + ${fa(1)} = ${fa(delta.c)}`)} دارد.`
      + (wrong.length ? '' : ' (خطا در محاسبه)'));
    return { view: [400, 260], code, steps };
  };
})();
