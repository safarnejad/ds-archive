import unittest

from solver import shortest_path


class TestAll(unittest.TestCase):

    def test1(self):
        rgw = flu = 0  # (0-th cubie; front face)
        gwr = luf = 1  # (0-th cubie; left face)
        wrg = ufl = 2  # (0-th cubie; up face)

        rwb = fur = 3  # (1-st cubie; front face)
        wbr = urf = 4  # (1-st cubie; up face)
        brw = rfu = 5  # (1-st cubie; right face)

        ryg = fdl = 6  # (2-nd cubie; front face)
        ygr = dlf = 7  # (2-nd cubie; down face)
        gry = lfd = 8  # (2-nd cubie; left face)

        rby = frd = 9  # (3-rd cubie; front face)
        byr = rdf = 10  # (3-rd cubie; right face)
        yrb = dfr = 11  # (3-rd cubie; down face)

        owg = bul = 12  # (4-th cubie; back face)
        wgo = ulb = 13  # (4-th cubie; up face)
        gow = lbu = 14  # (4-th cubie; left face)

        obw = bru = 15  # (5-th cubie; back face)
        bwo = rub = 16  # (5-th cubie; right face)
        wob = ubr = 17  # (5-th cubie; up face)

        ogy = bld = 18  # (6-th cubie; back face)
        gyo = ldb = 19  # (6-th cubie; left face)
        yog = dbl = 20  # (6-th cubie; down face)

        oyb = bdr = 21  # (7-th cubie; back face)
        ybo = drb = 22  # (7-th cubie; down face)
        boy = rbd = 23  # (7-th cubie; right face)
        I = (
            flu, luf, ufl, fur, urf, rfu, fdl, dlf, lfd, frd, rdf, dfr, bul, ulb, lbu, bru, rub, ubr, bld, ldb, dbl,
            bdr,
            drb, rbd)
        start = I
        end = I
        output = shortest_path(start, end)
        self.assertCountEqual([], output)

    def test2(self):
        start = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)
        end = (6, 7, 8, 0, 1, 2, 9, 10, 11, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)
        output = shortest_path(start, end)
        self.assertCountEqual([(6, 7, 8, 0, 1, 2, 9, 10, 11, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)], output)
        
    def test3(self):
        start = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)
        end = (18, 19, 20, 13, 14, 12, 7, 8, 6, 0, 1, 2, 9, 10, 11, 15, 16, 17, 4, 5, 3, 21, 22, 23)
        output = shortest_path(start, end)
        self.assertCountEqual([(6, 7, 8, 0, 1, 2, 9, 10, 11, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23), (13, 14, 12, 3, 4, 5, 2, 0, 1, 9, 10, 11, 20, 18, 19, 15, 16, 17, 7, 8, 6, 21, 22, 23), (6, 7, 8, 0, 1, 2, 9, 10, 11, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23), (13, 14, 12, 3, 4, 5, 2, 0, 1, 9, 10, 11, 20, 18, 19, 15, 16, 17, 7, 8, 6, 21, 22, 23)], output)

    def test4(self):
        start = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)
        end = (4, 5, 3, 6, 7, 8, 20, 18, 19, 0, 1, 2, 11, 9, 10, 15, 16, 17, 13, 14, 12, 21, 22, 23)
        output = shortest_path(start, end)
        self.assertCountEqual([(6, 7, 8, 0, 1, 2, 9, 10, 11, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23), (6, 7, 8, 0, 1, 2, 9, 10, 11, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23), (7, 8, 6, 3, 4, 5, 20, 18, 19, 9, 10, 11, 2, 0, 1, 15, 16, 17, 13, 14, 12, 21, 22, 23)], output)

    def test5(self):
        start = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)
        end = (13, 14, 12, 0, 1, 2, 8, 6, 7, 3, 4, 5, 20, 18, 19, 15, 16, 17, 10, 11, 9, 21, 22, 23)
        output = shortest_path(start, end)
        self.assertCountEqual([(6, 7, 8, 0, 1, 2, 9, 10, 11, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23), (13, 14, 12, 3, 4, 5, 2, 0, 1, 9, 10, 11, 20, 18, 19, 15, 16, 17, 7, 8, 6, 21, 22, 23)], output)

    # def test6(self):
    #     start = (7, 8, 6, 20, 18, 19, 3, 4, 5, 16, 17, 15, 0, 1, 2, 14, 12, 13, 10, 11, 9, 21, 22, 23)
    #     end = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)
    #     output = shortest_path(start, end)
    #     self.assertCountEqual(None, output)
