import { EShader } from './core';
import { a } from './globals';
import { getNormal2, getNormal3, distance } from './util';
import { vec2, vec3 } from 'gl-matrix';
export class CPiece {
    constructor(ipiece /*, ipiecesave: IPieceSave*/) {
        this.ipiece = ipiece;
        //this.ipiecesave = ipiecesave
        this.center = vec3.create();
        this.setCenterAndRadius();
    }
    release() {
    }
    setCenterAndRadius() {
        this.center = [
            (this.ipiece.bo[2] + this.ipiece.bo[0]) / 2,
            (this.ipiece.bo[3] + this.ipiece.bo[1]) / 2,
            0
        ];
        let dx = (this.ipiece.bo[2] - this.ipiece.bo[0]) / 2;
        let dy = (this.ipiece.bo[3] - this.ipiece.bo[1]) / 2;
        this.radius = Math.sqrt(dx * dx + dy * dy);
    }
    deleteGlBuffer(buffer) {
        a.countdown = 60;
        a.oldGlBuffers.push(buffer);
    }
    createSideMesh(gl, puzzle, istate) {
        let npolys = 0;
        let num_indices = 0;
        for (let edgeinfo of this.ipiece.edgeinfo) {
            let edge = puzzle.edges[edgeinfo.id];
            if (istate.activeedges[edgeinfo.id]) {
                //console.log('use edge id ' + edgeinfo.id)
                npolys += (edge.length - 1) * 2;
                num_indices += edge.length;
            }
            else {
                //console.log('skip edge id ' + edgeinfo.id)
            }
        }
        let positions = new Float32Array(num_indices * 2 * 8);
        let dist = 0;
        let n = 0;
        let wholeCycles = Math.floor(this.ipiece.contourDistance / 50 / a.sideTextureScale);
        let uvScale = this.ipiece.contourDistance / 50 / a.sideTextureScale / wholeCycles * a.sideTextureScale;
        //console.log('this.ipiece.contourDistance: ' + this.ipiece.contourDistance)
        //console.log('a.sideTextureScale: ' + a.sideTextureScale)
        //console.log('wholeCycles: ' + wholeCycles)
        //console.log('uvScale: ' + uvScale)
        let minV = 0.25;
        let heightV = 0.25;
        let stride = puzzle.dem ? 6 : 2;
        for (let edgeinfo of this.ipiece.edgeinfo) {
            if (!istate.activeedges[edgeinfo.id]) {
                continue;
            }
            let edge = puzzle.edges[edgeinfo.id];
            let lastx = 0;
            let lasty = 0;
            let m = 0;
            let x, y, z;
            if (edgeinfo.dir == 1) {
                for (let i = 0; i < edge.length; i++) {
                    let index = edge[i];
                    x = puzzle.coords[index * stride];
                    y = puzzle.coords[index * stride + 1];
                    z = puzzle.dem ? puzzle.coords[index * stride + 2] : 0;
                    if (m > 0) {
                        let d = distance(x, y, lastx, lasty);
                        dist += d;
                    }
                    m++;
                    lastx = x;
                    lasty = y;
                    positions[n++] = x;
                    positions[n++] = y;
                    positions[n++] = a.thickness / 2 + z;
                    positions[n++] = 1;
                    positions[n++] = 0;
                    positions[n++] = 0;
                    // uv
                    //positions[n++] = (a.thickness + z) / (a.thickness + 255) * heightV + minV
                    positions[n++] = heightV + minV;
                    positions[n++] = dist / uvScale;
                    positions[n++] = x;
                    positions[n++] = y;
                    positions[n++] = -a.thickness / 2;
                    positions[n++] = 1;
                    positions[n++] = 0;
                    positions[n++] = 0;
                    // uv
                    positions[n++] = minV;
                    positions[n++] = dist / uvScale;
                }
            }
            else {
                for (let i = edge.length - 1; i >= 0; i--) {
                    let index = edge[i];
                    x = puzzle.coords[index * stride];
                    y = puzzle.coords[index * stride + 1];
                    z = puzzle.dem ? puzzle.coords[index * stride + 2] : 0;
                    if (m > 0) {
                        let d = distance(x, y, lastx, lasty);
                        dist += d;
                    }
                    m++;
                    lastx = x;
                    lasty = y;
                    positions[n++] = x;
                    positions[n++] = y;
                    positions[n++] = a.thickness / 2 + z * 2.0;
                    positions[n++] = 1;
                    positions[n++] = 0;
                    positions[n++] = 0;
                    // uv
                    //positions[n++] = (a.thickness + z) / (a.thickness + 255) * heightV + minV
                    positions[n++] = heightV + minV;
                    positions[n++] = dist / uvScale;
                    positions[n++] = x;
                    positions[n++] = y;
                    positions[n++] = -a.thickness / 2;
                    positions[n++] = 1;
                    positions[n++] = 0;
                    positions[n++] = 0;
                    // uv
                    positions[n++] = minV;
                    positions[n++] = dist / uvScale;
                }
            }
        }
        //console.log('end distance: ' + dist)
        let pstride = 16;
        for (let i = 0; i < num_indices; i++) {
            let x = positions[i * pstride + 0];
            let y = positions[i * pstride + 1];
            let v = vec2.fromValues(x, y);
            let n;
            if (i == 0) {
                //TVertex2 next = vert[k+1];
                let nx = positions[i * pstride + 0 + pstride];
                let ny = positions[i * pstride + 1 + pstride];
                let next = vec2.fromValues(nx, ny);
                n = getNormal2(v, next);
            }
            else if (i == num_indices - 1) {
                let px = positions[i * pstride + 0 - pstride];
                let py = positions[i * pstride + 1 - pstride];
                let prev = vec2.fromValues(px, py);
                n = getNormal2(prev, v);
            }
            else {
                let px = positions[i * pstride + 0 - pstride];
                let py = positions[i * pstride + 1 - pstride];
                let prev = vec2.fromValues(px, py);
                let nx = positions[i * pstride + 0 + pstride];
                let ny = positions[i * pstride + 1 + pstride];
                let next = vec2.fromValues(nx, ny);
                n = getNormal3(prev, v, next);
            }
            positions[i * pstride + 3] = n[0];
            positions[i * pstride + 4] = n[1];
            positions[i * pstride + 5] = n[2];
            positions[i * pstride + 11] = n[0];
            positions[i * pstride + 12] = n[1];
            positions[i * pstride + 13] = n[2];
        }
        this.deleteGlBuffer(this.sidePosBuffer);
        this.sidePosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sidePosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        var a_Position = gl.getAttribLocation(a.g.shaderMaterials[EShader.Side].program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }
        var a_Normal = gl.getAttribLocation(a.g.shaderMaterials[EShader.Side].program, 'a_Normal');
        if (a_Normal < 0) {
            console.log('Failed to get the storage location of a_Normal');
            return -1;
        }
        //if (puzzle.type == EPuzzleType.A) {
        //gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 3*4, 0);
        //} else {
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 8 * 4, 0);
        //gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 6*4, 3*4);
        gl.enableVertexAttribArray(a_Position);
        //gl.enableVertexAttribArray(a_Normal);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        let indices = new Uint16Array(npolys * 3);
        let p = 0;
        let index = 0;
        n = 0;
        for (let edgeinfo of this.ipiece.edgeinfo) {
            if (!istate.activeedges[edgeinfo.id]) {
                continue;
            }
            let edge = puzzle.edges[edgeinfo.id];
            for (let i = 0; i < edge.length - 1; i++) {
                indices[index++] = n + 0;
                indices[index++] = n + 1;
                indices[index++] = n + 2;
                indices[index++] = n + 2;
                indices[index++] = n + 1;
                indices[index++] = n + 3;
                n += 2;
            }
            n += 2;
        }
        this.deleteGlBuffer(this.sideIndexBuffer);
        this.sideIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sideIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        this.sideIndexLength = indices.length;
        return null;
    }
    getPiecePolys(pieceid, indices, istate) {
        //let n = 0
        for (let edgepoly of this.ipiece.edgepolys) {
            // jkl let active: boolean = istate.activeedges[edgepoly.eid] 
            //if (active && edgepoly.pl) {
            //if (active) {
            for (let index of edgepoly.pl) {
                indices.push(index);
            }
            //} else {
            // jkl for (let index of edgepoly.indices) {
            // 	indices.push(index)
            // }
            //}
            //n++
        }
    }
    createTopMesh(gl, puzzle, istate) {
        let rawindices = new Array;
        this.getPiecePolys(this.ipiece.pid, rawindices, istate);
        let indices = new Uint32Array(rawindices);
        this.topIndexLength = indices.length;
        //console.log('top indices.length: ' + indices.length)
        a.npolys += indices.length / 3;
        //console.log('top a.npolys: ' + a.npolys)
        this.deleteGlBuffer(this.topIndexBuffer);
        this.topIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        this.topIndexLength = indices.length;
    }
    createMeshes(ipuzzle, istate) {
        // console.log('createMeshes, piece ' + this.ipiece.pid)
        this.createSideMesh(a.gl, ipuzzle, istate);
        this.createTopMesh(a.gl, ipuzzle, istate);
    }
    deleteMeshes() {
    }
    deleteSideMeshes() {
    }
}
