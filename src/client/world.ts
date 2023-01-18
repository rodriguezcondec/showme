/// <reference path="../../node_modules/@webgpu/types/dist/index.d.ts" />

import { IState } from './core'
import { CNode } from './node'
import { vec2, vec3, vec4, mat4 } from 'gl-matrix'
import { initIcosa } from './icosa'
import { glShaders } from './shaders';
import { createRandomTexture } from './util';


const NODE_TRANSFORM_SIZE: number = 24;


export class CWorld {
    public istate: IState
    public nodes: CNode []
    public  gl: WebGL2RenderingContext
    private iter: number
    private noiseTexture: WebGLTexture

    public topTexture: WebGLTexture
    public inDrag: boolean
    public inTap: boolean
    public inDragStartTime: number
    public mouseIsOut: boolean
    public inSwipe: boolean
    public inTouchX: number
    public inTouchY: number
    public inTouchTime: number
    private lastTime: number
    private icosaGeometry: WebGLBuffer
    private transformBuffer: WebGLBuffer
    private transformData: Float32Array
    private vao: WebGLVertexArrayObject
    public viewProjectionLoc: WebGLUniformLocation
    public paramsLoc: WebGLUniformLocation
    public noiseTextureLoc: WebGLUniformLocation
    private startTime: number
    private params: vec4

    public constructor(istate: IState, gl: WebGL2RenderingContext) {
        this.istate = istate
        this.gl = gl
        this.inDrag = false
        this.mouseIsOut = true
        this.iter = 0
        this.lastTime = 0
        this.nodes = new Array()
        this.startTime = Date.now()
        this.params = vec4.create()
    }



    // private createDrawList() {
    //     this.setTableBounds();
    //     this.drawlist = new Array()
    //     for ( let group of this.groups ) {
    //         if (group.position[0] + group.radius < this.minX) {
    //             continue
    //         }
    //         if (group.position[0] - group.radius > this.maxX) {
    //             continue
    //         }
    //         if (group.position[1] + group.radius < this.minY) {
    //             continue
    //         }
    //         if (group.position[1] - group.radius > this.maxY) {
    //             continue
    //         }
    //         this.drawlist.push(group)
    //     }
    //     if (this.listsize != this.drawlist.length) {
    //         this.listsize = this.drawlist.length
    //         console.log('this.listsize = ' + this.listsize)
    //     }
    // }

    // private clampCamera() {
    //     if (a.cameraX < -a.tabla.width/2) {
    //         a.cameraX = -a.tabla.width/2
    //     }
    //     if (a.cameraX > a.tabla.width/2) {
    //         a.cameraX = a.tabla.width/2
    //     }
    //     if (a.cameraY < -a.tabla.height/2) {
    //         a.cameraY = -a.tabla.height/2
    //     }
    //     if (a.cameraY > a.tabla.height/2) {
    //         a.cameraY = a.tabla.height/2
    //     }
    // }

    public update() {
        let n = 500
        let now = Date.now();
        for (let node of this.nodes) {
            node.incRotationY(2 * Math.PI / 180 * n / 4000)
            node.updateMatrix()
            n++
        }
        this.updateTransformData()
        let done = Date.now();
        //console.log(`now ${now} done ${done} delta ${done-now}`)

    }

    private initTransformData() {
        let gl = this.gl
        this.transformData = new Float32Array(this.istate.agraphlen * NODE_TRANSFORM_SIZE);
        let n: number = 0;
        for (let node of this.nodes) {
            this.transformData.set(node.color, n);
            n += 4
            this.transformData.set(node.metadata, n);
            n += 4
            this.transformData.set(node.matWorld, n);
            n += 16
        }
        console.log('initTransformData: len ', this.transformData.length)
        this.transformBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
    }

    private updateTransformData() {
        let gl = this.gl
        let n: number = 8;
        for (let node of this.nodes) {
            this.transformData.set(node.matWorld, n);
            n += 24
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
    }

    public async initialize() {
        console.log('world::initialize, num nodes: ' + this.istate.agraphlen);
        let designation = 0
        for (let inode of this.istate.nodes) {
            let node = new CNode(inode, designation)
            this.nodes.push(node);
            designation++
        }

        let gl = this.gl;
        this.noiseTexture = createRandomTexture(gl, 1024, 1);

        const positionLoc = gl.getAttribLocation(glShaders[0], 'a_position');
        const colorLoc = gl.getAttribLocation(glShaders[0], 'a_color');
        const metadataLoc = gl.getAttribLocation(glShaders[0], 'a_metadata');
        const modelLoc = gl.getAttribLocation(glShaders[0], 'a_model');        const normalLoc = gl.getAttribLocation(glShaders[0], 'a_normal');
        this.viewProjectionLoc = gl.getUniformLocation(glShaders[0], 'u_viewProjection');
        this.paramsLoc = gl.getUniformLocation(glShaders[0], 'u_params');
        this.noiseTextureLoc = gl.getUniformLocation(glShaders[0], 'u_noiseTexture');

        console.log('positionLoc ', positionLoc)
        console.log('modelLoc ', modelLoc)
        console.log('colorLoc ', colorLoc)
        console.log('metadataLoc ', metadataLoc)
        console.log('normalLoc ', normalLoc)

        this.icosaGeometry = initIcosa(gl)

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);


        // ATTRIBS 0/1/2/3/5/7 are in the transform data
        this.initTransformData();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 32);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 48);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 64);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 80);
        gl.enableVertexAttribArray(5);
        gl.vertexAttribPointer(5, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 0);
        gl.enableVertexAttribArray(7);
        gl.vertexAttribPointer(7, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 16);

        gl.vertexAttribDivisor(0,1);
        gl.vertexAttribDivisor(1,1);
        gl.vertexAttribDivisor(2,1);
        gl.vertexAttribDivisor(3,1);
        gl.vertexAttribDivisor(5,1);
        gl.vertexAttribDivisor(7,1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.icosaGeometry);

        // ATTRIBS 4 & 6 are in the vertex data (same for each instance)
        // positions
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 24, 0);
        // normals
        gl.enableVertexAttribArray(6);
        gl.vertexAttribPointer(6, 3, gl.FLOAT, false, 24, 12);
    }

    // async initializeGl(gl: WebGL2RenderingContext) {
    //     this.gl = gl

        // await this.createPieceMaterials(gl)

        // var a_Position = gl.getAttribLocation(a.g.topMaterial.program, 'a_Position');
        // if(a_Position < 0) {
        //   console.log('Failed to get the storage location of a_Position');
        //   return -1;
        // } 
        // a.topPosBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, a.topPosBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
        // if (this.ipuzzle.dem) {
        //     var a_Normal = gl.getAttribLocation(a.g.topMaterial.program, 'a_Normal');
        //     if(a_Normal < 0) {
        //       console.log('Failed to get the storage location of a_Normal');
        //       return -1;
        //     } 
        
        //     gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 24, 0);
        //     gl.enableVertexAttribArray(a_Position);
        //     gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 24, 12);
        //     gl.enableVertexAttribArray(a_Normal);
        // } else {
        //     gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 8, 0);
        //     gl.enableVertexAttribArray(a_Position);
        // }

    // }


    public renderGl() {
        this.iter++
        if (this.iter % 60 == 0) {
            let now = Date.now()
            let delta = now - this.lastTime
            console.log('60 frames seconds: ', delta)
            this.lastTime = now
        }

        let elapsed = this.startTime - Date.now()
        this.params[0] = elapsed / 1000.0;
        let gl = this.gl
        gl.uniform4fv(this.paramsLoc, this.params);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.uniform1i(this.noiseTextureLoc, 0);

        gl.bindVertexArray(this.vao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 60, this.istate.agraphlen);
    }

    public release() {
        // console.log('puzzle release')
        // for ( let group of this.groups ) {
        //     console.log('puzzle release group')
        //     for ( let instance of group.instances ) {
        //         instance.release()
        //         instance = null
        //     }
        //     group.release()
        //     group = null
        // }               
        // this.groups = null 
        // for ( let piece of this.pieces ) {
        //     console.log('puzzle release piece')
        //     piece.release()
        //     piece = null
        // }
        // a.pcamera.release()
        // a.pcamera = null
        // this.pieces = null
        // if (a.gpu) {
        //     console.log('puzzle release gpu')
        //     a.w.topTextureGpu.destroy()
        //     a.w.topTextureGpu = null
        //     if (a.w.normalTextureGpu) {
        //         a.w.normalTextureGpu.destroy()
        //         a.w.normalTextureGpu = null
        //     }
        // }
        // // release gpu resources, etc.
        // if (this.collision) {
        //     this.collision.collisionBuffer = null
        //     this.collision = null
        // }
        // this.ipuzzle = null
        // this.positions = null
        // this.flip = null
        // this.info = null
        // this.backFlip = null
        // this.backInfo = null
        // console.log('puzzle release done')
    }
}

