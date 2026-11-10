max_n = 100000 + 10
lg = 32
max_nodes = 20000 * lg
left = [0 for _ in range(0, max_nodes)]
right = [0 for _ in range(0, max_nodes)]
last_id = 1


def add(x):
    global last_id
    index = 0
    for i in range(lg - 1, -1, -1):
        bit = (x >> i) & 1
        if bit == 0:
            if left[index] == 0:
                left[index] = last_id
                last_id += 1
            index = left[index]
        else:
            if right[index] == 0:
                right[index] = last_id
                last_id += 1
            index = right[index]


def ask(x):
    index = 0
    answer = 0
    for i in range(lg - 1, -1, -1):
        bit = (x >> i) & 1
        if bit == 1:
            if left[index] == 0:
                index = right[index]
            else:
                answer += 1 << i
                index = left[index]
        else:
            if right[index] == 0:
                index = left[index]
            else:
                answer += 1 << i
                index = right[index]
    return answer


q = int(input())
xor_value = 0
add(0)

for step in range(0, q):
    s = input()
    ty = int(s.split()[0])
    if ty == 3:
        print(ask(xor_value))
        continue
    if ty == 2:
        xor_value ^= int(s.split()[1])
    if ty == 1:
        add(int(s.split()[1]) ^ xor_value)
