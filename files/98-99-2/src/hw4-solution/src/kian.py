def find_triplet(array, hash_table, target):
    for i in range(len(array)):
        local_target = target - array[i]
        index = ((local_target * 12203) + 8171) % 500000
        if index < 0:
            index = -index
        if hash_table[index] is False:
            continue
        else:
            for element in hash_table[index]:
                if element[0] != i and element[1] != i:
                    sum_of_these = array[element[0]] + array[element[1]]
                    if sum_of_these == local_target:
                        return 'YES'
    return 'NO'


def build_hash_table(array):
    array_size = len(array)
    hash_table = [False for _ in range(500000)]
    for i in range(array_size):
        for j in range(i + 1, array_size):
            sum = array[i] + array[j]
            index = ((sum * 12203) + 8171) % 500000
            if index < 0:
                index = -index
            if hash_table[index] is False:
                hash_table[index] = [(i, j)]
            else:
                hash_table[index].append((i, j))
    return hash_table


array = list(map(int, input().strip().split()))
hash_table = build_hash_table(array)
n = int(input())
for _ in range(n):
    target = int(input())
    print(find_triplet(array, hash_table, target))