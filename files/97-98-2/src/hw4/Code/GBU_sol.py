s = input()
is_bad = [not bool(int(i)) for i in input()]

k = int(input())

good_sub_strings = set()

for i in range(len(s)):
    pre_hash = bads_count = 0
    
    for j in range(i,len(s)):
        this_char = ord(s[j]) - 97
        if is_bad[this_char]:
            bads_count += 1
        if bads_count > k:
            break
        pre_hash += pre_hash * 31 + this_char + 1
        good_sub_strings.add(pre_hash)


print(len(good_sub_strings))

