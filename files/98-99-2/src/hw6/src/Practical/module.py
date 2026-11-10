def build(v, s, e):
    if(e - s <= 1):
        seg[v] = int(bin_str[s])
        return
    mid = (s + e) // 2
    build(2 * v, s, mid)
    build(2 * v + 1, mid, e)
    seg[v] = (seg[2 * v] * po[e - mid] + seg[2 * v + 1]) % 7

def get(v, s, e, l, r):
    if(s >= r or e <= l):
        return 0
    if(l <= s and e <= r):
        return seg[v]
    mid = (s + e) // 2
    return (get(2 * v, s, mid, l, r) * po[max(min(e, r) - mid, 0)]/
     + get(2 * v + 1, mid, e, l, r)) % 7

def upd(v, s, e, ind, val):
    if(e - s <= 1):
        seg[v] = val % 7
        return
    mid = (s + e) // 2
    if(ind < mid):
        upd(2 * v, s, mid, ind, val)
    else:
        upd(2 * v + 1, mid, e, ind, val)
    seg[v] = (seg[2 * v] * po[e - mid] + seg[2 * v + 1]) % 7;

t = int(input().strip())
MAXN = 100 * 1000 + 10;
seg = [0] * (4 * MAXN)
po = [1] * MAXN
for i in range(1, MAXN):
    po[i] = po[i - 1] * 2 % 7;
for i in range(t):
    bin_str = input().strip();
    n = len(bin_str);
    build(1, 0, n);
    q = int(input())
    for i in range(q):
        t, a, b = map(int, input().strip().split())
        if(t == 0):
            print(get(1, 0, n, a, b + 1));
        else:
            upd(1, 0, n, a, b)
