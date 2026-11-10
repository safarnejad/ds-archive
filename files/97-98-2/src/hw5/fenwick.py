import sys
def sumfunc(idx):
    result = 0
    while idx:
        result += array[idx]
        idx -= idx & -idx
    return result


def update(idx, add):
    while idx < len(array):
        array[idx] += add
        idx += idx & -idx


array = [0 for i in range(10 ** 6 + 1)]
while True:
    string = sys.stdin.readline()
    if not string:
        break
    string = string.split()
    if string[0] == "ask":
        print(sumfunc(int(string[1])))
    else:
        update(int(string[1]) + 1, int(string[3]))
        update(int(string[2]), - int(string[3]))
