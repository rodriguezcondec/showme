/// <reference path="../../node_modules/@webgpu/types/dist/index.d.ts" />

import { INode } from './core'
import { a } from './globals'
import { mat4, vec3, vec4 } from 'gl-matrix'
import { idToColor, randomColor } from './util'


const WORLD_WIDTH: number = 3600;
const WORLD_HEIGHT: number = 1800;
const WORLD_DEPTH: number = 24;

export class CNode {
    public inode: INode
    public color: vec4
    public idColor: vec4
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

    public updatePositionRadius(isSub: boolean) {
        this.positionRadius = vec4.fromValues(this.position[0], this.position[1], this.radius, isSub ? 1 : 0)

    }

    public updateOverlayUniformsGl(proj: mat4, view: mat4) {
        this.updateMatrix()
        mat4.multiply(this.matMV, view, this.matWorld)
        mat4.multiply(this.matMVP, proj, this.matMV)
    }

    public constructor(inode: INode, id: number) {
        this.inode = inode;
        this.metadata = vec4.create()
        this.color = randomColor()
        this.idColor = idToColor(id)
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
        //   iD (id, as integer)
        this.metadata[0] = inode.num_connections;
        this.metadata[1] = inode.betweenness;
        this.metadata[2] = inode.closeness;
        this.metadata[3] = id;

        // normalize and perform Wager VI projection on longitude/x
        // https://en.wikipedia.org/wiki/Wagner_VI_projection
        // shader does inverse
        let x: number = (this.inode.geolocation.longitude + 180) / 360;
        let y: number = (this.inode.geolocation.latitude + 90) / 180;
        let z: number = Math.random();

        let longitude = x - 0.5;
        let latitude = y - 0.5;
        let transformedX = 0.5 + longitude * Math.sqrt(1 - 3*latitude*latitude);

        this.setPosition(
            transformedX * WORLD_WIDTH - WORLD_WIDTH/2,
            y * WORLD_HEIGHT - WORLD_HEIGHT/2,
            z * WORLD_DEPTH * 0.8 + WORLD_DEPTH * 0.2,
        )
    }

    public setPosition(x: number, y: number, z: number) {
        this.position[0] = x
        this.position[1] = y
        this.position[2] = z
        this.updateMatrix()
    }

    public updateMatrix() {
        let ry = mat4.create()
        let t = mat4.create()
        mat4.identity(this.matWorld)
        mat4.translate(this.matWorld, this.matWorld, vec3.fromValues(-this.center[0], -this.center[1], 0))
        mat4.fromYRotation(ry, this.rotation[1])
        mat4.multiply(this.matWorld, ry, this.matWorld)
        mat4.fromTranslation(t, this.position)
        mat4.multiply(this.matWorld, t, this.matWorld)
        mat4.multiply(this.matMV, a.matView, this.matWorld)
        mat4.multiply(this.matMVP, a.matProjection, this.matMV)
    }
}