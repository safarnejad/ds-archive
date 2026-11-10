import sys

def merge(u, v):
    pu = get_root(u)
    pv = get_root(v)
    if(pu == pv):
        return
    if(sz[pv] < sz[pu]):
        pv, pu = pu, pv

    sz[pv] += sz[pu]
    par[pu] = pv
    if(mx[pv] < mx[pu]):
        cnt_mx[pv] = 0
    if(mx[pu] >= mx[pv]):
        cnt_mx[pv] += cnt_mx[pu]
    if(mn[pv] > mn[pu]):
        cnt_mn[pv] = 0
    if(mn[pu] <= mn[pv]):
        cnt_mn[pv] += cnt_mn[pu]
        
    mn[pv] = min(mn[pv], mn[pu])
    mx[pv] = max(mx[pv], mx[pu])

def get_root(u):
    if (u == par[u]):
        return u
    par[u] = get_root(par[u])
    return par[u]

def get_val(u):
    u = get_root(u)
    return cnt_mx[u] * cnt_mn[u] * (mx[u] - mn[u])

sys.setrecursionlimit(10**6)

n = int(input().strip())
mx = list(map(int, input().strip().split()))
mn = []
cnt_mx = [1] * n
cnt_mn = [1] * n
par = []
sz = [1] * n;

for i in range(n):
    par.append(i)
    mn.append(mx[i])
q = int(input())
for i in range(q):
    inp = list(map(int, input().strip().split()))
    u = inp[1] - 1;
    if (inp[0] == 1):
        v = inp[2] - 1
        merge(u, v)
    else:
        print(get_val(u))