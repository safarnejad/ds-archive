def dijkstra(self, weight, nodes, source, destination):
        """Performs Dijkstra's algorithm until it finds the shortest
        path from source to destination in the graph with nodes and edges.
        Assumes that all weights are non-negative.
    
        Args:
            weight: function for calculating the weight of edge (u, v). 
            nodes: list of all nodes in the network.
            source: the source node in the network.
            destination: the destination node in the network.
         
        Returns:
            A tuple of the path as a list of nodes from source to destination 
            and the number of visited nodes.
        """
        # Initialize.
        for node in nodes:
            node.parent = None
            node.queue_key = None
            
        num_visited = 0
        # Run Dijkstra's algorithm.
        pq = PriorityQueue()
        # Use NodeDistancePair as a key in the priority queue.
        source.queue_key = NodeDistancePair(source, 0)
        pq.insert(source.queue_key)
        
        while len(pq) > 0:
            node_key = pq.extract_min()
            node, dist = node_key.node, node_key.distance
            num_visited = num_visited + 1
            if node is destination: break
            for next_node in node.adj: # Relax nodes adjacent to node.
                next_dist = weight(node, next_node) + dist
                if next_node.queue_key is None:
                    next_node.queue_key = NodeDistancePair(next_node, next_dist)
                    pq.insert(next_node.queue_key)
                    next_node.parent = node
                elif next_dist < next_node.queue_key.distance:
                    next_node.queue_key.distance = next_dist
                    pq.decrease_key(next_node.queue_key)
                    next_node.parent = node
        p = []
        while destination is not None:
            p.append(destination)
            destination = destination.parent
        p.reverse()
        return (p, num_visited)