class DropTest:
    def test(self, iphone, n):
        i = 1;
        while i <= n and iphone.drop(i) == 0:
            i += 1
        return i
