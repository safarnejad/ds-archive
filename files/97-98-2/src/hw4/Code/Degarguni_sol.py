a = input()
b = "".join(reversed(input()))
length = len(a)
if len(b) != length:
    print("-1 -1")
    quit()
modulus = 1000003
remainders = [0]*modulus
remainders[0] = 1
for i in range(1, modulus-1):
    remainders[i] = (remainders[i-1] * 95) % modulus
a_hashes = [0]*length
b_hashes = [0]*length
a_hashes[0] = ord(a[0])
b_hashes[0] = ord(b[0])
for i in range(1, length):
    a_hashes[i] = (a_hashes[i-1] * 95 + ord(a[i])) % modulus
    b_hashes[i] = (b_hashes[i - 1] * 95 + ord(b[i])) % modulus
found = False
x = -1
y = -1
start = 0
end = length
last_i = -1
while start != end:
    i = (start + end) // 2
    if a_hashes[i] == b_hashes[i] and a[0:i+1] == b[0:i+1]:
        last_i = i
        start = i+1
    else:
        end = i
if last_i != -1:
    for i in range(last_i,-1,-1):
        for j in range(i + 1, length):
            if (a_hashes[length - 1] - a_hashes[j - 1] * remainders[(length - j)%modulus]) % modulus == (
                    b_hashes[length - j + i] - b_hashes[i] * remainders[(length - j)%modulus]) % modulus \
                    and a[j:length] == b[i + 1:length - j + i + 1]:
                if a[i + 1:j] == "".join(reversed(b[length - j + i + 1:length])):
                    found = True
                    x = i
                    y = j
                    break
        if found:
            break
print(str(x) + " " + str(y))
