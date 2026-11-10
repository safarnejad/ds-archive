class DropTest:
    def test(self, iphone, n):
        k = 1
        while (k*(k+1))/2 < n:
            k += 1
        i = k
        l = 1
        while i <= n:
            res = iphone.drop(i)
            if res == 0:
                l = i+1
                k -= 1
                i += max(1, min(k, n-i))
                if i > n:
                    return n+1
            else:
                break
        while l < i:
            res = iphone.drop(l)
            if res == 1:
                return l
            else:
                l += 1
        return i

