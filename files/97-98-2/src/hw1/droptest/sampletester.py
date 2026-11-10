from droptest import DropTest

class FixedFlooriPhone:
    def __init__(self, numfloors):
        self.numfloors = numfloors
        self.badfloor = numfloors-1
        self.numdrops = 0
        self.numphone = 2
    def drop(self, floor):
        self.numdrops += 1
        if floor > self.numfloors or floor <= 0 or self.numphone == 0:
            return -1
        elif floor < self.badfloor:
            return 0
        else:
            self.numphone -= 1
            return 1
    def getnumdrops(self):
        return self.numdrops
    def getbadfloor(self):
        return self.badfloor

myphone = FixedFlooriPhone(100)
mydroptest = DropTest()
finalres = mydroptest.test(myphone, 100)
print "Number of drops: {}".format(myphone.getnumdrops())
if finalres == myphone.badfloor:
    print "Correctly returned floor {}".format(finalres)
else:
    print "Incorrectly returned floor {}, the correct floor is {}.".format(finalres, myphone.getbadfloor())
