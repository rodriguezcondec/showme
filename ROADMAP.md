# showme : roadmap...a bucket of ideas


### General background concepts

https://en.wikipedia.org/wiki/Centrality


Centrality
- Degree centrality: how many nodes a particular node
- Closeness centrality:  for a given node, find the average of the shortest paths to each node. For n nodes, there are `n * (n - 1) / 2` unique paths.
- Betweenness: The number of time a given node is used as a bridge between two nodes, for their shortest path.
- Harmonic Centrality: derived from closeness centrality
- Eigenvector
	Katz

Give a number to a node.  What is an important vertex?  There are various measures of ‘importance`

Graph types
- Undirected graph
- Directed graph
- Weighted graph
- Mixed graph.

Laplacian matrix = Degree matrix – Adjacency matrix

Are these sparse matrices, for when the number of nodes is relatively large (in the 1000's)?  I need to figure out how the nalgebra package does this with their `DMatrix`.

TODO:  Compute `closeness` and `betweenness` for each node.  And because the latter depends upon the shortest paths found by the former, it would make sense to compute both them at the same time.

As this is not a trivial computation (for 13K nodes, for instance), we might consider exporting the graph (all the edges), with whatver else metadata we need (e.g., for 'good node'), and then import that file that would do the heavy math, outside of the crawler.

There are several algorithms for finding the `shortest path in an unweighted graph`.



---
### Red teaming:  view the network in realtime.
---

### Animation

- Static pictures, e.g., every 30 minutes, displayed as time lapse animation film.
- Like a plant or a tree growing, can view patterns over time via time lapse (arboretum)
- Static IP addresses, can see how steady or not, over time.


---

### Traffic metrics?

---
### Physical Modeling

Contraints, solve a physical model with connections, minimum distance.  Solve for minimum energy, iteratively adding noise.
Not sure how to do this when the address is an IP address.  Perhaps in 4 dimensions, one for each part of an address?  An interesting idea to explore, but it may turn out to be nothing.


---
## Brain stormy questions
- What other metrics could be found?
- Graphically, what do I want to draw?
- which per-node properties?

---
### Four kinds of models:
- Static, for a point in time.
- Semi-static:  one data slice, but with animation for some of the params (e.g., noise/jiggle for how busy).
- Live: update x seconds, with animated transition between state updates.
- Physical model:  with constraints, solve in iterative fashion, finding state with minimum energy

---
### Display entire topology with connections, in addition to nodes.

Since this number is on the order of a couple million, we could not animate this is realtime.  But we could render offscreen, and export as 4K picture, or something.  Nobody has really seen something like this.
It's not a problem if it takes 20 minutes to render, for example.
