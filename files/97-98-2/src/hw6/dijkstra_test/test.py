import unittest
import os
import glob
import re
from dijkstra import *

class DijkstraTest(unittest.TestCase):
    
    def _cmp_files(self, file, lines):
        """Compares the result with the gold result.
        
        Args:
            file: gold result file.
            lines: result in lines for testing.
            
        Returns:
            True if the result is same as the gold result; False otherwise
        """
        for line in lines:
            if line != file.readline().strip():
                return False
        return file.readline() == ''

    def testCorrectness(self):
    	dir = os.path.dirname(__file__)
    	# Obtains a list of cross-platform test file paths.
    	in_files = glob.glob(os.path.join(dir, 'tests', '*.in'))
    	in_files.sort()
    	for in_filename in in_files:
    		test_name = os.path.basename(in_filename)
    		network = Network()
    		with open(in_filename) as in_file:
    			pf = PathFinder.from_file(in_file, network)
    			result = pf.shortest_path(distance)
    			network.verify_path(result.path, pf.source, pf.destination)
    			out_lines = result.sol_to_lines()
    			gold_filename = re.sub('\.in$', '.gold', in_filename)
    			with open(gold_filename) as gold_file:
    				same = self._cmp_files(gold_file, out_lines)
    				self.assertTrue(same)

# if __name__ == '__main__':
#     unittest.main()