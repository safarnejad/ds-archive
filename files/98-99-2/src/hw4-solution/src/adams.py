class HashString:
    def __init__(self, s):
        self.mod = int(1e18 + 7)
        self.base = int(373)
        self.s = s
        self.pre = [0] * (len(s) + 1)
        self.tav = [0] * (len(s) + 1)
        self.tav[0] = 1
        self.lens = len(s)
        for i in range(1, len(s) + 1):
            self.pre[i] = (self.pre[i - 1] * self.base + ord(s[i - 1])) % self.mod
            self.tav[i] = (self.tav[i - 1] * self.base) % self.mod

    def get_hash(self, l, r):
        return ((self.pre[r + 1] - self.tav[r - l + 1] * self.pre[l]) % self.mod + self.mod) % self.mod


class HashTable:
    def __init__(self):
        self.mod=10003
        self.arr=[None]*self.mod
    def add(self,v):
        k=v%self.mod
        if self.arr[k] is None:
            self.arr[k]=[]
        self.arr[k].append(v)
    def find(self,v):
        k=v%self.mod
        if self.arr[k] is None:
            return False
        for u in self.arr[k]:
            if u==v:
                return True
        return False


def findGood(a, b, tol):
    x = HashTable()
    for i in range(0, a.lens - tol + 1):
        x.add(a.get_hash(i, i + tol - 1))
    for i in range(0, b.lens - tol + 1):
        if x.find(b.get_hash(i, i + tol - 1)):
            return (i, i+tol)
    return None



s = input()
t = input()
a = HashString(s)
b = HashString(t)

beg = 0
en = max(len(s), len(t)) + 1

result = None

while en - beg > 1:
    mid = (en + beg) // 2
    match = findGood(a, b, mid)
    if match is not None:
        beg = mid
        result = match
    else:
        en = mid

if result:
    print(s[result[0]:result[1]])