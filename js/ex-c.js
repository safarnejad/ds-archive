// figures for sessions 11 and 13–17: median of medians, radix sort, hashing, Karatsuba
(function () {
  const { fa, ltr } = AlgoRun;
  const iv = v => `<i>${v}</i>`;
  const EX = window.EX;
  const leg = items => `<div class="dj-legend">${items.map(([c, t]) => `<span style="background:${c}"></span>${t}`).join(' &nbsp; ')}</div>`;

  // ---------- session 11: median of medians ----------
  EX.s11medianGrid = () => {
    const S = [12, 3, 47, 25, 8, 31, 19, 40, 6, 27, 14, 35, 2, 22, 44, 9, 29, 17, 38, 5, 33, 11, 24, 46, 15, 1, 30, 42, 20, 7, 36, 18, 26, 4, 39];
    const cols = [];
    for (let i = 0; i < S.length; i += 5) cols.push(S.slice(i, i + 5).sort((a, b) => a - b)); // a, b
    cols.sort((p, q) => p[2] - q[2]); // only for drawing: columns ordered by their median
    const meds = cols.map(c => c[2]), mid = (cols.length - 1) / 2, x = meds[mid]; // c
    const le = S.filter(v => v < x).length, ge = S.filter(v => v > x).length;
    const W = 44, H = 30, X0 = 40, Y0 = 20, shapes = [];
    shapes.push({ t: 'rect', x: X0 - 4, y: Y0 - 4, w: (mid + 1) * W + 4, h: 3 * H + 4, cls: 'zone-a' });
    shapes.push({ t: 'rect', x: X0 + mid * W, y: Y0 + 2 * H, w: (cols.length - mid) * W + 4, h: 3 * H + 4, cls: 'zone-b' });
    cols.forEach((c, j) => c.forEach((v, r) => shapes.push({ t: 'rect', x: X0 + j * W + 5, y: Y0 + r * H + 3, w: W - 10, h: H - 6,
      cls: v === x ? 'hot' : r === 2 ? 'seen' : '', label: v })));
    shapes.push({ t: 'text', x: 18, y: Y0 + 2 * H + 20, s: '→' });
    return { view: [400, 200], code: null, steps: [{ shapes,
      msg: `۳۵ عدد در ۷ ستون ۵تایی؛ هر ستون از بالا به پایین مرتب است و ستون‌ها به ترتیب میانه‌شان چیده شده‌اند. میانۀ سطر وسط ${ltr(iv('x') + ' = ' + fa(x))} است.`,
      state: `هر خانۀ ناحیۀ آبی حتماً کوچک‌تر یا مساوی ${iv('x')} و هر خانۀ ناحیۀ زرد حتماً بزرگ‌تر یا مساوی آن است (هر کدام ۱۲ عنصر). پس ${iv('L')} حداکثر ${fa(35 - 12)} عضو دارد؛ در این مثال ${fa(le)} عضو کوچک‌تر و ${fa(ge)} عضو بزرگ‌تر از ${fa(x)} هست.`
        + leg([['#dbeafe', 'حتماً کوچک‌تر یا مساوی ' + iv('x')], ['#fde68a', 'حتماً بزرگ‌تر یا مساوی ' + iv('x')]]) }] };
  };

  // ---------- session 13: radix sort ----------
  EX.s13radix = () => {
    const code = ['def radix_sort(A, b):', '  d = 1', '  while b ** d <= max(A, default=0):', '    d += 1', '  for i in range(d):',
      '    A = counting_sort(A, b, key=lambda a: a // b ** i % b)', '  return A'];
    const counting = (A, k, key) => { const L = Array.from({ length: k }, () => []); A.forEach(a => L[key(a)].push(a)); return L.flat(); };
    let A = [329, 457, 657, 839, 436, 720, 355];
    const b = 10, cols = [A], steps = [];
    const DW = 20, CW = 3 * DW, GAP = 34, X0 = 20, Y0 = 34, RH = 28, names = ['ورودی', 'رقم یکان', 'رقم دهگان', 'رقم صدگان'];
    const snap = (line, msg, act) => {
      const shapes = [];
      cols.forEach((C, ci) => {
        const x0 = X0 + ci * (CW + GAP);
        shapes.push({ t: 'text', x: x0 + CW / 2, y: 18, s: names[ci] });
        C.forEach((v, r) => String(v).split('').forEach((dg, di) => shapes.push({ t: 'rect', x: x0 + di * DW, y: Y0 + r * RH, w: DW, h: RH - 4, rx: 0,
          cls: ci === cols.length - 1 && act !== null && 2 - di === act ? 'hot' : ci === 3 ? 'done' : '', label: fa(dg) })));
        if (ci) shapes.push({ t: 'line', x1: x0 - GAP + 6, y1: Y0 + 3 * RH + 10, x2: x0 - 6, y2: Y0 + 3 * RH + 10, dir: true });
      });
      steps.push({ line, msg, shapes });
    };
    let d = 1;
    while (b ** d <= Math.max(...A)) d++;
    snap(3, `بزرگ‌ترین عدد ${fa(Math.max(...A))} است، پس ${ltr(iv('d') + ' = ' + fa(d))} رقم داریم.`, null);
    for (let i = 0; i < d; i++) {
      A = counting(A, b, a => Math.floor(a / b ** i) % b); cols.push(A);
      snap(5, i === 0 ? 'با مرتب‌سازی شمارشی بر اساس رقم یکان مرتب کردیم.'
        : `بر اساس رقم ${i === 1 ? 'دهگان' : 'صدگان'} مرتب کردیم. اعداد با رقم مساوی (مثل ${i === 1 ? `${fa(720)} و ${fa(329)}` : `${fa(436)} و ${fa(457)}`}) ترتیب مرحلۀ قبل را نگه داشتند.`, i);
    }
    steps.push({ ...steps[steps.length - 1], line: 6, msg: 'پایان: آرایه مرتب است.' });
    steps[steps.length - 1].shapes = steps[steps.length - 1].shapes.map(s => s.cls === 'hot' ? { ...s, cls: 'done' } : s);
    return { view: [CW * 4 + GAP * 3 + 40, 250], code, steps };
  };

  // ---------- session 14: chaining ----------
  EX.s14chain = () => {
    const m = 7, keys = [10, 22, 31, 4, 15, 28, 17], h = k => k % m, T = Array.from({ length: m }, () => []);
    keys.forEach(k => T[h(k)].push(k));
    const shapes = [], X0 = 50, Y0 = 12, RH = 32, CW = 40;
    T.forEach((ch, j) => {
      const y = Y0 + j * RH;
      shapes.push({ t: 'text', x: X0 - 16, y: y + 19, s: j });
      shapes.push({ t: 'rect', x: X0, y, w: 34, h: RH - 6, rx: 0, cls: ch.length ? 'seen' : '' });
      let px = X0 + 34;
      ch.forEach((k, i) => {
        const x = X0 + 70 + i * (CW + 30);
        shapes.push({ t: 'line', x1: px - 12 + (i ? 12 : 0), y1: y + 13, x2: x, y2: y + 13, dir: true });
        shapes.push({ t: 'rect', x, y, w: CW, h: RH - 6, label: k });
        px = x + CW;
      });
    });
    return { view: [330, 240], code: null, steps: [{ shapes,
      msg: `جدول با ${ltr(iv('m') + ' = ' + fa(m))} خانه و ${ltr(iv('h') + '(' + iv('k') + ') = ' + iv('k') + ' mod ' + fa(7))}؛ کلیدها به همین ترتیب درج شده‌اند و هر خانه به لیست کلیدهای خودش اشاره می‌کند.`,
      state: keys.map(k => ltr(`${iv('h')}(${fa(k)}) = ${fa(h(k))}`)).join('، ') }] };
  };

  // ---------- session 15: open addressing with linear probing and deletion ----------
  EX.s15probe = () => {
    const m = 11, h = k => k % m, slots = Array(m).fill(null), DEL = 'del', steps = [];
    const X0 = 8, CW = 34, Y0 = 30;
    const snap = (msg, probe, mark) => {
      const shapes = slots.map((s, j) => ({ t: 'rect', x: X0 + j * CW, y: Y0, w: CW - 2, h: 34, rx: 0, sub: j,
        cls: j === probe ? 'hot' : s === DEL ? 'ghost' : s !== null ? (j === mark ? 'done' : 'seen') : '',
        label: s === DEL ? '×' : s === null ? '' : s }));
      if (probe !== null) shapes.push({ t: 'line', x1: X0 + probe * CW + 16, y1: 4, x2: X0 + probe * CW + 16, y2: Y0 - 3, dir: true, cls: 'hot' });
      steps.push({ msg, shapes, state: `${ltr(iv('h') + '′(' + iv('k') + ') = ' + iv('k') + ' mod ' + fa(11))}؛ خانۀ × یعنی «حذف‌شده».` });
    };
    snap('جدول خالی با ۱۱ خانه و وارسی خطی.', null);
    for (const k of [22, 33, 1, 13, 12]) {
      let free = null;
      for (let i = 0; i < m; i++) {
        const j = (h(k) + i) % m, s = slots[j];
        if (s === null || s === DEL) { if (free === null) free = j; if (s === null) break; }
        else snap(`درج ${fa(k)}: وارسی ${fa(i)} خانۀ ${fa(j)} را می‌بیند که پر است.`, j);
      }
      slots[free] = k;
      snap(`${fa(k)} در خانۀ ${fa(free)} نشست (${ltr(iv('h') + '′ = ' + fa(h(k)))}).`, free);
    }
    const del = 33;
    for (let i = 0; i < m; i++) { const j = (h(del) + i) % m; if (slots[j] === del) { slots[j] = DEL; snap(`حذف ${fa(del)}: به جای خالی کردن خانۀ ${fa(j)} در آن «حذف‌شده» می‌نویسیم.`, j); break; } }
    const q = 12;
    for (let i = 0; i < m; i++) {
      const j = (h(q) + i) % m, s = slots[j];
      if (s === null) { snap(`به خانۀ خالی رسیدیم؛ ${fa(q)} در جدول نیست.`, j); break; }
      if (s === DEL) snap(`جست‌وجوی ${fa(q)}: خانۀ ${fa(j)} «حذف‌شده» است؛ مثل خانۀ پر از آن رد می‌شویم. اگر خالی‌اش کرده بودیم همین‌جا جست‌وجو به اشتباه تمام می‌شد.`, j);
      else if (s === q) { snap(`${fa(q)} در خانۀ ${fa(j)} پیدا شد.`, null, j); break; }
      else snap(`جست‌وجوی ${fa(q)}: خانۀ ${fa(j)} کلید ${fa(s)} را دارد؛ ادامه می‌دهیم.`, j);
    }
    return { view: [390, 90], code: null, steps };
  };

  // ---------- session 15: Karp-Rabin with a rolling hash ----------
  EX.s15karpRabin = () => {
    const t = '31415926', s = '92', a = 10, p = 13, n = s.length, steps = [];
    const rs = s.split('').reduce((h, c) => (h * a + +c) % p, 0);
    let rt = t.slice(0, n).split('').reduce((h, c) => (h * a + +c) % p, 0);
    const X0 = 40, CW = 36, Y0 = 28;
    const snap = (i, msg, cls) => {
      const shapes = t.split('').map((c, j) => ({ t: 'rect', x: X0 + j * CW, y: Y0, w: CW - 2, h: 34, rx: 0, sub: j, label: fa(c),
        cls: j >= i && j < i + n ? cls : '' }));
      shapes.push({ t: 'rect', x: X0 + i * CW - 2, y: Y0 - 4, w: n * CW + 2, h: 42, cls: 'ghost' });
      steps.push({ msg, shapes, state: `${ltr(iv('h') + '(' + iv('s') + ') = ' + fa(s) + ' mod ' + fa(p) + ' = ' + fa(rs))} &nbsp; ${ltr(iv('h') + '(پنجره) = ' + fa(rt))}` });
    };
    snap(0, `دنبال ${ltr(iv('s') + ' = ' + fa(s))} در ${iv('t')} می‌گردیم؛ مبنا ${ltr(iv('a') + ' = ' + fa(a))} و ${ltr(iv('p') + ' = ' + fa(p))}.`, 'seen');
    for (let i = 0; i + n <= t.length; i++) {
      const w = t.slice(i, i + n);
      if (rt !== rs) snap(i, `پنجرۀ ${fa(w)}: درهمش ${fa(rt)} است و با ${fa(rs)} فرق دارد؛ قطعاً جواب نیست.`, 'seen');
      else if (w !== s) snap(i, `پنجرۀ ${fa(w)}: درهم‌ها برابرند (${fa(rt)}) ولی مقایسۀ حرف به حرف نشان می‌دهد ${fa(w)} ≠ ${fa(s)}؛ برخورد کاذب.`, 'hot');
      else { snap(i, `پنجرۀ ${fa(w)}: درهم‌ها برابرند و رشته‌ها هم برابرند؛ ${iv('s')} در مکان ${fa(i)} پیدا شد.`, 'done'); }
      if (i + n < t.length) {
        const old = rt, out = +t[i], inn = +t[i + n];
        rt = ((rt - out * a ** (n - 1)) % p + p) % p; // skip
        rt = (rt * a + inn) % p; // append
        if (i < 1) snap(i + 1, `جابه‌جایی پنجره: ${ltr(`((${fa(old)} − ${fa(out)} · ${fa(a)}) · ${fa(a)} + ${fa(inn)}) mod ${fa(p)} = ${fa(rt)}`)}؛ فقط با درهم قبلی و دو رقم، در ${ltr(iv('O') + '(۱)')}.`, 'seen');
      }
    }
    return { view: [370, 90], code: null, steps };
  };

  // ---------- session 16: cuckoo hashing ----------
  EX.s16cuckoo = () => {
    const code = ['def cuckoo_place(C, x):', '  for _ in range(C.limit):', '    j = C.h1(x)', '    C.T1[j], x = x, C.T1[j]', '    if x is None:', '      return None',
      '    j = C.h2(x)', '    C.T2[j], x = x, C.T2[j]', '    if x is None:', '      return None', '  return x   # the key left without a place'];
    const m = 10, H1 = { A: 2, B: 2, C: 6, D: 9, E: 6 }, H2 = { A: 5, B: 8, C: 5, D: 1, E: 3 };
    const T1 = Array(m).fill(null), T2 = Array(m).fill(null), steps = [];
    const X0 = 40, CW = 32, Y1 = 22, Y2 = 112;
    const snap = (line, msg, hot, from) => {
      const shapes = [{ t: 'text', x: 18, y: Y1 + 21, s: 'T1' }, { t: 'text', x: 18, y: Y2 + 21, s: 'T2' }];
      [[T1, Y1, 1], [T2, Y2, 2]].forEach(([T, y, ti]) => T.forEach((v, j) => shapes.push({ t: 'rect', x: X0 + j * CW, y, w: CW - 2, h: 32, rx: 0,
        sub: ti === 2 ? j : undefined, label: v || '', cls: hot && hot[0] === ti && hot[1] === j ? 'hot' : v ? 'seen' : '' })));
      if (from) shapes.push({ t: 'line', x1: X0 + from[1] * CW + 15, y1: from[0] === 1 ? Y1 + 34 : Y2 - 2, x2: X0 + hot[1] * CW + 15, y2: hot[0] === 1 ? Y1 + 34 : Y2 - 2, dir: true, cls: 'hot', top: true });
      steps.push({ line, msg, shapes, state: `خانۀ هر کلید در ${iv('T')}₁ و ${iv('T')}₂: ` + ['A', 'B', 'C', 'D', 'E'].map(k => ltr(`${k}: ${fa(H1[k])}, ${fa(H2[k])}`)).join(' &nbsp; ') });
    };
    function place(x, show) {
      let from = null;
      for (;;) {
        let j = H1[x], y = T1[j]; T1[j] = x;
        if (show) snap(3, y ? `${x} در ${ltr('T1[' + fa(j) + ']')} نشست و ${y} را بیرون انداخت.` : `${x} در ${ltr('T1[' + fa(j) + ']')} نشست؛ خانه خالی بود.`, [1, j], from);
        if (!y) return null;
        x = y; from = [1, j];
        j = H2[x]; y = T2[j]; T2[j] = x;
        if (show) snap(7, y ? `${x} به ${ltr('T2[' + fa(j) + ']')} رفت و ${y} را بیرون انداخت.` : `${x} به ${ltr('T2[' + fa(j) + ']')} رفت؛ خانه خالی بود و درج تمام شد.`, [2, j], from);
        if (!y) return null;
        x = y; from = [2, j];
      }
    }
    ['A', 'B', 'C', 'D'].forEach(k => place(k, false));
    snap(0, 'جدول‌ها بعد از درج A، B، C و D (B قبلاً A را به T2 فرستاده است). حالا E را درج می‌کنیم.', null, null);
    place('E', true);
    snap(9, 'زنجیرۀ بیرون‌اندازی E → C → A → B با سه جابه‌جایی تمام شد.', null, null);
    return { view: [370, 165], code, steps };
  };

  // ---------- session 16: Bloom filter ----------
  EX.s16bloom = () => {
    const code = ['def bloom_add(B, x):', '  for h in B.H:', '    B.bits[h(x)] = 1', '', 'def bloom_query(B, x):', '  return all(B.bits[h(x)] for h in B.H)'];
    const m = 12, bits = Array(m).fill(0), owner = Array.from({ length: m }, () => []), steps = [];
    const H = { x: [1, 5, 9], y: [3, 5, 10], z: [1, 3, 9], w: [2, 5, 9] };
    const X0 = 8, CW = 30, Y0 = 40;
    const snap = (line, msg, look) => {
      const shapes = bits.map((b, j) => ({ t: 'rect', x: X0 + j * CW, y: Y0, w: CW - 2, h: 32, rx: 0, label: fa(b), sub: j,
        cls: look && look.includes(j) ? 'hot' : b ? 'seen' : '' }));
      if (look) look.forEach(j => shapes.push({ t: 'line', x1: X0 + j * CW + 14, y1: 10, x2: X0 + j * CW + 14, y2: Y0 - 3, dir: true, cls: 'hot' }));
      bits.forEach((b, j) => owner[j].length && shapes.push({ t: 'text', x: X0 + j * CW + 14, y: Y0 + 66, s: owner[j].join(',') }));
      steps.push({ line, msg, shapes, state: Object.keys(H).map(k => ltr(`${iv(k)}: ${H[k].map(fa).join(', ')}`)).join(' &nbsp; ') });
    };
    snap(null, `فیلتر با ${ltr(iv('m') + ' = ' + fa(m))} بیت و ${ltr(iv('k') + ' = ' + fa(3))} تابع؛ زیر جدول، خانه‌هایی که هر شیء به آن‌ها می‌افتد آمده است.`);
    for (const k of ['x', 'y']) {
      H[k].forEach(j => { bits[j] = 1; owner[j].push(k); });
      snap(2, `درج ${iv(k)}: بیت‌های ${H[k].map(fa).join('، ')} یک شدند.` + (k === 'y' ? ' بیت ۵ میان x و y مشترک است، برای همین نمی‌شود حذف کرد.' : ''), H[k]);
    }
    for (const k of ['z', 'w']) {
      const ans = H[k].every(j => bits[j]);
      snap(5, ans ? `جست‌وجوی ${iv(k)}: هر سه بیت ${H[k].map(fa).join('، ')} یک هستند، پس جواب «هست» است؛ ولی ${iv(k)} درج نشده بود: مثبت کاذب.`
        : `جست‌وجوی ${iv(k)}: بیت ${fa(H[k].find(j => !bits[j]))} صفر است، پس ${iv(k)} قطعاً در مجموعه نیست.`, H[k]);
    }
    return { view: [372, 120], code, steps };
  };

  // ---------- session 17: Karatsuba recursion tree ----------
  EX.s17karatsuba = () => {
    const nodes = []; // {a, b, r, depth, kids}
    const digits = v => String(v).length;
    function kar(a, b, depth) {
      const nd = { a, b, depth, kids: [] }; nodes.push(nd);
      if (a < 10 || b < 10) { nd.r = a * b; return nd; }
      const h = Math.floor(Math.max(digits(a), digits(b)) / 2), P = 10 ** h;
      const a1 = Math.floor(a / P), a0 = a % P, b1 = Math.floor(b / P), b0 = b % P;
      const c2 = kar(a1, b1, depth + 1), c0 = kar(a0, b0, depth + 1), m = kar(a0 + a1, b0 + b1, depth + 1);
      nd.kids = [c2, c0, m];
      const c1 = m.r - c0.r - c2.r;
      nd.r = c2.r * P * P + c1 * P + c0.r; nd.c = [c2.r, c1, c0.r, h];
      return nd;
    }
    const root = kar(1234, 5678, 0);
    if (root.r !== 1234 * 5678) throw new Error('karatsuba');
    // layout: leaves get consecutive slots
    let slot = 0;
    const lay = n => { if (!n.kids.length) n.x = slot++; else { n.kids.forEach(lay); n.x = (n.kids[0].x + n.kids[2].x) / 2; } };
    lay(root);
    const SW = 42, X0 = 26, YS = [18, 78, 138, 198], shapes = [];
    const pos = n => [X0 + n.x * SW, YS[n.depth]];
    const walk = n => {
      const [x, y] = pos(n), w = n.depth < 2 ? 76 : 38;
      n.kids.forEach(k => { const [kx, ky] = pos(k); shapes.push({ t: 'line', x1: x, y1: y + 39, x2: kx, y2: ky }); walk(k); });
      shapes.push({ t: 'rect', x: x - w / 2, y, w, h: 24, label: fa(`${n.a}×${n.b}`), sub: fa(n.r), cls: n.kids.length ? 'seen' : '' });
    };
    walk(root);
    const [c2, c1, c0] = root.c;
    return { view: [480, 250], code: null, steps: [{ shapes,
      msg: `ضرب ${ltr(fa('1234 × 5678'))} در مبنای ۱۰: هر ضرب به سه ضرب نیم‌طول ${ltr(iv('a') + '₁' + iv('b') + '₁')}، ${ltr(iv('a') + '₀' + iv('b') + '₀')} و ${ltr('(' + iv('a') + '₀ + ' + iv('a') + '₁)(' + iv('b') + '₀ + ' + iv('b') + '₁)')} می‌شکند؛ عدد زیر هر خانه حاصل آن است و ضرب‌هایی که یک طرفشان تک‌رقمی است مستقیم حساب می‌شوند.`,
      state: `در ریشه: ${ltr(iv('c') + '₂ = ' + fa(c2) + ', ' + iv('c') + '₀ = ' + fa(c0) + ', ' + iv('c') + '₁ = ' + fa(root.kids[2].r) + ' − ' + fa(c2) + ' − ' + fa(c0) + ' = ' + fa(c1))} و حاصل ${ltr(fa(c2) + ' · ۱۰⁴ + ' + fa(c1) + ' · ۱۰² + ' + fa(c0) + ' = ' + fa(root.r))}.` }] };
  };
})();
