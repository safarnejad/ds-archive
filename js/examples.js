// the worked examples of the notes; each one runs the note's own code and records every executed line
(function () {
  const { fa, ltr } = AlgoRun;
  const iv = v => `<i>${v}</i>`;
  const pair = (d, v) => ltr(`(${fa(d)}, ${iv(v)})`);
  const list = (title, xs) => `${title}: ` + (xs.length ? xs.map(x => `<span>${x}</span>`).join('') : '<span class="empty">خالی</span>');
  const nodesOf = (P, f) => Object.fromEntries(Object.keys(P).map(v => [v, { x: P[v][0], y: P[v][1], label: v, ...f(v) }]));

  const EX = window.EX;

  // ---------- session 23: a directed and an undirected graph ----------
  EX.graphs = () => {
    const U = { 1: [40, 50], 2: [140, 50], 3: [240, 50], 5: [40, 150], 4: [140, 150] };
    const D = { a: [300, 50], b: [400, 50], c: [500, 50], d: [300, 150], e: [400, 150], f: [500, 150] };
    const nodes = {};
    for (const v in U) nodes['u' + v] = { x: U[v][0], y: U[v][1], label: v };
    for (const v in D) nodes['d' + v] = { x: D[v][0], y: D[v][1], label: String(' ۱۲۳۴۵۶'['abcdef'.indexOf(v) + 1]) };
    const edges = [[1, 2], [1, 5], [2, 5], [2, 3], [2, 4], [3, 4], [4, 5]].map(([a, b]) => ({ a: 'u' + a, b: 'u' + b }))
      .concat([['a', 'b'], ['a', 'd'], ['b', 'e'], ['c', 'f'], ['c', 'e'], ['d', 'b'], ['e', 'd']].map(([a, b]) => ({ a: 'd' + a, b: 'd' + b, dir: true })));
    return { view: [540, 200], code: null, steps: [{ nodes, edges,
      msg: 'سمت چپ گراف بدون جهت با ۵ رأس و ۷ یال، سمت راست گراف جهت‌دار با ۶ رأس و ۷ یال.',
      state: `در گراف بدون جهت یال ${ltr('{۱, ۲}')} همان ${ltr('{۲, ۱}')} است؛ در گراف جهت‌دار ${ltr('(۴, ۲)')} یال هست ولی ${ltr('(۲, ۴)')} نیست.` }] };
  };

  // ---------- session 23: BFS ----------
  EX.bfs = () => {
    const P = { r: [40, 60], s: [130, 60], t: [220, 60], u: [310, 60], v: [40, 170], w: [130, 170], x: [220, 170], y: [310, 170] };
    const E = [['r', 's'], ['r', 'v'], ['s', 'w'], ['w', 't'], ['w', 'x'], ['t', 'x'], ['t', 'u'], ['x', 'u'], ['x', 'y'], ['u', 'y']];
    const Adj = {};
    for (const v in P) Adj[v] = [];
    for (const [a, b] of E) { Adj[a].push(b); Adj[b].push(a); }
    for (const v in Adj) Adj[v].sort();
    const code = ['def BFS(Adj, s):', '  level = {s: 0}', '  parent = {s: None}', '  i = 1', '  frontier = [s]', '  while frontier:',
      '    next = []', '    for u in frontier:', '      for v in Adj[u]:', '        if v not in level:', '          level[v] = i',
      '          parent[v] = u', '          next.append(v)', '    frontier = next', '    i += 1', '  return level, parent'];
    const steps = [], level = {}, parent = {};
    let frontier = [], next = [], u = null, hot = null, ch = null, i = 0;
    const snap = (line, msg) => steps.push({ line, msg,
      nodes: nodesOf(P, v => ({ badge: v in level ? level[v] : null, pos: P[v][1] < 100 ? 't' : 'b', ch: v === ch,
        cls: (v === u ? 'cur ' : '') + (frontier.includes(v) ? 'seen' : next.includes(v) ? 'next' : v in level ? 'done' : '') })),
      edges: E.map(([a, b]) => ({ a, b, cls: hot && ((hot[0] === a && hot[1] === b) || (hot[0] === b && hot[1] === a)) ? 'hot' : parent[b] === a || parent[a] === b ? 'tree' : '' })),
      state: list('مجموعۀ مرزی', frontier.map(iv)) + ' &nbsp; ' + list('لایۀ بعد', next.map(iv)) });
    level.s = 0; parent.s = null; snap(1, 'رأس شروع <i>s</i> در لایۀ ۰ است.');
    i = 1; frontier = ['s']; snap(4, 'مجموعۀ مرزی فقط <i>s</i> است.');
    while (frontier.length) {
      next = []; snap(6, `ساختن لایۀ ${fa(i)} شروع شد.`);
      for (u of frontier) {
        hot = null; snap(7, `رأس ${iv(u)} از مجموعۀ مرزی.`);
        for (const v of Adj[u]) {
          hot = [u, v]; ch = null;
          if (!(v in level)) {
            level[v] = i; parent[v] = u; next.push(v); ch = v;
            snap(12, `${iv(v)} تازه دیده شد: لایۀ ${fa(i)}، پدرش ${iv(u)}.`);
          } else snap(9, `${iv(v)} قبلاً دیده شده (لایۀ ${fa(level[v])}).`);
        }
      }
      u = null; hot = null; ch = null;
      frontier = next; next = []; snap(13, frontier.length ? `لایۀ ${fa(i)} کامل شد و مجموعۀ مرزی جدید است.` : 'لایۀ جدید خالی است.');
      i++;
    }
    snap(15, 'پایان. عدد کنار هر رأس فاصلۀ آن از <i>s</i> است و یال‌های پررنگ درخت BFS را می‌سازند.');
    return { view: [350, 230], code, steps };
  };

  // ---------- session 24: DFS ----------
  const dfsGraph = { P: { u: [50, 60], v: [170, 60], w: [290, 60], x: [50, 180], y: [170, 180], z: [290, 180] },
    E: [['u', 'v'], ['u', 'x'], ['v', 'y'], ['w', 'y'], ['w', 'z'], ['x', 'v'], ['y', 'x']] };
  function dfsRun(code, lines, topo) {
    const { P, E } = topo || dfsGraph, V = Object.keys(P), Adj = {};
    V.forEach(v => Adj[v] = []);
    E.forEach(([a, b]) => Adj[a].push(b));
    const steps = [], parent = {}, stack = [], fin = [];
    let hot = null;
    const snap = (line, msg) => steps.push({ line, msg,
      nodes: nodesOf(P, v => ({ cls: (v === stack[stack.length - 1] ? 'cur ' : '') + (fin.includes(v) ? 'done' : stack.includes(v) ? 'seen' : ''),
        badge: topo && fin.includes(v) ? fin.indexOf(v) + 1 : null, pos: P[v][1] < 120 ? 't' : 'b' })),
      edges: E.map(([a, b]) => ({ a, b, dir: true, cls: hot && hot[0] === a && hot[1] === b ? 'hot' : parent[b] === a ? 'tree' : '' })),
      state: list('پشتۀ بازگشت', stack.map(v => ltr(`visit(${iv(v)})`))) + (topo ? ' &nbsp; ' + list('ترتیب پایان', fin.map(iv)) : '') });
    function visit(u) {
      stack.push(u); hot = null; snap(lines.visit, `${ltr(`visit(${iv(u)})`)} شروع شد.`);
      for (const v of Adj[u]) {
        hot = [u, v];
        if (!(v in parent)) {
          parent[v] = u; snap(lines.parent, `${iv(v)} دیده نشده؛ پدرش ${iv(u)} می‌شود و به آن می‌رویم.`);
          visit(v); hot = null;
          snap(lines.loop, `به ${ltr(`visit(${iv(u)})`)} برگشتیم.`);
        } else snap(lines.check, `${iv(v)} قبلاً دیده شده؛ از این یال رد می‌شویم.`);
      }
      hot = null;
      if (topo) { fin.push(u); snap(lines.finish, `${iv(u)} تمام شد و به انتهای order اضافه شد.`); }
      else { fin.push(u); snap(lines.loop, `همسایه‌های ${iv(u)} تمام شد؛ ${ltr(`visit(${iv(u)})`)} برمی‌گردد.`); }
      stack.pop();
    }
    for (const s of V) {
      snap(lines.outer, `رأس ${iv(s)} در حلقۀ بیرونی.`);
      if (!(s in parent)) { parent[s] = null; snap(lines.root, `${iv(s)} دیده نشده؛ ریشۀ یک درخت جدید است.`); visit(s); }
    }
    return steps;
  }
  EX.dfs = () => {
    const code = ['def DFS(V, Adj):', '  parent = {}', '  def visit(u):', '    for v in Adj[u]:', '      if v not in parent:',
      '        parent[v] = u', '        visit(v)', '  for s in V:', '    if s not in parent:', '      parent[s] = None', '      visit(s)', '  return parent'];
    const steps = dfsRun(code, { visit: 2, loop: 3, check: 4, parent: 5, outer: 7, root: 9 });
    steps.push({ ...steps[steps.length - 1], line: 11, msg: 'پایان. یال‌های پررنگ جنگل DFS را می‌سازند: یک درخت از <i>u</i> و یکی از <i>w</i>.' });
    return { view: [340, 240], code, steps };
  };

  // ---------- session 24: topological sort ----------
  EX.topo = () => {
    const G = { P: { a: [40, 120], b: [140, 50], c: [140, 190], d: [240, 120], e: [340, 120], f: [240, 230] },
      E: [['a', 'b'], ['a', 'c'], ['b', 'd'], ['c', 'd'], ['d', 'e'], ['f', 'd']] };
    const code = ['def topological_sort(V, Adj):', '  parent, order = {}, []', '  def visit(u):', '    for v in Adj[u]:', '      if v not in parent:',
      '        parent[v] = u', '        visit(v)', '    order.append(u)  # u finishes', '  for s in V:', '    if s not in parent:',
      '      parent[s] = None', '      visit(s)', '  return order[::-1]'];
    const steps = dfsRun(code, { visit: 2, loop: 3, check: 4, parent: 5, finish: 7, outer: 8, root: 10 }, G);
    const last = steps[steps.length - 1];
    steps.push({ ...last, line: 12, msg: `عکس order جواب است: ${ltr('f, a, c, b, d, e'.replace(/\w/g, iv))}. هر یال از رأسی با عدد پایان بزرگ‌تر به رأسی با عدد کوچک‌تر می‌رود.` });
    return { view: [380, 270], code, steps };
  };

  // ---------- shortest-path graphs (CLRS 24.4 and 24.6 layout) ----------
  const SP = { s: [50, 145], t: [170, 60], x: [310, 60], y: [170, 220], z: [310, 220] };
  const zs = [130, 360];

  EX.spIntro = () => {
    const P = { a: [50, 110], b: [330, 110], c: [140, 200], d: [240, 200] };
    const E = [['a', 'b', 10], ['a', 'c', 2], ['c', 'd', 3], ['d', 'b', 1]];
    const path = ['ac', 'cd', 'db'];
    return { view: [380, 250], code: null, steps: [{
      nodes: nodesOf(P, v => ({ cls: v === 'a' || v === 'b' ? 'done' : '' })),
      edges: E.map(([a, b, w]) => ({ a, b, w, dir: true, cls: path.includes(a + b) ? 'tree' : '' })),
      msg: 'مسیر یک‌یالی از <i>a</i> به <i>b</i> وزن ۱۰ دارد، ولی مسیر سه‌یالی پررنگ وزن ۲ + ۳ + ۱ = ۶ دارد؛ پس δ(<i>a</i>, <i>b</i>) = ۶.' }] };
  };

  EX.dijkstra = () => {
    const E = [['s', 't', 10], ['s', 'y', 5], ['t', 'x', 1], ['t', 'y', 2], ['y', 't', 3], ['y', 'x', 9], ['y', 'z', 2], ['x', 'z', 4], ['z', 'x', 6], ['z', 's', 7]];
    const code = ['d[s] = 0; Q = [(0, s)]', 'while Q:', '  du, u = heapq.heappop(Q)', '  if u in done:  # stale item', '    continue', '  done.add(u)',
      '  for v in Adj[u]:', '    if d[v] > du + w(u, v):  # relax', '      d[v] = du + w(u, v); parent[v] = u', '      heapq.heappush(Q, (d[v], v))'];
    const V = Object.keys(SP), d = {}, par = {}, done = new Set(), steps = [];
    V.forEach(v => { d[v] = Infinity; par[v] = null; });
    let Q = [], u = null, hot = null, ch = null;
    const cmp = (a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1);
    const snap = (line, msg) => steps.push({ line, msg,
      nodes: nodesOf(SP, v => ({ badge: d[v], pos: SP[v][1] > 145 ? 'b' : 't', ch: v === ch,
        cls: (v === u ? 'cur ' : '') + (done.has(v) ? 'done' : d[v] < Infinity ? 'seen' : '') })),
      edges: E.map(([a, b, w]) => ({ a, b, w, dir: true, c: a === 'z' && b === 's' ? zs : null,
        cls: hot && hot[0] === a && hot[1] === b ? 'hot' : par[b] === a ? 'tree' : '' })),
      state: list('صف', [...Q].sort(cmp).map(([x, v]) => pair(x, v))) });
    d.s = 0; Q.push([0, 's']); snap(0, 'فاصلۀ مبدأ صفر است و فقط <i>s</i> در صف است.');
    for (;;) {
      ch = null;
      if (!Q.length) break;
      snap(1, 'صف خالی نیست، پس ادامه می‌دهیم.');
      Q.sort(cmp);
      let du;
      [du, u] = Q.shift(); hot = null;
      snap(2, `کوچک‌ترین زوج صف ${pair(du, u)} بیرون می‌آید.`);
      if (done.has(u)) { snap(4, `${iv(u)} قبلاً نهایی شده؛ این زوج کهنه است و از آن رد می‌شویم.`); continue; }
      done.add(u); snap(5, `فاصلۀ ${iv(u)} نهایی شد: ${fa(du)}.`);
      for (const [a, v, w] of E) {
        if (a !== u) continue;
        hot = [a, v]; ch = null;
        if (d[v] > du + w) {
          d[v] = du + w; par[v] = u; Q.push([d[v], v]); ch = v;
          snap(8, `${ltr(`${fa(du)} + ${fa(w)} = ${fa(du + w)}`)} کمتر از فاصلۀ قبلی است؛ ${ltr(`d[${iv(v)}]`)} شد ${fa(d[v])} و زوج ${pair(d[v], v)} به صف رفت.`);
        } else snap(7, `${ltr(`${fa(du)} + ${fa(w)} = ${fa(du + w)} ≥ ${fa(d[v])}`)}؛ تغییری نمی‌کند.`);
      }
      hot = null;
    }
    u = null; snap(1, 'صف خالی شد. یال‌های پررنگ درخت کوتاه‌ترین مسیر از <i>s</i> هستند.');
    return { view: [360, 320], code, steps };
  };

  EX.bellman = () => {
    const E = [['t', 'x', 5], ['t', 'y', 8], ['t', 'z', -4], ['x', 't', -2], ['y', 'x', -3], ['y', 'z', 9], ['z', 'x', 7], ['z', 's', 2], ['s', 't', 6], ['s', 'y', 7]];
    const code = ['def bellman_ford(V, E, w, s):', '  d = {v: math.inf for v in V}', '  parent = {v: None for v in V}', '  d[s] = 0',
      '  for round in range(len(V) - 1):', '    for u, v in E:', '      relax(u, v, w, d, parent)', '  # check for a negative cycle reachable from s',
      '  for u, v in E:', '    if d[v] > d[u] + w(u, v):  # This edge can still be relaxed', '      raise ValueError("There\'s a negative cycle reachable from s!")', '  return d, parent'];
    const V = Object.keys(SP), d = {}, par = {}, steps = [];
    V.forEach(v => { d[v] = Infinity; par[v] = null; });
    let hot = null, ch = null, round = null;
    const snap = (line, msg) => steps.push({ line, msg,
      nodes: nodesOf(SP, v => ({ badge: d[v], pos: SP[v][1] > 145 ? 'b' : 't', ch: v === ch, cls: d[v] < Infinity ? 'seen' : '' })),
      edges: E.map(([a, b, w]) => ({ a, b, w, dir: true, c: a === 'z' && b === 's' ? zs : null, lp: a + b === 'tz' || a + b === 'yx' ? 0.3 : 0.5,
        cls: hot && hot[0] === a && hot[1] === b ? 'hot' : par[b] === a ? 'tree' : '' })),
      state: round === null ? '' : `دور ${fa(round + 1)} از ${fa(V.length - 1)}` });
    d.s = 0; snap(3, 'فقط فاصلۀ <i>s</i> صفر است و بقیه ∞.');
    for (round = 0; round < V.length - 1; round++) {
      hot = null; ch = null; snap(4, `دور ${fa(round + 1)}: همۀ یال‌ها را به ترتیب relax می‌کنیم.`);
      for (const [u, v, w] of E) {
        hot = [u, v]; ch = null;
        if (d[v] > d[u] + w) {
          const old = d[v]; d[v] = d[u] + w; par[v] = u; ch = v;
          snap(6, `${ltr(`${fa(d[u])} + ${fa(w)} = ${fa(d[v])} < ${fa(old)}`)}؛ ${ltr(`d[${iv(v)}]`)} کم شد.`);
        } else snap(6, `${ltr(`${fa(d[u])} + ${fa(w)} ≥ ${fa(d[v])}`)}؛ تغییری نمی‌کند.`);
      }
    }
    round = null; ch = null;
    for (const [u, v, w] of E) { hot = [u, v]; snap(9, `بررسی دور منفی: ${ltr(`${fa(d[u])} + ${fa(w)} ≥ ${fa(d[v])}`)}؛ این یال دیگر relax نمی‌شود.`); }
    hot = null; snap(11, 'هیچ یالی relax نشد، پس دور منفی نیست. یال‌های پررنگ درخت کوتاه‌ترین مسیر از <i>s</i> هستند.');
    return { view: [360, 320], code, steps };
  };

  // ---------- session 10: red-black trees ----------
  const node = (k, red, l, r) => { const n = { k, red, l, r, p: null }; if (l) l.p = n; if (r) r.p = n; return n; };
  const clrs = () => node(11, false, node(2, true, node(1, false), node(7, false, node(5, true), node(8, true))), node(14, false, null, node(15, true)));
  function treeNodes(root, extra) {
    const nodes = {}, edges = [];
    let i = 0;
    (function walk(n, depth) {
      if (!n) return;
      walk(n.l, depth + 1);
      nodes[n.k] = { x: 30 + 42 * i++, y: 40 + 56 * depth, label: String(n.k), cls: (n.red ? 'red' : 'black') + ' ' + ((extra.cls || {})[n.k] || ''),
        badge: (extra.badge || {})[n.k], pos: 't' };
      walk(n.r, depth + 1);
    })(root, 0);
    (function link(n) { if (!n) return; for (const c of [n.l, n.r]) if (c) { edges.push({ a: n.k, b: c.k }); link(c); } })(root);
    return { nodes, edges };
  }
  EX.rbExample = () => {
    const root = clrs(), badge = {};
    (function bh(n) { if (!n) return 0; const h = bh(n.l) + (n.red ? 0 : 1); bh(n.r); badge[n.k] = 'bh ' + fa(h); return h; })(root);
    const t = treeNodes(root, { badge });
    return { view: [400, 260], code: null, steps: [{ ...t,
      msg: 'ریشه سیاه است، هیچ رأس قرمزی فرزند قرمز ندارد و از هر رأس تا برگ‌های <code>None</code> زیرش تعداد رأس‌های سیاه یکسان است.',
      state: 'عدد بالای هر رأس ارتفاع سیاه آن است: تعداد رأس‌های سیاه روی مسیر از خود رأس تا یک برگ (بدون <code>None</code>). ارتفاع سیاه ریشه ۲ و ارتفاع درخت ۳ است.' }] };
  };
  EX.rbInsert = () => {
    const T = { root: clrs() }, steps = [];
    let cur = null, p = null, g = null, uncle = null;
    const snap = (line, msg) => {
      const badge = {}, cls = {};
      for (const [n, name] of [[g, 'پدربزرگ'], [uncle, 'عمو'], [p, 'پدر'], [cur, 'رأس فعلی']]) if (n) badge[n.k] = name;
      if (cur) cls[cur.k] = 'cur';
      steps.push({ line, msg, ...treeNodes(T.root, { badge, cls }) });
    };
    const rotate = (x, dir) => { // dir 'l': x.r goes up
      const y = dir === 'l' ? x.r : x.l, b = dir === 'l' ? y.l : y.r;
      if (dir === 'l') { x.r = b; y.l = x; } else { x.l = b; y.r = x; }
      if (b) b.p = x;
      y.p = x.p;
      if (!x.p) T.root = y; else if (x.p.l === x) x.p.l = y; else x.p.r = y;
      x.p = y;
    };
    snap(0, 'درخت قرمز-سیاه اولیه (شکل ۱۳٫۴ کتاب CLRS). کلید ۴ را درج می‌کنیم.');
    let n = T.root;
    while (n.l && 4 < n.k || n.r && 4 > n.k) n = 4 < n.k ? n.l : n.r;
    cur = node(4, false); cur.p = n; n.l = cur;
    snap(5, 'درج معمولی درخت دودویی جست‌وجو: ۴ فرزند چپ ۵ می‌شود.');
    cur.red = true; snap(6, 'رأس تازه قرمز است. حالا ۴ و پدرش ۵ هر دو قرمزند و خاصیت ۳ خراب شده.');
    snap(7, 'حالا از رأس تازه به بالا درخت را درست می‌کنیم.');
    for (;;) {
      if (!(cur.p && cur.p.red)) { snap(10, `پدر ${fa(cur.k)} سیاه است؛ حلقه تمام می‌شود.`); break; }
      snap(10, `پدر ${fa(cur.k)} قرمز است؛ وارد حلقه می‌شویم.`);
      p = cur.p; snap(11, `پدر: ${fa(p.k)}`);
      g = p.p; snap(12, `پدربزرگ: ${fa(g.k)}`);
      uncle = p === g.l ? g.r : g.l; snap(13, `عمو (برادر پدر): ${fa(uncle.k)}`);
      if (uncle.red) {
        snap(14, 'عمو قرمز است: حالت ۱.');
        p.red = uncle.red = false; snap(15, `${fa(p.k)} و ${fa(uncle.k)} سیاه می‌شوند.`);
        g.red = true; snap(16, `${fa(g.k)} قرمز می‌شود. تعداد سیاه‌ها در هر مسیر عوض نشد.`);
        cur = g; p = g = uncle = null; snap(17, `مشکل دو سطح بالا رفت: حالا ${fa(cur.k)} و پدرش ممکن است هر دو قرمز باشند.`);
        continue;
      }
      snap(18, 'عمو سیاه است: حالت ۲، با دوران حل می‌شود.');
      snap(19, `${fa(p.k)} فرزند چپ ${fa(g.k)} است.`);
      if (cur === p.r) {
        snap(20, `${fa(cur.k)} فرزند راست ${fa(p.k)} است (زیگزاگ).`);
        rotate(p, 'l'); snap(21, `دوران چپ روی ${fa(p.k)}: زیگزاگ صاف شد.`);
        [cur, p] = [p, cur]; snap(22, `حالا ${fa(cur.k)} رأس فعلی است و ${fa(p.k)} پدر آن؛ مسیر صاف شده است.`);
      }
      uncle = null;
      rotate(g, 'r'); snap(23, `دوران راست روی ${fa(g.k)}: ${fa(p.k)} بالا آمد.`);
      p.red = false; snap(29, `${fa(p.k)} سیاه می‌شود.`);
      g.red = true; snap(30, `${fa(g.k)} قرمز می‌شود. حالا ${fa(p.k)} سیاه است و حلقه تمام می‌شود.`);
    }
    p = g = uncle = null; cur = null;
    T.root.red = false; snap(31, 'ریشه سیاه می‌ماند. همۀ خواص درخت قرمز-سیاه برقرار است.');
    return { view: [440, 300], code: null, steps };
  };

})();
