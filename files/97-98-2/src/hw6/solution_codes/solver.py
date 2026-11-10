  
import rubik

def shortest_path(start, end):
   
    s_visited = [start]
    e_visited = [end]
    s_parent={start : None}
    e_parent={end : None}
    s_frontier = [start]
    e_frontier = [end]

    global found
    found =[] 

    if start == end:
        return []


    while s_frontier or e_frontier :
       
        
        s_frontier,s_visited,s_parent = BFS(s_frontier,s_visited,s_parent,e_visited)
        e_frontier,e_visited,e_parent = BFS(e_frontier,e_visited,e_parent,s_visited)

        if len(found) > 0:
            x = path(found[0],start,end,s_parent,e_parent)
            return getAnswer(x)

    #return None            


def BFS( frontier,visited, parent , visited2):
    counter = 0
    next = []
    if frontier:
        for u in frontier:
            if counter > 15 :
                return [],visited,parent
            for v in rubik.quarter_twists:
                temp = rubik.perm_apply(v, u)
                if temp not in visited :
                    visited.append(temp)
                    parent[temp] = u
                    next.append(temp)
                    if temp in visited2:
                        found.append(temp)
                        return next,visited,parent 
            counter += 1        
    return next,visited,parent 

      
def path(intersect,start,end,s_parent,e_parent):
    temp = []
    if intersect == start or intersect==end:
        temp.append(start)
        temp.append(end)
        return temp

    i = s_parent[intersect]

    while i != start :
        temp.append(i)
        i = s_parent[i]

    temp.append(start)    
    temp.reverse()

    i = intersect

    temp.append(i)
    i = e_parent[i]
    while i != end:
        temp.append(i)
        i = e_parent[i]
    temp.append(end)
    
    return temp 

def getAnswer(x):
    ans = []
    for i in range(len(x)-1):
        for v in rubik.quarter_twists:
            temp = rubik.perm_apply(v,x[i])
            if temp == x[i+1]:
                ans.append(v)
                break
    return ans

