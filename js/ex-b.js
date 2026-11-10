// figures for sessions 06-10: traversals, expression trees, heaps, BST delete, AVL, 2-3 trees
(function () {
  const { fa, ltr } = AlgoRun;
  const EX = window.EX;
  const iv = v => `<i>${v}</i>`;
  const list = (title, xs) => `${title}: ` + (xs.length ? xs.map(x => `<span>${x}</span>`).join('') : '<span class="empty">خالی</span>');
  const lab = k => typeof k === 'number' ? String(k) : k;

  // binary tree drawing: x by inorder rank, y by depth; nodes are {id, key, left, right}
  function layout(roots, opt) {
    const { x0 = 30, dx = 42, y0 = 40, dy = 58, gap = 0, f = () => ({}) } = opt || {};
    const nodes = {}, edges = [];
    let i = 0, g = 0;
    for (const root of roots) {
      (function walk(n, d) {
        if (!n) return;
        walk(n.left, d + 1);
        nodes[n.id] = { x: x0 + dx * i++ + g, y: y0 + dy * d, label: lab(n.key), ...f(n) };
        walk(n.right, d + 1);
      })(root, 0);
      (function link(n) { if (!n) return; for (const c of [n.left, n.right]) if (c) { edges.push({ a: n.id, b: c.id, cls: (opt && opt.ecls) ? opt.ecls(n, c) : '' }); link(c); } })(root);
      g += gap;
    }
    return { nodes, edges };
  }
  let uid = 0;
  const mk = (key, left = null, right = null) => ({ id: 'n' + uid++, key, left, right });

  // ---------- session 06: three traversals ----------
  EX.s06traversal = () => {
    const T = mk('F', mk('B', mk('A'), mk('D', mk('C'), mk('E'))), mk('G', null, mk('I', mk('H'))));
    const pre = [], ino = [], post = [];
    (function preorder(n) { if (n) { pre.push(n.key); preorder(n.left); preorder(n.right); } })(T);
    (function inorder(n) { if (n) { inorder(n.left); ino.push(n.key); inorder(n.right); } })(T);
    (function postorder(n) { if (n) { postorder(n.left); postorder(n.right); post.push(n.key); } })(T);
    const t = layout([T], { x0: 40, dx: 44, y0: 30, dy: 56 });
    const row = xs => ltr(xs.map(iv).join(', '));
    return { view: [440, 230], code: null, steps: [{ ...t,
      msg: 'یک درخت دودویی و سه پیمایش آن.',
      state: `پیش‌ترتیب: ${row(pre)}<br>میان‌ترتیب: ${row(ino)}<br>پس‌ترتیب: ${row(post)}` }] };
  };

  // ---------- session 06: postfix to expression tree with a stack ----------
  EX.s06postfix = () => {
    const code = ['def postfix_to_tree(tokens):', '  S = []', '  for t in tokens:', '    if t in OPS:', '      right = S.pop()', '      left = S.pop()',
      '      S.append(new_node(key=t, left=left, right=right))', '    else:', '      S.append(new_node(key=t, left=None, right=None))', '  return S.pop()'];
    const tokens = 'a b + c d e + * *'.split(' '), OPS = '+-*/';
    const S = [], steps = [];
    let cur = -1, made = null, out = null;
    const snap = (line, msg) => {
      const roots = out ? [out] : S;
      const t = layout(roots, { x0: 26, dx: 38, y0: 100, dy: 54, gap: 22, f: n => ({ cls: n === made ? 'cur seen' : out ? 'done' : '' }) });
      const shapes = tokens.map((tk, j) => ({ t: 'rect', x: 50 + j * 36, y: 14, w: 32, h: 30, label: tk, cls: j === cur ? 'hot' : j < cur ? 'seen' : '' }));
      steps.push({ line, msg, ...t, shapes, state: list('پشته (پایین به بالا)', S.map(n => n.key).map(k => iv(k))) });
    };
    snap(1, `نگارش پس‌وندی ${ltr('<code>a b + c d e + * *</code>')} را از چپ به راست می‌خوانیم؛ پشته خالی است.`);
    for (cur = 0; cur < tokens.length; cur++) {
      const t = tokens[cur];
      if (OPS.includes(t)) {
        const right = S.pop(), left = S.pop();
        made = mk(t, left, right); S.push(made);
        snap(6, `${ltr(`<code>${t}</code>`)} عملگر است: دو درخت بالای پشته فرزند راست و چپ آن می‌شوند و درخت تازه به پشته برمی‌گردد.`);
      } else {
        made = mk(t); S.push(made);
        snap(8, `${iv(t)} مقدار است: یک برگ تازه روی پشته می‌رود.`);
      }
    }
    made = null; out = S.pop(); cur = tokens.length;
    snap(9, `در پشته فقط یک درخت مانده که درخت عبارت ${ltr('<code>(a + b) * (c * (d + e))</code>')} است.`);
    return { view: [420, 300], code, steps };
  };

  // ---------- session 07: heap as tree + array ----------
  const HW = 440;
  function heapFrame(Q, n, cls) {
    const nodes = {}, edges = [], shapes = [];
    for (let i = 0; i < Q.length; i++) {
      const d = Math.floor(Math.log2(i + 1)), p = i + 1 - 2 ** d;
      const c = cls(i);
      if (i < n) {
        nodes['h' + i] = { x: HW * (p + 0.5) / 2 ** d, y: 30 + 56 * d, label: String(Q[i]), cls: c };
        if (i > 0) edges.push({ a: 'h' + Math.floor((i - 1) / 2), b: 'h' + i, cls: '' });
      }
      shapes.push({ t: 'rect', x: 20 + i * 40, y: 236, w: 38, h: 32, label: Q[i], sub: i, cls: i < n ? c.replace('cur', 'hot') : 'ghost' });
    }
    return { nodes, edges, shapes };
  }
  const heapCode = ['def max_heapify_down(Q, i, n):', '  j = i', '  if left(i) < n and Q[left(i)] > Q[j]:', '    j = left(i)',
    '  if right(i) < n and Q[right(i)] > Q[j]:', '    j = right(i)', '  if j != i:', '    Q[i], Q[j] = Q[j], Q[i]', '    max_heapify_down(Q, j, n)'];
  function heapifyDown(Q, i, n, snap) {
    let j = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && Q[l] > Q[j]) j = l;
    if (r < n && Q[r] > Q[j]) j = r;
    if (j !== i) {
      snap(7, [i, j], `${fa(Q[i])} از فرزند بزرگ‌ترش ${fa(Q[j])} کوچک‌تر است؛ جابه‌جا می‌شوند.`, 'before');
      [Q[i], Q[j]] = [Q[j], Q[i]];
      snap(8, [j], `${fa(Q[j])} حالا در خانۀ ${fa(j)} است و از آنجا ادامه می‌دهیم.`);
      heapifyDown(Q, j, n, snap);
    } else snap(6, [i], (2 * i + 1 < n) ? `${fa(Q[i])} از فرزندانش کوچک‌تر نیست؛ متوقف می‌شویم.` : `${fa(Q[i])} برگ است؛ متوقف می‌شویم.`);
  }

  EX.s07buildHeap = () => {
    const code = [...heapCode, '', 'def build_heap(A):', '  for i in range(len(A) // 2 - 1, -1, -1):', '    max_heapify_down(A, i, len(A))'];
    const A = [4, 1, 3, 2, 16, 9, 10, 14, 8, 7], n = A.length, steps = [];
    let top = n, finished = false;
    const sub = i => { const s = new Set(); (function g(k) { if (k < n) { s.add(k); g(2 * k + 1); g(2 * k + 2); } })(i); return s; };
    let zone = new Set();
    const snap = (line, hot, msg) => steps.push({ line, msg, ...heapFrame(A, n, i => finished ? 'done' : hot.includes(i) ? 'cur seen' : zone.has(i) ? 'seen' : i >= top ? 'done' : ''),
      state: `آرایه: ${ltr(A.map(fa).join(' '))}` });
    zone = new Set();
    for (let i = n >> 1; i < n; i++) zone.add(i);
    top = n;
    snap(11, [], `برگ‌ها (خانه‌های ${fa(n >> 1)} تا ${fa(n - 1)}) خودشان هرم‌اند. از آخرین رأس داخلی، خانۀ ${fa((n >> 1) - 1)}، شروع می‌کنیم.`);
    for (let i = (n >> 1) - 1; i >= 0; i--) {
      zone = new Set([...zone, ...sub(i)]);
      snap(12, [i], `${ltr('max_heapify_down')} روی خانۀ ${fa(i)} با کلید ${fa(A[i])}؛ دو زیردرختش هرم‌اند.`);
      heapifyDown(A, i, n, (line, hot, msg) => snap(line, hot, msg));
    }
    finished = true;
    snap(11, [], 'حلقه تمام شد و کل آرایه هرم بیشینه است: بیشینه یعنی ۱۶ در ریشه است.');
    return { view: [HW, 290], code, steps };
  };

  EX.s07deleteMax = () => {
    const code = [...heapCode, '', 'def delete_max(Q):', '  Q[0], Q[-1] = Q[-1], Q[0]', '  v = Q.pop()', '  max_heapify_down(Q, 0, len(Q))', '  return v'];
    const Q = [16, 14, 10, 8, 7, 9, 3, 2, 4, 1], steps = [];
    let gone = null, done = false;
    const snap = (line, hot, msg) => {
      const view = gone === null ? Q : [...Q, gone];
      steps.push({ line, msg, ...heapFrame(view, Q.length, i => done ? 'done' : hot.includes(i) ? 'cur seen' : ''),
        state: `آرایه: ${ltr(Q.map(fa).join(' '))}` + (gone !== null ? ` &nbsp; مقدار حذف‌شده: ${fa(gone)}` : '') });
    };
    snap(10, [], 'هرم بیشینه با ۱۰ عضو. بیشینه را حذف می‌کنیم.');
    snap(11, [0, Q.length - 1], `ریشه ${fa(Q[0])} و آخرین برگ ${fa(Q[Q.length - 1])} جابه‌جا می‌شوند.`);
    [Q[0], Q[Q.length - 1]] = [Q[Q.length - 1], Q[0]];
    gone = Q.pop();
    snap(12, [0], `${fa(gone)} از آخر آرایه برداشته شد. حالا ${fa(Q[0])} در ریشه است و خاصیت هرم را خراب کرده.`);
    snap(13, [0], `${ltr('max_heapify_down')} روی ریشه.`);
    heapifyDown(Q, 0, Q.length, (line, hot, msg) => snap(line, hot, msg));
    done = true;
    snap(14, [], `دوباره هرم بیشینه داریم و ${fa(gone)} برگردانده می‌شود. فقط یک مسیر از ریشه به پایین پیموده شد: ${ltr('O(log <i>n</i>)')}.`);
    return { view: [HW, 290], code, steps };
  };

  // ---------- session 08: BST delete, three cases ----------
  EX.s08delete = () => {
    const code = ['def delete(T, node):', '  if node.left and node.right:', '    succ = find_min(node.right)', '    node.key = succ.key', '    delete(T, succ)',
      '  else:', '    child = node.left or node.right', '    if child:', '      child.parent = node.parent', '    if node.parent is None:',
      '      T.root = child', '    elif node is node.parent.left:', '      node.parent.left = child', '    else:', '      node.parent.right = child'];
    const T = { root: null };
    const ins = k => {
      const n = { ...mk(k), parent: null };
      if (!T.root) { T.root = n; return; }
      let p = T.root;
      for (;;) {
        if (k <= p.key) { if (p.left) p = p.left; else { p.left = n; break; } } else { if (p.right) p = p.right; else { p.right = n; break; } }
      }
      n.parent = p;
    };
    [49, 46, 79, 41, 64, 83, 43].forEach(ins);
    const steps = [];
    let hot = [], ch = null, gone = null;
    const pos = {};
    // keep x positions of the starting tree so the tree does not jump between frames
    const t0 = layout([T.root], { x0: 40, dx: 52, y0: 36, dy: 62 });
    (function walk(n) { if (n) { pos[n.id] = [t0.nodes[n.id].x, t0.nodes[n.id].y]; walk(n.left); walk(n.right); } })(T.root);
    const snap = (line, msg) => {
      const nodes = {}, edges = [];
      (function walk(n, d) {
        if (!n) return;
        nodes[n.id] = { x: pos[n.id][0], y: 36 + 62 * d, label: String(n.key), cls: (hot.includes(n) ? 'cur seen' : ''), badge: n === ch ? 'کلید تازه' : null, ch: n === ch, pos: 't' };
        for (const c of [n.left, n.right]) if (c) { edges.push({ a: n.id, b: c.id }); walk(c, d + 1); }
      })(T.root, 0);
      if (gone) { nodes[gone.id] = { x: pos[gone.id][0], y: gone.y, label: String(gone.key), cls: 'next' }; }
      steps.push({ line, msg, nodes, edges, state: `میان‌ترتیب: ${ltr((function io(n) { return n ? [...io(n.left), fa(n.key), ...io(n.right)] : []; })(T.root).join(' '))}` });
    };
    function del(node) {
      hot = [node]; ch = null;
      if (node.left && node.right) {
        snap(1, `${fa(node.key)} دو فرزند دارد.`);
        let succ = node.right; while (succ.left) succ = succ.left;
        hot = [node, succ]; snap(2, `عضو بعدی، کمینۀ زیردرخت راست، ${fa(succ.key)} است و فرزند چپ ندارد.`);
        node.key = succ.key; ch = node; snap(3, `کلید ${fa(succ.key)} در رأس بالا نوشته می‌شود؛ حالا دو رأس با این کلید داریم.`);
        snap(4, `رأس پایینی ${fa(succ.key)} را حذف می‌کنیم؛ این بار حالت ساده است.`);
        del(succ);
        return;
      }
      const child = node.left || node.right;
      snap(6, child ? `${fa(node.key)} فقط یک فرزند دارد: ${fa(child.key)}.` : `${fa(node.key)} برگ است و فرزندی ندارد.`);
      if (child) child.parent = node.parent;
      const side = node.parent === null ? 10 : node === node.parent.left ? 12 : 14;
      if (side === 10) T.root = child; else if (side === 12) node.parent.left = child; else node.parent.right = child;
      gone = { id: node.id, key: node.key, y: null };
      gone.y = 36 + 62 * (function dep(n) { let d = 0; while (n.parent) { n = n.parent; d++; } return d; })(node);
      hot = child ? [child] : [];
      snap(side, child ? `${fa(child.key)} جای ${fa(node.key)} را زیر ${fa(node.parent.key)} می‌گیرد.` : `${fa(node.key)} از پدرش ${fa(node.parent.key)} جدا می‌شود.`);
      gone = null; hot = []; ch = null;
    }
    hot = [];
    snap(0, 'درخت ساخته‌شده با درج ۴۹، ۴۶، ۷۹، ۴۱، ۶۴، ۸۳، ۴۳. سه رأس را به ترتیب حذف می‌کنیم.');
    const find = k => { let n = T.root; while (n.key !== k) n = k < n.key ? n.left : n.right; return n; };
    del(find(43)); snap(0, 'حالت برگ تمام شد. حالا ۴۶ را حذف می‌کنیم.');
    del(find(46)); snap(0, 'حالت یک فرزند تمام شد. حالا ریشه یعنی ۴۹ را حذف می‌کنیم.');
    del(find(49)); snap(0, 'هر سه حالت دیده شد. ترتیب میان‌ترتیب در همۀ قدم‌ها مرتب ماند.');
    return { view: [400, 260], code, steps };
  };

  // ---------- session 09: rotations with subtrees as triangles ----------
  // T: {n: name, l, r} for a node, {tri: name, h: height text} for a subtree
  function schem(T, x0, dx, y0, dy, f) {
    const nodes = {}, edges = [], shapes = [];
    let i = 0;
    const place = (t, d) => {
      if (t.tri) {
        const x = x0 + dx * i++, y = y0 + dy * d - 16;
        t.at = [x, y];
        shapes.push({ t: 'poly', pts: [[x, y], [x - 21, y + 46], [x + 21, y + 46]], label: t.tri, cls: (f && f(t)) || '' });
        if (t.h) shapes.push({ t: 'text', x, y: y + 62, s: t.h });
        return;
      }
      place(t.l, d + 1);
      t.at = [x0 + dx * i++, y0 + dy * d];
      nodes[t.n + x0] = { x: t.at[0], y: t.at[1], label: t.n, cls: (f && f(t)) || '', badge: t.b, pos: 't' };
      place(t.r, d + 1);
    };
    place(T, 0);
    (function link(t) {
      if (t.tri) return;
      for (const c of [t.l, t.r]) {
        if (c.tri) {
          const [ux, uy] = [c.at[0] - t.at[0], c.at[1] - t.at[1]], L = Math.hypot(ux, uy);
          shapes.push({ t: 'line', x1: t.at[0] + ux / L * 19, y1: t.at[1] + uy / L * 19, x2: c.at[0], y2: c.at[1] });
        } else { edges.push({ a: t.n + x0, b: c.n + x0 }); link(c); }
      }
    })(T);
    return { nodes, edges, shapes };
  }
  const tri = (name, h) => ({ tri: name, h });
  const nd = (n, l, r, b) => ({ n, l, r, b });
  const merge = (...fs) => ({ nodes: Object.assign({}, ...fs.map(f => f.nodes)), edges: fs.flatMap(f => f.edges), shapes: fs.flatMap(f => f.shapes) });

  EX.s09rotate = () => {
    const before = nd('x', tri('A'), nd('y', tri('B'), tri('C'))), after = nd('y', nd('x', tri('A'), tri('B')), tri('C'));
    const order = t => t.tri ? [t.tri] : [...order(t.l), t.n, ...order(t.r)];
    const f = t => t.n ? 'seen' : '';
    const L = schem(before, 30, 44, 40, 62, f), R = schem(after, 300, 44, 40, 62, f);
    const g = merge(L, R);
    g.shapes.push({ t: 'line', x1: 230, y1: 70, x2: 280, y2: 70, dir: true, cls: 'tree' }, { t: 'text', x: 255, y: 58, s: 'چپ‌گرد' },
      { t: 'line', x1: 280, y1: 100, x2: 230, y2: 100, dir: true }, { t: 'text', x: 255, y: 120, s: 'راست‌گرد' });
    const o1 = order(before), o2 = order(after);
    g.shapes.push({ t: 'text', x: 118, y: 250, s: o1.join('  ') }, { t: 'text', x: 388, y: 250, s: o2.join('  ') });
    return { view: [500, 265], code: null, steps: [{ ...g,
      msg: `دوران چپ‌گرد روی ${iv('x')} درخت چپ را به درخت راست تبدیل می‌کند و دوران راست‌گرد روی ${iv('y')} برعکس.`,
      state: `فقط سه اشاره‌گر عوض می‌شود: زیردرخت ${iv('B')} از ${iv('y')} به ${iv('x')} می‌رود. ترتیب میان‌ترتیب در هر دو ${ltr(o1.map(iv).join(', '))} است، پس خاصیت درخت دودویی جست‌وجو می‌ماند.` }] };
  };

  EX.s09zigzag = () => {
    const f = t => t.n ? 'seen' : '';
    const frames = [
      [nd('x', tri('A', 'k'), nd('y', nd('z', tri('B1', '≤ k'), tri('B2', '≤ k')), tri('C', 'k'), '−۱'), '۲'),
        `کجی ${iv('x')} برابر ۲ و کجی فرزند راستش ${iv('y')} برابر ۱− است (زیگزاگ). فرزند چپ ${iv('y')} را ${iv('z')} می‌نامیم.`,
        `اگر ارتفاع ${iv('A')} و ${iv('C')} برابر ${iv('k')} باشد، ارتفاع ${iv('z')} برابر ${iv('k')} + ۱ و ${iv('B1')}، ${iv('B2')} حداکثر ${iv('k')} است. یک دوران چپ‌گرد روی ${iv('x')} اینجا کافی نیست: ${iv('z')} زیر ${iv('x')} می‌رود و باز کجی ۲− می‌شود.`],
      [nd('x', tri('A', 'k'), nd('z', tri('B1', '≤ k'), nd('y', tri('B2', '≤ k'), tri('C', 'k')))),
        `قدم اول: دوران راست‌گرد روی ${iv('y')}. حالا ${iv('z')} فرزند راست ${iv('x')} است و مسیر ${iv('x')}، ${iv('z')}، ${iv('y')} صاف شده.`,
        `${iv('B2')} از ${iv('z')} به ${iv('y')} رفت.`],
      [nd('z', nd('x', tri('A', 'k'), tri('B1', '≤ k')), nd('y', tri('B2', '≤ k'), tri('C', 'k')), '۰'),
        `قدم دوم: دوران چپ‌گرد روی ${iv('x')}. ${iv('z')} ریشۀ زیردرخت می‌شود و ${iv('x')} و ${iv('y')} فرزندانش.`,
        `کجی ${iv('x')} و ${iv('y')} حالا ۱−، ۰ یا ۱ است و ارتفاع کل زیردرخت ${iv('k')} + ۲ است. ترتیب میان‌ترتیب ${ltr(['A', 'x', 'B1', 'z', 'B2', 'y', 'C'].map(iv).join(', '))} در هر سه شکل یکی است.`]];
    return { view: [400, 300], code: null, steps: frames.map(([T, msg, state]) => ({ ...schem(T, 50, 50, 44, 66, f), msg, state })) };
  };

  // ---------- session 09: AVL insert, the note's maintain / balance ----------
  EX.s09avlInsert = () => {
    const code = ['def maintain(T, node):', '  update(node)', '  balance(T, node)', '  if node.parent:', '    maintain(T, node.parent)', '',
      'def balance(T, node):', '  if node.skew == 2:', '    if node.right.skew == -1:', '      right_rotate(T, node.right)', '    left_rotate(T, node)',
      '  elif node.skew == -2:', '    if node.left.skew == 1:', '      left_rotate(T, node.left)', '    right_rotate(T, node)', '',
      'def avl_insert(T, k):', '  if T.root is None:', '    T.root = new_node(key=k, parent=None, left=None, right=None)', '    node = T.root',
      '  else:', '    node = insert(T.root, k)    # BST insert, session 8', '  maintain(T, node)'];
    const T = { root: null }, steps = [];
    let hot = [], ch = null;
    const height = n => n ? n.height : -1;
    const update = n => { n.height = 1 + Math.max(height(n.left), height(n.right)); n.skew = height(n.right) - height(n.left); };
    const replace = (x, y) => { y.parent = x.parent; if (!x.parent) T.root = y; else if (x === x.parent.left) x.parent.left = y; else x.parent.right = y; };
    const leftRotate = x => { const y = x.right; x.right = y.left; if (y.left) y.left.parent = x; replace(x, y); y.left = x; x.parent = y; update(x); update(y); };
    const rightRotate = x => { const y = x.left; x.left = y.right; if (y.right) y.right.parent = x; replace(x, y); y.right = x; x.parent = y; update(x); update(y); };
    const snap = (line, msg) => {
      const t = layout(T.root ? [T.root] : [], { x0: 40, dx: 64, y0: 50, dy: 58,
        f: n => ({ cls: hot.includes(n) ? 'cur seen' : '', badge: n.skew === undefined ? null : fa(n.skew), ch: ch === n || (Array.isArray(ch) && ch.includes(n)), pos: 't' }) });
      steps.push({ line, msg, ...t, state: 'عدد بالای هر رأس کجی آن است: ارتفاع فرزند راست منهای ارتفاع فرزند چپ.' });
    };
    function maintain(node) {
      const old = node.skew; update(node); hot = [node]; ch = old !== node.skew ? node : null;
      const ok = Math.abs(node.skew) < 2;
      snap(ok ? 2 : 1, `${ltr('update')}: ارتفاع ${fa(node.key)} برابر ${fa(node.height)} و کجی آن ${fa(node.skew)} است.` + (ok ? ` کجی در بازۀ ۱− تا ۱ است و ${ltr('balance')} کاری نمی‌کند.` : ''));
      ch = null;
      if (node.skew === 2) {
        if (node.right.skew === -1) {
          snap(8, `کجی ${fa(node.key)} برابر ۲ و کجی فرزند راستش ${fa(node.right.skew)} است: حالت زیگزاگ.`);
          const r = node.right; rightRotate(r); hot = [node, r.parent]; ch = [r, r.parent];
          snap(9, `دوران راست‌گرد روی ${fa(r.key)}: ${fa(r.parent.key)} بالا آمد.`);
        } else snap(7, `کجی ${fa(node.key)} برابر ۲ است و کجی فرزند راستش ${fa(node.right.skew)}.`);
        leftRotate(node); hot = [node.parent]; ch = [node, node.parent];
        snap(10, `دوران چپ‌گرد روی ${fa(node.key)}: ${fa(node.parent.key)} جای آن را گرفت.`);
      } else if (node.skew === -2) {
        if (node.left.skew === 1) {
          snap(12, `کجی ${fa(node.key)} برابر ۲− و کجی فرزند چپش ۱ است: حالت زیگزاگ.`);
          const l = node.left; leftRotate(l); hot = [node, l.parent]; ch = [l, l.parent];
          snap(13, `دوران چپ‌گرد روی ${fa(l.key)}: ${fa(l.parent.key)} بالا آمد.`);
        } else snap(11, `کجی ${fa(node.key)} برابر ۲− است و کجی فرزند چپش ${fa(node.left.skew)}.`);
        rightRotate(node); hot = [node.parent]; ch = [node, node.parent];
        snap(14, `دوران راست‌گرد روی ${fa(node.key)}: ${fa(node.parent.key)} جای آن را گرفت.`);
      }
      ch = null;
      if (node.parent) { hot = [node.parent]; snap(4, `به پدر، ${fa(node.parent.key)}، بالا می‌رویم.`); maintain(node.parent); }
      else { hot = []; snap(3, `${fa(node.key)} ریشه است؛ ${ltr('maintain')} تمام شد.`); }
    }
    function avlInsert(k) {
      let node;
      if (!T.root) { node = T.root = { ...mk(k), parent: null }; hot = [node]; snap(18, `درخت خالی است؛ ${fa(k)} ریشه می‌شود.`); }
      else {
        let p = T.root;
        for (;;) {
          if (k <= p.key) { if (p.left) p = p.left; else { node = p.left = { ...mk(k), parent: p }; break; } }
          else { if (p.right) p = p.right; else { node = p.right = { ...mk(k), parent: p }; break; } }
        }
        hot = [node]; snap(21, `درج معمولی: ${fa(k)} فرزند ${node === p.left ? 'چپ' : 'راست'} ${fa(p.key)} می‌شود.`);
      }
      maintain(node);
    }
    for (const k of [1, 2, 3, 5, 4]) avlInsert(k);
    hot = []; snap(22, `پنج درج انجام شد: یک دوران چپ‌گرد روی ۱ و یک دوران ترکیبی روی ۳. ارتفاع درخت ${fa(T.root.height)} است.`);
    return { view: [400, 250], code, steps };
  };

  // ---------- session 10: 2-3 tree insert with splits ----------
  EX.s10twoThree = () => {
    const N = (keys, kids = []) => ({ keys, kids });
    const T = { root: N([30, 60], [N([10, 20]), N([40, 50]), N([70, 80])]) };
    const steps = [];
    let hot = new Set(), fresh = new Set();
    const snap = (msg, state) => {
      const shapes = [], box = new Map();
      const depth = (n) => n.kids.length ? 1 + depth(n.kids[0]) : 0, H = depth(T.root);
      const leaves = [];
      (function g(n) { if (!n.kids.length) leaves.push(n); n.kids.forEach(g); })(T.root);
      const wOf = n => 28 * n.keys.length + 14;
      const total = leaves.reduce((s, n) => s + wOf(n), 0) + 18 * (leaves.length - 1);
      let x = (420 - total) / 2;
      for (const n of leaves) { box.set(n, [x, wOf(n)]); x += wOf(n) + 18; }
      (function place(n, d) {
        n.kids.forEach(c => place(c, d + 1));
        if (n.kids.length) {
          const a = box.get(n.kids[0]), b = box.get(n.kids[n.kids.length - 1]), mid = (a[0] + b[0] + b[1]) / 2;
          box.set(n, [mid - wOf(n) / 2, wOf(n)]);
        }
        n.y = 30 + 76 * d;
      })(T.root, 0);
      (function draw(n) {
        const [bx, w] = box.get(n);
        n.kids.forEach((c, i) => {
          const [cx, cw] = box.get(c);
          shapes.push({ t: 'line', x1: bx + w * (i + 0.5) / n.kids.length, y1: n.y + 30, x2: cx + cw / 2, y2: c.y, cls: '' });
          draw(c);
        });
        shapes.push({ t: 'rect', x: bx, y: n.y, w, h: 30, rx: 6, label: n.keys.map(fa).join('   '), cls: hot.has(n) ? 'hot' : fresh.has(n) ? 'seen' : '' });
      })(T.root);
      steps.push({ msg, state, shapes, nodes: {}, edges: [] });
      void H;
    };
    snap('یک درخت ۲-۳: هر رأس یک یا دو کلید دارد و همۀ برگ‌ها هم‌عمق‌اند.', 'کلیدهای هر زیردرخت بین دو کلید رأس بالای آن هستند.');
    function insert(k) {
      const path = [];
      let n = T.root;
      while (n.kids.length) { path.push(n); let i = 0; while (i < n.keys.length && k > n.keys[i]) i++; n = n.kids[i]; }
      n.keys.push(k); n.keys.sort((a, b) => a - b);
      hot = new Set(n.keys.length > 2 ? [n] : []); fresh = new Set([n]);
      snap(`${fa(k)} به برگ ${n.keys.filter(x => x !== k).map(fa).join('، ')} اضافه می‌شود.`,
        n.keys.length > 2 ? 'این برگ سه کلید دارد و بیش از حد پر است.' : 'برگ دو کلید دارد و مشکلی نیست.');
      while (n.keys.length > 2) {
        const [a, b, c] = n.keys, L = N([a], n.kids.slice(0, 2)), R = N([c], n.kids.slice(2));
        const p = path.pop();
        if (p) {
          const i = p.kids.indexOf(n);
          p.kids.splice(i, 1, L, R); p.keys.push(b); p.keys.sort((x, y) => x - y);
          hot = new Set(p.keys.length > 2 ? [p] : []); fresh = new Set([L, R, p]);
          snap(`رأس ${[a, b, c].map(fa).join('، ')} به ${fa(a)} و ${fa(c)} شکست و کلید وسط ${fa(b)} به پدر رفت.`,
            p.keys.length > 2 ? 'حالا پدر سه کلید دارد و آن هم باید بشکند.' : 'پدر حداکثر دو کلید دارد و کار تمام است.');
          n = p;
        } else {
          T.root = N([b], [L, R]);
          hot = new Set(); fresh = new Set([T.root, L, R]);
          snap(`ریشه ${[a, b, c].map(fa).join('، ')} به ${fa(a)} و ${fa(c)} شکست و ${fa(b)} ریشۀ جدید شد.`,
            'ارتفاع فقط از بالا زیاد شد، برای همین همۀ برگ‌ها هنوز هم‌عمق‌اند.');
          break;
        }
      }
    }
    insert(45);
    insert(55);
    hot = new Set(); fresh = new Set();
    snap('درج ۴۵ و ۵۵ تمام شد و درخت همچنان کاملاً متوازن است.', '');
    return { view: [420, 250], code: null, steps };
  };
})();
