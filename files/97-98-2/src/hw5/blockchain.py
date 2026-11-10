import hashlib
import binascii

class Blockchain:
    def add_block(self, data):
        for nonce in range (2**29, 2**29+1000000):
            header_hex2 = (data + hex(nonce)[2:])
            #header_bin = header_hex2.decode('hex')
            header_bin = binascii.unhexlify(header_hex2)
            hash = hashlib.sha256(hashlib.sha256(header_bin).digest()).digest()
            #revhash = hash[::-1].encode('hex_codec')
            revhash = binascii.hexlify(hash[::-1]).decode('utf-8')
            if revhash[0:4] == '0000':
                return hex(nonce)[2:]
