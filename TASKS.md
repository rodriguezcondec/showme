# showme : tasks


### New repository
* [x] task list markdown file with checkboxes
* [x] update roadmap readme file with all current ideas regarding what to render
* [x] import game project: build, run, simple version
* [x] refactor app, with basic WebGL 2.0 scene functionality
* [ ] export as JS module

### Integrate with zcash-gui
* [ ] come up with a recommendation for how to do this: api, event handling, importing.
* [ ] chat with Muzamil
* [ ] integrate simple scene, with single texture and pan/zoom keyboard controls.

### Zcash crawler
* [x] run this, get report
* [x] check out CI tasks
* [x] extend the metrics
* [x] export per-node degree value
* [x] sort by degree, sort by Ip address, filter good nodes
* [x] compute Closeness centrality: the average of all shortest paths
* [x] compute Betweenness centrality: how many times a given node participates as a bridge node within a given shortest path.
* [x] export closeness & betweenness
* [x] Remove the current math-related calls to spectre (e.g., degree matrix).  These will eventually be done in pre-processing Rust app prior to rendering.
* [x] Export the adjacency graph with the remaining metrics.  NB: this will result in a much larger crawler results file, e.g., 6.6 MB for ca 3200 nodes.
* [ ] Make sure zcash-gui can run without the network metrics which were removed.
* [ ] PR, code review, merge into runnziggurat/zcash

### Spectre
* [x] Move code into spectre, new branch, add required test data
* [x] Make pull request
* [x] code review, merge

### Network Rendering
* [ ] `magic happens here`
