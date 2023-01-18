/// <reference path="../../node_modules/@webgpu/types/dist/index.d.ts" />

import { INode } from './core'
import { a } from './globals'
import { mat4, vec3, vec4 } from 'gl-matrix'
import { randomColor } from './util'


const WORLD_WIDTH: number = 2000;
const WORLD_HEIGHT: number = 2000;
const WORLD_DEPTH: number = 590;

const XDIVISOR = Math.pow(2, 32);
const YDIVISOR = Math.pow(2, 16);


export class CNode {
    public inode: INode
    public color: vec4
    public metadata: vec4
    public info: vec4
    public position: vec3
    public center: vec3
    public rotation: vec3
    public positionRadius: vec4
    public matWorld: mat4
    public matMV: mat4
    public matMVP: mat4
    public radius: number


    public release() {
        this.position = null
        this.center = null
        this.rotation = null
        this.matWorld = null
        this.matMV = null
        this.matMVP = null
    }
    public setRotationZ(z: number) {
        this.rotation[2] = z
        this.updateMatrix()
    }
    public incRotationY(y: number) {
        this.rotation[1] += y
        this.updateMatrix()
    }
    public setRotationX(x: number) {
        this.rotation[0] = x
        this.updateMatrix()
    }
    public getRotationZ() : number {
        return this.rotation[2]
    }
    public getRotationX() : number {
        return this.rotation[0]
    }
//     private clampPosition() {
//         if (this.position[0] < -a.tabla.width/2) {
//             this.position[0] = -a.tabla.width/2
//         }
//         if (this.position[0] > a.tabla.width/2) {
//             this.position[0] = a.tabla.width/2
//         }
//         if (this.position[1] < -a.tabla.height/2) {
//             this.position[1] = -a.tabla.height/2
//         }
//         if (this.position[1] > a.tabla.height/2) {
//             this.position[1] = a.tabla.height/2
//         }
// }

    // public renderTopGpu(gl: WebGL2RenderingContext) {
    // }


    public updatePositionRadius(isSub: boolean) {
        this.positionRadius = vec4.fromValues(this.position[0], this.position[1], this.radius, isSub ? 1 : 0)

    }

    public updateOverlayUniformsGl(proj: mat4, view: mat4) {
        this.updateMatrix()
        mat4.multiply(this.matMV, view, this.matWorld)
        mat4.multiply(this.matMVP, proj, this.matMV)
    }

    public renderTopPhong(gl: WebGL2RenderingContext) {
        // this.updateMatrix()
        // for (let instance of this.instances) {
        //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, instance.piece.topIndexBuffer);
        //     gl.uniformMatrix4fv(a.g.topMaterial.uniforms.descs[EUniform.Mv].location, false, this.matMV);
        //     gl.uniformMatrix4fv(a.g.topMaterial.uniforms.descs[EUniform.Projection].location, false, a.matProjection);
        //     gl.drawElements(gl.TRIANGLES, instance.piece.topIndexLength, gl.UNSIGNED_INT, 0);
        // }
    }

    public renderSide(gl: WebGL2RenderingContext) {

        // for (let instance of this.instances) {
        //     let piece : CPiece = instance.piece
        //     gl.bindBuffer(gl.ARRAY_BUFFER, piece.sidePosBuffer)
        //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, piece.topIndexBuffer);

        //     gl.uniformMatrix4fv(a.g.shaderMaterials[EShader.Side].uniforms.descs[EUniform.Mv].location, false, this.matMV);
        //     gl.uniformMatrix4fv(a.g.shaderMaterials[EShader.Side].uniforms.descs[EUniform.Projection].location, false, a.matProjection);

        //     var a_Position = gl.getAttribLocation(a.g.shaderMaterials[EShader.Side].program, 'a_Position');
        //     var a_Normal = gl.getAttribLocation(a.g.shaderMaterials[EShader.Side].program, 'a_Normal');
        //     var a_Uv = gl.getAttribLocation(a.g.shaderMaterials[EShader.Side].program, 'a_Uv');

        //     gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 8*4, 0);
        //     gl.enableVertexAttribArray(a_Position);

        //     gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 8*4, 3*4);
        //     gl.enableVertexAttribArray(a_Normal);

        //     gl.vertexAttribPointer(a_Uv, 2, gl.FLOAT, false, 8*4, 6*4);
        //     gl.enableVertexAttribArray(a_Uv);

        //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, piece.sideIndexBuffer);
        //     gl.drawElements(gl.TRIANGLES, piece.sideIndexLength, gl.UNSIGNED_SHORT, 0);
        // }
    }
    public constructor(inode: INode, designation: number) {
        this.inode = inode;
        this.metadata = vec4.create()
        this.color = randomColor()
        this.positionRadius = vec4.create()

        this.position = vec3.create()
        this.center = vec3.create()
        this.rotation = vec3.create()
        this.matWorld = mat4.create()
        this.matMV = mat4.create()
        this.matMVP = mat4.create()

        // metadata = A-B-C-D
        //   Aggregate connections
        //   Betweenness
        //   Closeness
        //   Designation (id, as integer)
        this.metadata[0] = inode.num_connections;
        this.metadata[1] = inode.betweenness;
        this.metadata[2] = inode.closeness;
        this.metadata[3] = designation;

        let n: number = Number('0x' + this.inode.id);
        let x: number = Math.floor(n / XDIVISOR)
        let y: number = Math.floor(n / YDIVISOR) & 0xffff;
        let z: number = n & 0xffff;
        this.setPosition(
            x * WORLD_WIDTH / 65536 - WORLD_WIDTH/2,
            y * WORLD_HEIGHT / 65536 - WORLD_HEIGHT/2,
            z * WORLD_DEPTH / 65536 - WORLD_DEPTH/2,
        )
    }

    public setPosition(x: number, y: number, z: number) {
        this.position[0] = x
        this.position[1] = y
        this.position[2] = z
        this.updateMatrix()
    }

    public updateMatrix() {
        // let rx = mat4.create()
        // let rz = mat4.create()
        let ry = mat4.create()
        let t = mat4.create()
        mat4.identity(this.matWorld)
        mat4.translate(this.matWorld, this.matWorld, vec3.fromValues(-this.center[0], -this.center[1], 0))
        mat4.fromYRotation(ry, this.rotation[1])
        // mat4.fromZRotation(rz, this.rotation[2])
        mat4.multiply(this.matWorld, ry, this.matWorld)
        // mat4.multiply(this.matWorld, rx, this.matWorld)
        mat4.fromTranslation(t, this.position)
        mat4.multiply(this.matWorld, t, this.matWorld)
        mat4.multiply(this.matMV, a.matView, this.matWorld)
        mat4.multiply(this.matMVP, a.matProjection, this.matMV)

    }
}