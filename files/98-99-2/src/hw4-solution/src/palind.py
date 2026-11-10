import math

MOD = 1000 * 1000 * 1000 + 7
BASE = 101

MAX_SIZE = 100000

BASELIST = [0] * (MAX_SIZE + 1)
BASELIST[0] = 1
for i in range(1, MAX_SIZE + 1):
    BASELIST[i] = (BASELIST[i - 1] * BASE) % MOD

def make_hash(s):
    hashlist = [0] * (len(s) + 1)
    hashlist[0] = 0
    for i in range(1, len(s) + 1):
        hashlist[i] = (hashlist[i - 1] * BASE + ord(s[i - 1]) - ord('a')) % MOD
    return hashlist

def get_hash(hashlist, src, des):
    return (hashlist[des+1] - hashlist[src] * BASELIST[des - src + 1] + MOD) % MOD



def find_biggest_palindrom(s):
    hashlist = make_hash(s)
    rev_hashlist = make_hash(s[::-1])
    biggest_palindrom_size = 0
    for odd_center in range(len(s)):
        end_radius = min(len(s) - odd_center - 1, odd_center)
        start_radius = 0
        while start_radius != end_radius:
            r = int(math.ceil((start_radius + end_radius) / 2))
            if get_hash(hashlist, odd_center-r, odd_center+r) == get_hash(rev_hashlist, len(s)-1-r-odd_center, len(s)-1+r-odd_center):
                start_radius = r
            else:
                end_radius = r - 1
        biggest_palindrom_size = max(biggest_palindrom_size, 2*start_radius+1)

    for even_center in range(len(s) - 1):
        end_radius = min(len(s) - even_center - 1, even_center+1)
        start_radius = 0
        while start_radius != end_radius:
            r = int(math.ceil((start_radius + end_radius) / 2))
            if get_hash(hashlist, even_center-r+1,even_center+r) == get_hash(rev_hashlist, len(s)-1-r-even_center, len(s)-1+r-even_center-1):
                start_radius = r
            else:
                end_radius = r - 1
        if start_radius == 0:
            continue
        biggest_palindrom_size = max(biggest_palindrom_size, 2*start_radius)
    return biggest_palindrom_size

if __name__ == '__main__':
    print(find_biggest_palindrom(input()))
