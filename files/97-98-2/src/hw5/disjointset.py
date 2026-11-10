def findset(par, x):
    if x != par[x]:
        par[x] = findset(par, par[x])
    return par[x]


def union(par, rank, x, y,children):
    x, y = findset(par, x), findset(par, y)
    if rank[x] < rank[y]:
        par[x] = y
        children[y]+=children[x]
    else:
        par[y] = x
        children[x]+=children[y]
    if rank[x] == rank[y]:
        rank[x] += 1


n, m = [int(part) for part in input().split()]
parent = [i for i in range(n)]
children = [1 for i in range(n)]
rank = [0 for i in range(n)]
villages = []
d = set()
list = []
result = []
for i in range(m):
    x, y = [int(part) - 1 for part in input().split()]
    villages.append([x, y])
q = int(input())
for i in range(q):
    n = int(input())
    d.add(n - 1)
    list.append(n - 1)
for i in range(m):
    if i not in d:
        union(parent, rank, villages[i][0], villages[i][1],children)
result.append(max(children))

for i in range(q-1,0,-1):
    union(parent,rank,villages[list[i]][0],villages[list[i]][1],children)
    result.append(max(children))

for i in range (q-1,-1,-1):
    print(result[i])
