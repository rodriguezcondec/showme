# showme : roadmap...a bucket of ideas


### General background concepts

https://en.wikipedia.org/wiki/Centrality


Centrality
- Degree centrality
- Closeness centrality
- Harmonic Centrality
- betweenness
- Eigenvector
	Katz

Give a number to a node.  What is an important vertex?  There are various measures of ‘importance`

Graph types
- Graph
- Directed graph
- Weighted graph
- Mixed graph.



Laplacian matrix = Degree matrix – Adjacency matrix

---
### Red teaming:  view the network in realtime.
---

### Animation

- Static pictures, every 60 seconds or 60 minutes, displayed as time lapse animation film.
- Like a plant or a tree growing, can view patterns over time via time lapse (arboretum)

---

### Traffic metrics?

---
### Physical Modeling

Contraints, solve a physical model with connections, minimum distance.  Solve for minimum energy, iteratively adding noise.


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
