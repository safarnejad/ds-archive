// figures for sessions 18–22: tries and suffix trees, suffix array and BWT, Cartesian tree, Fenwick and segment trees, union-find
(function () {
  const { fa, ltr } = AlgoRun;
  const iv = v => `<i>${v}</i>`;
  const EX = window.EX;

  // place a rooted tree: leaves get consecutive x, a parent sits over the middle of its children
  function place(root, kids, x0, dx, y0, dy) {
    let next = 0;
    (function walk(n, d) {
      const ch = kids(n);
      n.y = y0 + d * dy;
      if (!ch.length) { n.x = x0 + dx * next++; return; }
      ch.forEach(c => walk(c, d + 1));
      n.x = (ch[0].x + ch[ch.length - 1].x) / 2;
    })(root, 0);
  }
  // a label beside the middle of an edge, on the outer side
  const edgeText = (a, b, s, cls, t = 0.5, flip = false) => {
    const mx = a.x + (b.x - a.x) * t, my = a.y + (b.y - a.y) * t, w = s.length * 4 + 9;
    const side = (b.x < a.x - 1 ? -1 : 1) * (flip ? -1 : 1);
    return { t: 'text', x: mx + side * w, y: my + 4, s, cls, top: true };
  };

  // ---------- session 18: trie and compressed trie ----------
  function trie(words) {
    const root = { ch: {} };
    for (const w of words) {
      let n = root;
      for (const c of w) n = n.ch[c] || (n.ch[c] = { ch: {} });
      n.word = w;
    }
    return root;
  }
  const sortedKids = n => Object.keys(n.ch).sort().map(c => n.ch[c]);
  // compressed copy: an edge keeps absorbing while its lower end has exactly one child
  function compress(n) {
    const out = { ch: {}, word: n.word, leaf: n.leaf };
    for (const c of Object.keys(n.ch).sort()) {
      let lab = c, m = n.ch[c];
      while (Object.keys(m.ch).length === 1) { const d = Object.keys(m.ch)[0]; lab += d; m = m.ch[d]; }
      out.ch[lab] = compress(m);
    }
    return out;
  }
  function drawTree(root, pre, nodes, edges, shapes, leafText, t) {
    let k = 0;
    (function walk(n) {
      n.id = pre + k++;
      nodes[n.id] = { x: n.x, y: n.y, label: n.leaf !== undefined ? String(n.leaf) : '', cls: n.cls || (Object.keys(n.ch).length ? '' : 'done') };
      if (leafText && !Object.keys(n.ch).length) shapes.push({ t: 'text', x: n.x, y: n.y + 36, s: leafText(n) });
      for (const lab of Object.keys(n.ch).sort()) {
        const c = n.ch[lab];
        walk(c);
        edges.push({ a: n.id, b: c.id });
        shapes.push(edgeText(n, c, lab, '', n === root && t ? t : 0.5, n === root && t && lab.length > 4));
      }
    })(root);
  }
  EX.s18trie = () => {
    const words = ['ana$', 'ann$', 'anna$', 'anne$'];
    const T = trie(words), C = compress(T);
    place(T, sortedKids, 30, 50, 26, 56);
    place(C, sortedKids, 290, 52, 26, 84);
    const nodes = {}, edges = [], shapes = [];
    drawTree(T, 't', nodes, edges, shapes, n => n.word);
    drawTree(C, 'c', nodes, edges, shapes, n => n.word);
    let cntT = 0, cntC = 0;
    (function f(n) { cntT++; Object.values(n.ch).forEach(f); })(T);
    (function f(n) { cntC++; Object.values(n.ch).forEach(f); })(C);
    shapes.push({ t: 'line', x1: 245, y1: 20, x2: 245, y2: 330, cls: 'ghost' });
    return { view: [480, 350], code: null, steps: [{ nodes, edges, shapes,
      msg: `چپ: ترای چهار رشته با ${fa(cntT)} رأس. راست: همان ترای فشرده با ${fa(cntC)} رأس، که زنجیره‌های تک‌فرزندی‌اش در یک یال با برچسب رشته‌ای جمع شده‌اند.`,
      state: 'رأس‌های تیره برگ‌اند و زیر هر برگ رشته‌ای نوشته شده که مسیر ریشه تا آن برگ می‌سازد.' }] };
  };

  // ---------- session 18: suffix tree of banana$ ----------
  EX.s18suffix = () => {
    const t = 'banana$', root = { ch: {} };
    for (let i = 0; i < t.length; i++) {
      let n = root;
      for (const c of t.slice(i)) n = n.ch[c] || (n.ch[c] = { ch: {} });
      n.leaf = i;
    }
    const S = compress(root);
    // deepest internal node = longest repeated substring
    let best = null;
    (function f(n, s) {
      if (n !== S && Object.keys(n.ch).length && (!best || s.length > best.s.length)) best = { n, s };
      for (const lab in n.ch) f(n.ch[lab], s + lab);
    })(S, '');
    best.n.cls = 'seen';
    place(S, sortedKids, 26, 64, 30, 82);
    const nodes = {}, edges = [], shapes = [];
    drawTree(S, "s", nodes, edges, shapes, null, 0.6);
    return { view: [440, 310], code: null, steps: [{ nodes, edges, shapes,
      msg: `درخت پسوندی ${'<code dir=\"ltr\">banana$</code>'}: هر برگ یک پسوند است و عدد داخل آن اندیس شروع پسوند است؛ برچسب‌های مسیر ریشه تا برگ، خود پسوند را می‌سازند.`,
      state: `فرزندان هر رأس به ترتیب حروف چیده شده‌اند (${'<code dir=\"ltr\">$</code>'} کوچک‌ترین است)، پس برگ‌ها از چپ به راست همان آرایۀ پسوندی‌اند. رأس آبی عمیق‌ترین رأس داخلی است: ${'<code dir=\"ltr\">' + best.s + '</code>'}، طولانی‌ترین زیررشته‌ای که دو بار آمده.` }] };
  };

  // ---------- session 19: suffix array and LCP table ----------
  const suffixArray = t => [...t].map((_, i) => i).sort((a, b) => t.slice(a) < t.slice(b) ? -1 : 1);
  function lcpArray(t, sa) { // the note's lcp_array (Kasai)
    const n = t.length, rank = Array(n).fill(0), lcp = Array(n).fill(0);
    for (let r = 0; r < n; r++) rank[sa[r]] = r;
    let h = 0;
    for (let i = 0; i < n; i++) {
      if (rank[i] > 0) {
        const j = sa[rank[i] - 1];
        while (i + h < n && j + h < n && t[i + h] === t[j + h]) h++;
        lcp[rank[i]] = h;
        if (h > 0) h--;
      } else h = 0;
    }
    return lcp;
  }
  EX.s19sa = () => {
    const t = 'banana$', sa = suffixArray(t), lcp = lcpArray(t, sa), shapes = [];
    const cols = [['r', 40], ['sa[r]', 56], ['پسوند', 120], ['lcp[r]', 56]];
    const x0 = 60, y0 = 34, h = 28;
    let x = x0;
    cols.forEach(([name, w]) => { shapes.push({ t: 'text', x: x + w / 2, y: y0 - 10, s: name }); x += w; });
    for (let r = 0; r < t.length; r++) {
      const row = [r, sa[r], t.slice(sa[r]), lcp[r]];
      x = x0;
      cols.forEach(([, w], c) => {
        const cls = c === 3 && lcp[r] > 0 ? 'seen' : '';
        shapes.push({ t: 'rect', x, y: y0 + r * h, w, h, rx: 0, label: row[c], cls });
        x += w;
      });
    }
    return { view: [392, 240], code: null, steps: [{ shapes,
      msg: `پسوندهای ${'<code dir=\"ltr\">banana$</code>'} به ترتیب لغت‌نامه‌ای؛ ستون ${'<code dir=\"ltr\">sa</code>'} آرایۀ پسوندی و ستون ${'<code dir=\"ltr\">lcp</code>'} طول پیشوند مشترک هر سطر با سطر بالایی است.`,
      state: `بیشترین مقدار ${'<code dir=\"ltr\">lcp</code>'}، یعنی ${fa(Math.max(...lcp))} بین ${'<code dir=\"ltr\">ana$</code>'} و ${'<code dir=\"ltr\">anana$</code>'}، طولانی‌ترین زیررشتۀ تکراری را می‌دهد. پسوندهایی که با یک رشته شروع می‌شوند، مثل دو پسوند شروع‌شده با ${'<code dir=\"ltr\">ana</code>'}، سطرهای پشت سر هم‌اند.` }] };
  };

  // ---------- session 19: matrix of sorted rotations ----------
  EX.s19bwt = () => {
    const t = 'banana$', n = t.length, sa = suffixArray(t), shapes = [], c = 30, x0 = 90, y0 = 34;
    for (let r = 0; r < n; r++) {
      shapes.push({ t: 'text', x: x0 - 30, y: y0 + r * c + 20, s: sa[r] });
      const rot = t.slice(sa[r]) + t.slice(0, sa[r]);
      for (let k = 0; k < n; k++)
        shapes.push({ t: 'rect', x: x0 + k * c, y: y0 + r * c, w: c, h: c, rx: 0, label: rot[k], cls: k === 0 ? 'seen' : k === n - 1 ? 'done' : '' });
    }
    shapes.push({ t: 'text', x: x0 - 30, y: y0 - 10, s: 'sa[r]' });
    shapes.push({ t: 'text', x: x0 + c / 2, y: y0 - 10, s: 'F' });
    shapes.push({ t: 'text', x: x0 + (n - 0.5) * c, y: y0 - 10, s: 'L' });
    const L = sa.map(i => t[(i - 1 + n) % n]).join(''), F = sa.map(i => t[i]).join('');
    return { view: [330, 260], code: null, steps: [{ shapes,
      msg: `چرخش‌های ${'<code dir=\"ltr\">banana$</code>'} به ترتیب مرتب‌شده؛ هر سطر از اندیس ${'<code dir=\"ltr\">sa[r]</code>'} شروع می‌شود و ستون آخر تبدیل باروز-ویلر است.`,
      state: `ستون اول <code dir="ltr">F = ${F}</code> همان حروف مرتب‌شده است و ستون آخر <code dir="ltr">L = ${L}</code>.` }] };
  };

  // ---------- session 19: inverting the BWT ----------
  EX.s19ibwt = () => {
    const L = 'annb$aa', n = L.length, c = 30, x0 = 50, y0 = 16, steps = [];
    let rows = Array(n).fill('');
    const snap = (msg, done) => {
      const shapes = [];
      for (let r = 0; r < n; r++) {
        const fin = done && rows[r].endsWith('$');
        shapes.push({ t: 'rect', x: x0 - 36, y: y0 + r * c, w: c, h: c, rx: 0, label: L[r], cls: 'done' });
        for (let k = 0; k < n; k++)
          shapes.push(k < rows[r].length
            ? { t: 'rect', x: x0 + k * c, y: y0 + r * c, w: c, h: c, rx: 0, label: rows[r][k], cls: fin ? 'hot' : k === 0 && !done ? 'seen' : '' }
            : { t: 'rect', x: x0 + k * c, y: y0 + r * c, w: c, h: c, rx: 0, cls: 'ghost' });
      }
      shapes.push({ t: 'text', x: x0 - 21, y: y0 + n * c + 18, s: 'L' });
      steps.push({ shapes, msg, state: `ستون تیره سمت چپ تبدیل <code dir="ltr">L = ${L}</code> است.` });
    };
    snap('جدول خالی است و فقط تبدیل را داریم.');
    for (let i = 1; i <= n; i++) {
      rows = rows.map((s, r) => L[r] + s).sort();
      snap(i === 1 ? 'حروف تبدیل را جلوی سطرها گذاشتیم و مرتب کردیم: ستون اول جدول به دست آمد.'
        : `دوباره تبدیل را جلوی سطرها گذاشتیم و مرتب کردیم: ${fa(i)} ستون اول جدول به دست آمد.`, false);
    }
    const s = rows.find(r => r.endsWith('$'));
    snap(`بعد از ${fa(n)} مرحله کل جدول را داریم و سطری که به ${'<code dir=\"ltr\">$</code>'} ختم می‌شود، ${'<code dir=\"ltr\">' + s + '</code>'}، رشتۀ اصلی است.`, true);
    return { view: [270, 250], code: null, steps };
  };

  // ---------- session 20: Cartesian tree, nodes drawn above their own index ----------
  function cartesian(A) { // the note's cartesian_tree
    const n = A.length, parent = Array(n).fill(null), left = Array(n).fill(null), right = Array(n).fill(null), stack = [];
    for (let i = 0; i < n; i++) {
      let last = null;
      while (stack.length && A[stack[stack.length - 1]] > A[i]) last = stack.pop();
      if (last !== null) { left[i] = last; parent[last] = i; }
      if (stack.length) { right[stack[stack.length - 1]] = i; parent[i] = stack[stack.length - 1]; }
      stack.push(i);
    }
    return { parent, left, right };
  }
  const A20 = [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5];
  function cartFig(cls, cells) {
    const { parent } = cartesian(A20), n = A20.length, X = i => 28 + i * 40;
    const dep = i => { let d = 0; while (parent[i] !== null) { i = parent[i]; d++; } return d; };
    const D = A20.map((_, i) => dep(i)), H = Math.max(...D), ya = 36 + H * 50 + 40;
    const nodes = {}, edges = [], shapes = [];
    A20.forEach((v, i) => {
      nodes[i] = { x: X(i), y: 30 + D[i] * 50, label: String(v), cls: cls[i] || '' };
      if (parent[i] !== null) edges.push({ a: parent[i], b: i, cls: cls.e && cls.e(parent[i], i) });
      shapes.push({ t: 'rect', x: X(i) - 18, y: ya, w: 36, h: 28, rx: 0, label: v, sub: i, cls: cells[i] || '' });
    });
    return { nodes, edges, shapes, view: [460, ya + 46], parent };
  }
  EX.s20cart = () => {
    const f = cartFig({}, {});
    return { view: f.view, code: null, steps: [{ nodes: f.nodes, edges: f.edges, shapes: f.shapes,
      msg: 'هر رأس درست بالای خانۀ خودش در آرایه کشیده شده؛ از بالا به پایین هرم کمینه است و از چپ به راست ترتیب آرایه حفظ شده.',
      state: 'ریشه ۱ کمینۀ کل آرایه است؛ زیردرخت چپش خانه‌های ۰ تا ۲ و زیردرخت راستش خانه‌های ۴ تا ۱۰ را پوشش می‌دهد. عدد زیر هر خانه اندیس آن است.' }] };
  };
  EX.s20rmq = () => {
    const { parent } = cartesian(A20), j = 5, k = 9, steps = [];
    const code = ['def depth(parent, v):', '  d = 0', '  while parent[v] is not None:', '    v = parent[v]', '    d += 1', '  return d', '',
      'def lca(parent, u, v):', '  du, dv = depth(parent, u), depth(parent, v)', '  while du > dv:', '    u, du = parent[u], du - 1',
      '  while dv > du:', '    v, dv = parent[v], dv - 1', '  while u != v:', '    u, v = parent[u], parent[v]', '  return u', '',
      'def rmq_lca(A, parent, j, k):', '  return A[lca(parent, j, k)]'];
    const depth = v => { let d = 0; while (parent[v] !== null) { v = parent[v]; d++; } return d; };
    const seenU = new Set([j]), seenV = new Set([k]);
    let u = j, v = k, fin = null;
    const snap = (line, msg) => {
      const cls = {}, cells = {};
      for (let i = j; i <= k; i++) cells[i] = 'zone-a';
      for (const x of [...seenU, ...seenV]) cls[x] = 'seen';
      cls[u] = cls[v] = 'seen cur';
      if (fin !== null) { cls[fin] = 'done'; cells[fin] = 'done'; }
      const path = (a, b) => (seenU.has(a) && seenU.has(b)) || (seenV.has(a) && seenV.has(b));
      cls.e = (a, b) => path(a, b) ? 'hot' : '';
      const f = cartFig(cls, cells);
      steps.push({ line, msg, nodes: f.nodes, edges: f.edges, shapes: f.shapes, view: f.view,
        state: `${iv('u')} = ${fa(u)} (مقدار ${fa(A20[u])}) &nbsp; ${iv('v')} = ${fa(v)} (مقدار ${fa(A20[v])})` });
    };
    snap(18, `کمینۀ <span class="m"><i>A</i>[${j} … ${k}]</span> را می‌خواهیم؛ خانه‌های این بازه آبی‌اند.`);
    let du = depth(u), dv = depth(v);
    snap(8, `عمق ${iv('u')} برابر ${fa(du)} و عمق ${iv('v')} برابر ${fa(dv)} است.`);
    while (du > dv) { u = parent[u]; du--; seenU.add(u); snap(10, `${iv('u')} عمیق‌تر است و یک رأس بالا می‌رود.`); }
    while (dv > du) { v = parent[v]; dv--; seenV.add(v); snap(12, `${iv('v')} عمیق‌تر است و یک رأس بالا می‌رود.`); }
    while (u !== v) { u = parent[u]; v = parent[v]; seenU.add(u); seenV.add(v); snap(14, 'هم‌عمق‌اند ولی یکی نیستند؛ هر دو یک رأس بالا می‌روند.'); }
    fin = u;
    const min = Math.min(...A20.slice(j, k + 1));
    snap(15, `دو رأس به هم رسیدند: جد مشترک خانۀ ${fa(u)} با مقدار ${fa(A20[u])} است که همان کمینۀ بازه است (${fa(min)}).`);
    const view = steps[0].view;
    steps.forEach(s => delete s.view);
    return { view, code, steps };
  };

  // ---------- session 21: segment tree over 8 numbers ----------
  EX.s21seg = () => {
    const A = [5, 2, 6, 1, 3, 7, 4, 8], n = A.length, T = Array(4 * n).fill(0), info = {};
    (function build(v, lo, hi) { // the note's build
      info[v] = [lo, hi];
      if (lo === hi) { T[v] = A[lo]; return; }
      const mid = (lo + hi) >> 1;
      build(2 * v, lo, mid); build(2 * v + 1, mid + 1, hi);
      T[v] = T[2 * v] + T[2 * v + 1];
    })(1, 0, n - 1);
    const nodes = {}, edges = [], shapes = [];
    for (const v in info) {
      const [lo, hi] = info[v], lvl = Math.floor(Math.log2(v)), leaf = lo === hi;
      const x = 34 + (lo + hi) / 2 * 52, y = 50 + lvl * 72;
      nodes[v] = { x, y, label: String(T[v]), cls: leaf ? '' : 'seen', badge: leaf ? fa(lo) : `[${fa(lo)}, ${fa(hi)}]`, pos: leaf ? 'b' : 't' };
      if (v > 1) edges.push({ a: v >> 1, b: +v });
    }
    return { view: [440, 324], code: null, steps: [{ nodes, edges, shapes,
      msg: `درخت پاره‌خطی جمع روی <code dir="ltr">A = [${A.join(', ')}]</code>: عدد هر رأس جمع بازه‌ای است که بالایش نوشته شده و برگ‌ها خود خانه‌های آرایه‌اند.`,
      state: `ریشه رأس <code dir="ltr">v = 1</code> است و فرزندان رأس ${iv('v')} رأس‌های <code>2v</code> و <code dir="ltr">2v + 1</code>‌اند؛ پس سطر به سطر از چپ به راست، رأس‌ها شماره‌های ۱ تا ۱۵ را دارند. عدد زیر هر برگ اندیس آن در آرایه است.` }] };
  };

  // ---------- session 21: Fenwick tree, prefix_sum(F, 13) and add(F, 5, 2) ----------
  EX.s21fen = () => {
    const n = 14, A = [0, 3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7], F = Array(n + 1).fill(0);
    const add = (i, x, hook) => { while (i < F.length) { F[i] += x; if (hook) hook(i); i += i & -i; } };
    for (let i = 1; i <= n; i++) add(i, A[i]);
    const code = ['def prefix_sum(F, i):  # A[1] + ... + A[i]', '  result = 0', '  while i > 0:', '    result += F[i]', '    i -= i & -i', '  return result', '',
      'def add(F, i, x):  # A[i] += x', '  while i < len(F):', '    F[i] += x', '    i += i & -i'];
    const cw = 30, x0 = 16, ya = 140, steps = [];
    const bin = i => ltr(`${i.toString(2).padStart(4, '0')}<sub>2</sub>`);
    let hot = null, seen = new Set(), cover = [0, 0], changed = null;
    const snap = (line, msg, state) => {
      const shapes = [];
      for (let i = 1; i <= n; i++) {
        const lb = i & -i, lvl = Math.log2(lb);
        shapes.push({ t: 'rect', x: x0 + (i - lb) * cw + 1, y: 14 + (3 - lvl) * 30, w: lb * cw - 2, h: 24, label: F[i],
          cls: i === hot ? 'hot' : seen.has(i) ? 'seen' : '' });
        shapes.push({ t: 'rect', x: x0 + (i - 1) * cw, y: ya, w: cw, h: 26, rx: 0, label: A[i], sub: i,
          cls: i === changed ? 'hot' : i > cover[0] && i <= cover[1] ? 'zone-a' : '' });
      }
      steps.push({ line, msg, state, shapes });
    };
    snap(null, 'هر نوار خانۀ <code>F[i]</code> است و روی خانه‌های آرایه‌ای کشیده شده که جمعشان را دارد؛ ردیف پایین خود آرایه است.',
      `طول نوار <i>i</i> برابر <code dir="ltr">i &amp; -i</code> است، مثلاً نوار ۱۲ = ${bin(12)} چهار خانه دارد.`);
    let i = 13, result = 0;
    snap(1, `<code dir="ltr">prefix_sum(F, 13)</code>: جمع خانه‌های ۱ تا ۱۳ را می‌خواهیم.`, `<i>i</i> = ${fa(i)} = ${bin(i)}`);
    while (i > 0) {
      hot = i; result += F[i]; cover = [i - (i & -i), 13];
      snap(3, `نوار ${fa(i)} خانه‌های ${fa(i - (i & -i) + 1)} تا ${fa(i)} را پوشش می‌دهد؛ ${fa(F[i])} به جواب اضافه شد.`, `<i>i</i> = ${fa(i)} = ${bin(i)} &nbsp; result = ${fa(result)}`);
      seen.add(i);
      i -= i & -i;
      snap(4, i ? `کم‌ارزش‌ترین بیت یک حذف شد: <i>i</i> = ${fa(i)}.` : 'همۀ بیت‌های یک حذف شدند و <i>i</i> = ۰ است.', `<i>i</i> = ${fa(i)}${i ? ' = ' + bin(i) : ''} &nbsp; result = ${fa(result)}`);
    }
    hot = null;
    const check = A.slice(1, 14).reduce((a, b) => a + b, 0);
    snap(5, `جواب ${fa(result)} است، با سه نوار و نه سیزده خانه.`, `جمع مستقیم خانه‌های ۱ تا ۱۳ هم ${fa(check)} است.`);
    seen = new Set(); cover = [0, 0]; A[5] += 2; changed = 5; i = 5;
    snap(7, `<code dir="ltr">add(F, 5, 2)</code>: خانۀ ۵ آرایه ۲ واحد زیاد شد؛ باید نوارهایی را که روی خانۀ ۵ هستند درست کنیم.`, `<i>i</i> = ${fa(i)} = ${bin(i)}`);
    while (i < F.length) {
      F[i] += 2; hot = i;
      snap(9, `نوار ${fa(i)} روی خانۀ ۵ است و ۲ واحد زیاد شد.`, `<i>i</i> = ${fa(i)} = ${bin(i)}`);
      seen.add(i); i += i & -i;
      snap(10, i < F.length ? `کم‌ارزش‌ترین بیت یک اضافه شد: <i>i</i> = ${fa(i)}.` : `<i>i</i> = ${fa(i)} از ${fa(n)} بیشتر است و حلقه تمام می‌شود.`, i < F.length ? `<i>i</i> = ${fa(i)} = ${bin(i)}` : `<i>i</i> = ${fa(i)}`);
    }
    hot = null;
    snap(null, 'فقط نوارهای ۵، ۶ و ۸ تغییر کردند؛ بقیۀ نوارها خانۀ ۵ را ندارند.', '');
    return { view: [452, 186], code, steps };
  };

  // ---------- session 22: union by rank and path compression ----------
  EX.s22uf = () => {
    const n = 8, parent = [], rank = [], steps = [];
    const code = ['def make_set(parent, rank, x):', '  parent[x] = x', '  rank[x] = 0', '', 'def find_set(parent, x):', '  if x != parent[x]:',
      '    parent[x] = find_set(parent, parent[x])', '  return parent[x]', '', 'def union(parent, rank, x, y):',
      '  x, y = find_set(parent, x), find_set(parent, y)', '  if x == y:', '    return', '  if rank[x] < rank[y]:', '    parent[x] = y',
      '  else:', '    parent[y] = x', '    if rank[x] == rank[y]:', '      rank[x] += 1'];
    let hotN = new Set(), hotE = new Set(), rankCh = null;
    const snap = (line, msg) => {
      const kids = v => parent.map((p, c) => p === v && c !== v ? c : -1).filter(c => c >= 0);
      const roots = parent.map((p, v) => p === v ? v : -1).filter(v => v >= 0);
      const nodes = {}, edges = [], shapes = [];
      let next = 0;
      (function lay(list, d) { list.forEach(v => {
        const ch = kids(v);
        if (ch.length) { lay(ch, d + 1); const xs = ch.map(c => nodes[c].x); nodes[v] = { x: (Math.min(...xs) + Math.max(...xs)) / 2 }; }
        else nodes[v] = { x: 30 + 50 * next++ };
        Object.assign(nodes[v], { y: 54 + d * 66, label: String(v), cls: hotN.has(v) ? 'cur' : parent[v] === v ? 'done' : '' });
        if (parent[v] === v) Object.assign(nodes[v], { badge: rank[v], pos: 't', ch: rankCh === v });
      }); })(roots, 0);
      for (let v = 0; v < n; v++) if (parent[v] !== v) edges.push({ a: v, b: parent[v], dir: true, cls: hotE.has(v) ? 'hot' : '' });
      for (let v = 0; v < n; v++) shapes.push({ t: 'rect', x: 30 + 50 * v - 18, y: 236, w: 36, h: 26, rx: 0, label: parent[v], sub: v, cls: hotE.has(v) ? 'hot' : '' });
      shapes.push({ t: 'text', x: 30 + 50 * 8 - 6, y: 254, s: 'parent' });
      steps.push({ line, msg, nodes, edges, shapes, state: 'ریشه‌ها تیره‌اند و عدد بالای هر ریشه مرتبۀ آن است؛ ردیف پایین آرایۀ <code>parent</code> است.' });
      hotN = new Set(); hotE = new Set(); rankCh = null;
    };
    const find = x => { // the note's find_set, marking every pointer it rewrites
      if (x !== parent[x]) { const r = find(parent[x]); if (parent[x] !== r) hotE.add(x); parent[x] = r; }
      return parent[x];
    };
    for (let x = 0; x < n; x++) { parent[x] = x; rank[x] = 0; }
    snap(1, 'با <code>make_set</code> هشت مجموعۀ تک‌عضوی ساختیم؛ هر عنصر پدر خودش است.');
    const union = (a, b) => {
      const x = find(a), y = find(b), comp = [...hotE];
      hotN = new Set([x, y]);
      snap(10, `<code dir="ltr">union(${a}, ${b})</code>: نماینده‌ها ${fa(x)} و ${fa(y)}‌اند` + (comp.length
        ? `؛ ${comp.map(fa).join(' و ')} در مسیر پیدا کردن نماینده مستقیم به ریشه وصل شد${comp.length > 1 ? 'ند' : ''}.` : '.'));
      if (x === y) return;
      if (rank[x] < rank[y]) { parent[x] = y; hotE.add(x); snap(14, `مرتبۀ ${fa(x)} کمتر است، پس ${fa(x)} زیر ${fa(y)} می‌رود.`); }
      else {
        parent[y] = x; hotE.add(y);
        if (rank[x] === rank[y]) { rank[x]++; rankCh = x; snap(18, `مرتبه‌ها برابرند: ${fa(y)} زیر ${fa(x)} می‌رود و مرتبۀ ${fa(x)} یکی زیاد می‌شود.`); }
        else snap(16, `مرتبۀ ${fa(y)} کمتر است، پس ${fa(y)} زیر ${fa(x)} می‌رود و مرتبه‌ها تغییر نمی‌کنند.`);
      }
    };
    [[0, 1], [2, 3], [0, 2], [4, 5], [6, 7], [4, 6], [3, 7]].forEach(([a, b]) => union(a, b));
    const r = find(5), comp = [...hotE];
    hotN = new Set([5]);
    snap(6, `<code dir="ltr">find_set(5)</code>: مسیر ۵ به ۴ به ${fa(r)} است و ${comp.map(fa).join(' و ')} مستقیم به ریشۀ ${fa(r)} وصل شد.`);
    return { view: [470, 280], code, steps };
  };
})();
