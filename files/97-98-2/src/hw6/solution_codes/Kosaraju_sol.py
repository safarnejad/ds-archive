import queue


def dfs1():
    for s in range(n):
        if not visited[s]:
            visited[s] = True
            visit1(s)
            ordered_vertices.append(s)


def dfs2():
    for i in range(n-1,-1,-1):
        nxt = ordered_vertices[i]
        if not visited2[nxt]:
            visited2[nxt] = True
            css_list.append(visit2(nxt))


def visit1(s):
        for v in adj[s]:
            if not visited[v]:
                visited[v] = True
                visit1(v)
                ordered_vertices.append(v)


def visit2(s):
    css = 1
    for v in adj_reverse[s]:
        if not visited2[v]:
            visited2[v] = True
            css += visit2(v)
    return css


n, m = list(map(int, input().split()))
adj = []
adj_reverse = []
for i in range(n):
    adj.append([])
    adj_reverse.append([])
for i in range(m):
    src, dest = list(map(int, input().split()))
    adj[src].append(dest)
    adj_reverse[dest].append(src)
ordered_vertices = []
visited = [False] * n
dfs1()
css_list = []
visited2 = [False] * n
dfs2()
print(len(css_list))
css_list.sort()
print(*css_list)
