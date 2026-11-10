// figures for sessions 01, 03, 04, 05: 2D peak, recursion tree, merge sort, dynamic array
(function () {
  const { fa, ltr } = AlgoRun;
  const iv = v => `<i>${v}</i>`;
  const EX = window.EX;

  // ---------- session 01: 2D peak ----------
  const G = [[10, 8, 10, 10], [14, 13, 12, 11], [15, 9, 11, 21], [16, 17, 19, 20]];
  const CW = 52, X0 = 40, Y0 = 30;
  const grid = cls => {
    const sh = [];
    for (let j = 0; j < 4; j++) sh.push({ t: 'text', x: X0 + j * CW + CW / 2, y: Y0 - 10, s: `ستون ${fa(j)}` });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++)
      sh.push({ t: 'rect', x: X0 + j * CW + 2, y: Y0 + i * CW + 2, w: CW - 4, h: CW - 4, label: G[i][j], cls: cls(i, j) });
    return sh;
  };
  const isPeak2 = (i, j) => [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]]
    .every(([a, b]) => !G[a] || G[a][b] === undefined || G[a][b] <= G[i][j]);

  EX.s01peakWrong = () => {
    const col = 2, colVals = G.map(r => r[col]);
    // first 1D peak of the middle column, scanning from the top
    const pi = colVals.findIndex((v, i) => (i === 0 || v >= colVals[i - 1]) && (i === 3 || v >= colVals[i + 1]));
    const row = G[pi];
    const pj = row.findIndex((v, j) => (j === 0 || v >= row[j - 1]) && (j === 3 || v >= row[j + 1]));
    const v = G[pi][pj], below = G[pi + 1][pj];
    const sh = grid((i, j) => i === pi && j === pj ? 'hot' : i === pi + 1 && j === pj ? 'done' : j === col && i === pi ? 'seen' : j === col || i === pi ? 'zone-a' : '');
    return { view: [290, 260], code: null, steps: [{ shapes: sh,
      msg: `در ستون وسط ${fa(G[pi][col])} قلۀ یک‌بعدی است و در سطر آن ${fa(v)} قلۀ یک‌بعدی است، ولی ${fa(v)} قلۀ دوبعدی نیست: همسایۀ پایینش ${fa(below)} است.`,
      state: isPeak2(pi, pj) ? '' : `خروجی این راه، ${fa(v)}، غلط است.` }] };
  };

  EX.s01peak2d = () => {
    const code = ['def peak_2d(A, lo, hi):', '  mid = (lo + hi) // 2', '  i = max(range(len(A)), key=lambda r: A[r][mid])  # max of the middle column',
      '  if mid > lo and A[i][mid - 1] > A[i][mid]:', '    return peak_2d(A, lo, mid - 1)', '  if mid < hi and A[i][mid + 1] > A[i][mid]:',
      '    return peak_2d(A, mid + 1, hi)', '  return i, mid'];
    const steps = [];
    let lo = 0, hi = 3, mid = null, mi = null, nb = null, ans = null;
    const snap = (line, msg) => steps.push({ line, msg, shapes: grid((i, j) =>
        ans && i === ans[0] && j === ans[1] ? 'done' : i === mi && j === mid ? 'hot' : nb && i === nb[0] && j === nb[1] ? 'zone-b'
          : j < lo || j > hi ? 'ghost' : j === mid ? 'seen' : ''),
      state: `بازۀ ستون‌ها: ${ltr(`[${fa(lo)}, ${fa(hi)}]`)}` });
    for (;;) {
      mid = Math.floor((lo + hi) / 2); mi = null; nb = null;
      snap(1, `ستون وسط بازه ستون ${fa(mid)} است.`);
      mi = G.reduce((b, r, i) => r[mid] > G[b][mid] ? i : b, 0);
      snap(2, `بیشینۀ ستون ${fa(mid)} عدد ${fa(G[mi][mid])} است.`);
      if (mid > lo && G[mi][mid - 1] > G[mi][mid]) {
        nb = [mi, mid - 1]; snap(4, `همسایۀ چپ ${fa(G[mi][mid - 1])} بزرگ‌تر است؛ نیمۀ چپ را نگه می‌داریم.`); hi = mid - 1; continue;
      }
      if (mid < hi && G[mi][mid + 1] > G[mi][mid]) {
        nb = [mi, mid + 1]; snap(6, `همسایۀ راست ${fa(G[mi][mid + 1])} بزرگ‌تر است؛ نیمۀ راست را نگه می‌داریم.`); lo = mid + 1; continue;
      }
      ans = [mi, mid]; nb = null;
      snap(7, `هیچ همسایه‌ای بزرگ‌تر نیست؛ ${fa(G[mi][mid])} قله است.`);
      break;
    }
    return { view: [290, 260], code, steps };
  };

  // ---------- session 03: recursion tree of T(n) = 2T(n/2) + cn ----------
  EX.s03recTree = () => {
    const L = 3, W = 320, X0 = 70, sh = [], BH = 26;
    const yOf = d => 20 + d * 56;
    const label = k => k === 1 ? 'cn' : `cn/${fa(k)}`;
    for (let d = 0; d < L; d++) {
      const k = 2 ** d, bw = Math.min(70, W / k - 8);
      for (let t = 0; t < k; t++) {
        const cx = X0 + (t + 0.5) * W / k;
        sh.push({ t: 'rect', x: cx - bw / 2, y: yOf(d), w: bw, h: BH, label: label(k), cls: 'seen' });
        if (d + 1 < L) for (const c of [2 * t, 2 * t + 1]) {
          const ccx = X0 + (c + 0.5) * W / (2 * k);
          sh.push({ t: 'line', x1: cx, y1: yOf(d) + BH, x2: ccx, y2: yOf(d + 1) });
        }
      }
      // level sum computed: k nodes, each cn/k
      sh.push({ t: 'text', x: 440, y: yOf(d) + 18, s: k * 1 === k ? 'cn' : 'cn' });
    }
    sh.push({ t: 'text', x: X0 + W / 2, y: yOf(L) + 10, s: '⋮' });
    const leaves = 8;
    for (let t = 0; t < leaves; t++) {
      const cx = X0 + (t + 0.5) * W / leaves;
      sh.push({ t: 'rect', x: cx - 17, y: yOf(L) + 26, w: 34, h: BH, label: 'T(1)', cls: 'done' });
    }
    sh.push({ t: 'text', x: 440, y: yOf(L) + 44, s: 'n · T(1)' });
    sh.push({ t: 'text', x: 440, y: 12, s: 'جمع سطر' });
    sh.push({ t: 'line', x1: 40, y1: yOf(0), x2: 40, y2: yOf(L) + 26 + BH, dir: true });
    sh.push({ t: 'line', x1: 40, y1: yOf(L) + 26 + BH, x2: 40, y2: yOf(0), dir: true });
    sh.push({ t: 'text', x: 22, y: yOf(1) + 30, s: 'log₂n' });
    sh.push({ t: 'text', x: 22, y: yOf(1) + 48, s: 'سطح' });
    return { view: [490, yOf(L) + 70], code: null, steps: [{ shapes: sh,
      msg: `در سطح ${iv('i')} تعداد ${ltr('2<sup><i>i</i></sup>')} گره داریم و هر کدام ${ltr('<i>cn</i>/2<sup><i>i</i></sup>')} کار می‌کند، پس جمع هر سطر ${iv('cn')} است.`,
      state: `${ltr('log<sub>2</sub> <i>n</i>')} سطح، هر کدام ${iv('cn')}، به اضافۀ ${iv('n')} برگ: ${ltr('<i>T</i>(<i>n</i>) = <i>cn</i> log<sub>2</sub> <i>n</i> + Θ(<i>n</i>) = Θ(<i>n</i> log <i>n</i>)')}` }] };
  };

  // ---------- session 04: merge sort split and merge ----------
  EX.s04mergeSort = () => {
    const A0 = [38, 27, 43, 3, 9, 82, 10, 15], n = A0.length;
    const rows = [];  // {kind, d, segs: [[start, values]]}
    const split = [[], [], [], []], merged = [[], [], [], []];
    const merge = (L, R) => {
      const A = []; let i = 0, j = 0;
      while (i < L.length || j < R.length) {
        if (j === R.length || (i < L.length && L[i] <= R[j])) A.push(L[i++]); else A.push(R[j++]);
      }
      return A;
    };
    const ms = (A, s, d) => {
      split[d].push([s, A]);
      if (A.length <= 1) return A;
      const mid = Math.floor(A.length / 2);
      const out = merge(ms(A.slice(0, mid), s, d + 1), ms(A.slice(mid), s + mid, d + 1));
      merged[d].push([s, out]);
      return out;
    };
    ms(A0, 0, 0);
    for (let d = 0; d <= 3; d++) rows.push({ segs: split[d], cls: d === 3 ? 'seen' : '' });
    for (let d = 2; d >= 0; d--) rows.push({ segs: merged[d], cls: d === 0 ? 'done' : 'seen' });
    const C = 34, GAP = 8, sh = [];
    rows.forEach((r, k) => {
      const y = 14 + k * 40;
      for (const [s, vals] of r.segs) {
        const len = vals.length;
        const x = 20 + s * C + (s / len) * GAP;
        vals.forEach((v, t) => sh.push({ t: 'rect', x: x + t * C, y, w: C - 2, h: 28, rx: 0, label: v, cls: r.cls }));
      }
      sh.push({ t: 'text', x: 400, y: y + 19, s: k < 4 ? (k === 0 ? 'تقسیم' : '') : (k === 4 ? 'ادغام' : '') });
    });
    sh.push({ t: 'line', x1: 400, y1: 42, x2: 400, y2: 132, dir: true });
    sh.push({ t: 'line', x1: 400, y1: 206, x2: 400, y2: 268, dir: true, cls: 'tree' });
    return { view: [430, 300], code: null, steps: [{ shapes: sh,
      msg: 'چهار سطر بالا تقسیم آرایه تا تک‌عضوی‌ها است و سه سطر پایین ادغام نیمه‌های مرتب تا رسیدن به آرایۀ مرتب.',
      state: `${ltr('2<sup>3</sup> = ۸')} عضو، ${ltr('log<sub>2</sub> ۸ = ۳')} سطح ادغام، و در هر سطح ادغام هر ۸ عضو یک بار جابه‌جا می‌شوند.` }] };
  };

  // ---------- session 05: dynamic array doubling ----------
  EX.s05dynArray = () => {
    const code = ['def insert_right(D, x):', '  if D.n == len(D.A):', '    resize(D, 2 * len(D.A))', '  D.A[D.n] = x', '  D.n += 1', '',
      'def resize(D, size):', '  A = [None] * max(size, 1)', '  A[:D.n] = D.A[:D.n]', '  D.A = A'];
    const D = { A: [null], n: 0 }, costs = [], steps = [];
    let copied = 0;
    const resize = size => { const A = new Array(Math.max(size, 1)).fill(null); for (let i = 0; i < D.n; i++) A[i] = D.A[i]; copied = D.n; D.A = A; };
    const C = 24, X = 10, BW = 30, BG = 14, BASE = 236, U = 12;
    const snap = (line, msg, hotI) => {
      const sh = [];
      sh.push({ t: 'text', x: 200, y: 16, s: `طول آرایه ${fa(D.A.length)}، تعداد اعضا ${fa(D.n)}` });
      D.A.forEach((v, i) => sh.push({ t: 'rect', x: X + i * C, y: 26, w: C - 2, h: 28, rx: 0, 
        cls: i === hotI ? 'hot' : v === null ? 'ghost' : 'done' }));
      for (let i = 0; i < 9; i++) {
        const x = 30 + i * (BW + BG), c = costs[i];
        if (c !== undefined) {
          sh.push({ t: 'rect', x, y: BASE - c * U, w: BW, h: c * U, rx: 0, cls: i === costs.length - 1 ? 'hot' : c > 1 ? 'seen' : 'done' });
          sh.push({ t: 'text', x: x + BW / 2, y: BASE - c * U - 6, s: c });
        }
        sh.push({ t: 'text', x: x + BW / 2, y: BASE + 16, s: `x${i + 1}`.replace(/\d+/, m => fa(m)) });
      }
      sh.push({ t: 'line', x1: 20, y1: BASE, x2: 420, y2: BASE });
      sh.push({ t: 'text', x: 225, y: 92, s: 'هزینۀ هر درج' });
      steps.push({ line, msg, shapes: sh, state: `جمع هزینه‌ها ${fa(costs.reduce((a, b) => a + b, 0))} برای ${fa(costs.length)} درج` });
    };
    snap(null, 'آرایه با طول ۱ و بدون عضو شروع می‌شود.', -1);
    for (let k = 1; k <= 9; k++) {
      copied = 0;
      let line = 3, grew = false;
      if (D.n === D.A.length) { resize(2 * D.A.length); grew = true; line = 2; }
      D.A[D.n] = 'x' + k; D.n += 1;
      costs.push(1 + copied);
      snap(line, grew ? `درج ${iv('x')}${fa(k)}: آرایه پر بود، طولش ${fa(D.A.length)} شد و ${fa(copied)} عضو کپی شد؛ هزینه ${fa(1 + copied)}.`
        : `درج ${iv('x')}${fa(k)}: جای خالی هست؛ هزینه ۱.`, D.n - 1);
    }
    const tot = costs.reduce((a, b) => a + b, 0);
    steps.push({ ...steps[steps.length - 1], line: null, msg: `پایان: ${fa(9)} درج روی هم ${fa(tot)} واحد کار، کمتر از ${ltr('3<i>n</i> = ۲۷')}؛ یعنی هر درج به صورت سرشکن ${ltr('<i>O</i>(1)')}.` });
    return { view: [430, 262], code, steps };
  };
})();
