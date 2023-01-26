/// <reference path="../../node_modules/@webgpu/types/dist/index.d.ts" />

import { IState, EShader } from './core'
import { a } from './globals';
import { CNode } from './node'
import { vec2, vec3, vec4, mat4 } from 'gl-matrix'
import { initIcosa } from './icosa'
import { CPicker } from './picker';
import { initWorldMap } from './worldmap'
import { glShaders } from './shaders';
import { createRandomTexture, loadTexture } from './util';


const NODE_TRANSFORM_SIZE: number = 28;


export class CWorld {
    public istate: IState
    public nodes: CNode []
    public  gl: WebGL2RenderingContext
    private noiseTexture: WebGLTexture
    private worldMapTexture: WebGLTexture
    private picker: CPicker

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
    private worldMapGeometry: WebGLBuffer
    private transformBuffer: WebGLBuffer
    private pickerBuffer: WebGLBuffer
    private transformData: Float32Array
    private icosaVao: WebGLVertexArrayObject
    private pickerVao: WebGLVertexArrayObject
    private worldMapVao: WebGLVertexArrayObject
    public icosaVPLoc: WebGLUniformLocation
    public worldMapVPLoc: WebGLUniformLocation
    public paramsLoc: WebGLUniformLocation
    public noiseTextureLoc: WebGLUniformLocation
    public worldMapTextureLoc: WebGLUniformLocation
    public pickerVPLoc: WebGLUniformLocation
    public pickerParamsLoc: WebGLUniformLocation
    public pickerNoiseTextureLoc: WebGLUniformLocation
    private startTime: number
    private params: vec4
    private selectedId: number
    private white: vec4;

    public constructor(istate: IState, gl: WebGL2RenderingContext) {
        this.istate = istate
        this.gl = gl
        this.inDrag = false
        this.mouseIsOut = true
        this.lastTime = 0
        this.nodes = new Array()
        this.startTime = Date.now()
        this.params = vec4.create()
        this.picker = new CPicker()
        this.selectedId = -1
        this.white = vec4.fromValues(1, 1, 1, 1)
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
        if (!this.transformData) {
            return;
        }
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

    public handleClick(x: number, y: number) {
        console.log(`world: handleClick: ${x}, ${y}`)
        let screenCoords : vec2 = vec2.fromValues(x/a.canvas.width, 1 - y/a.canvas.height )
        this.picker.preRender(screenCoords[0], screenCoords[1])
        this.renderPicker();
        let id = this.picker.postRender();
        console.log(`  got id ${id}`)
        if (id >= 0) {
            let node = this.nodes[id];
            console.log('node: ', node.inode);
            a.ipNode.nodeValue = node.inode.ip
            a.betweennessNode.nodeValue = node.inode.betweenness.toFixed(6)
            a.closenessNode.nodeValue = node.inode.closeness.toFixed(6)
            a.connectionsNode.nodeValue = node.inode.num_connections.toString()
            a.latitudeNode.nodeValue = node.inode.geolocation.latitude.toFixed(4)
            a.longitudeNode.nodeValue = node.inode.geolocation.longitude.toFixed(4)
            a.cityNode.nodeValue = node.inode.geolocation.city
            a.countryNode.nodeValue = node.inode.geolocation.country
            // display
            document.getElementById("overlayRight").style.visibility = "visible";
        } else {
            // hide 
            document.getElementById("overlayRight").style.visibility = "hidden";
        }
        if (id != this.selectedId) {
            if (this.selectedId != -1) {
                // restore color
                console.log('restore color id ', this.selectedId)
                this.transformData.set(this.nodes[this.selectedId].color, this.selectedId*NODE_TRANSFORM_SIZE);
            }
            if (id != -1) {
                // set new selection to white
                console.log('set white id ', id)
                this.transformData.set(this.white, id*NODE_TRANSFORM_SIZE);
            }
            this.selectedId = id
        }
    }

    private initTransformData() {
        let gl = this.gl
        this.transformData = new Float32Array(this.istate.agraph_length * NODE_TRANSFORM_SIZE);
        let n: number = 0;
        console.log('this.istate.agraph_length : ', this.istate.agraph_length)
        console.log('nodes length : ', this.nodes.length)
        for (let node of this.nodes) {
            this.transformData.set(node.color, n);
            n += 4
            this.transformData.set(node.metadata, n);
            n += 4
            this.transformData.set(node.idColor, n);
            n += 4
            this.transformData.set(node.matWorld, n);
            n += 16
        }
        console.log('initTransformData: len ', this.transformData.length)
        this.transformBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
        this.pickerBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pickerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
    }

    private updateTransformData() {
        let gl = this.gl
        let n: number = 12;
        for (let node of this.nodes) {
            this.transformData.set(node.matWorld, n);
            n += 28
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
    }

    public async initialize() {
        console.log('world::initialize, num nodes: ' + this.istate.agraph_length);
        let id = 0
        for (let inode of this.istate.nodes) {
            let node = new CNode(inode, id)
            this.nodes.push(node);
            id++
        }
        console.log('last id: ', id)

        let gl = this.gl;


        // Textures
        this.noiseTexture = createRandomTexture(gl, 1024, 1);
        let width = gl.getParameter(gl.MAX_TEXTURE_SIZE)
        console.log('max width is ', width);
        if (width >= 8192) {
            this.worldMapTexture = await loadTexture(gl, "data/Blue_Marble_NG_8k.jpeg");
        } else {
            this.worldMapTexture = await loadTexture(gl, "data/Blue_Marble_NG_4k.jpeg");
        }

        // Icosa -------------------------------------------
        let positionLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_position');
        let colorLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_color');
        let metadataLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_metadata');
        let modelLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_model');
        let normalLoc = gl.getAttribLocation(glShaders[EShader.Icosa], 'a_normal');
        this.icosaVPLoc = gl.getUniformLocation(glShaders[EShader.Icosa], 'u_viewProjection');
        this.paramsLoc = gl.getUniformLocation(glShaders[EShader.Icosa], 'u_params');
        this.noiseTextureLoc = gl.getUniformLocation(glShaders[EShader.Icosa], 'u_noiseTexture');

        console.log('icosa positionLoc ', positionLoc)
        console.log('icosa modelLoc ', modelLoc)
        console.log('icosa colorLoc ', colorLoc)
        console.log('icosa metadataLoc ', metadataLoc)
        console.log('icosa normalLoc ', normalLoc)

        this.icosaGeometry = initIcosa(gl)
        this.icosaVao = gl.createVertexArray();
        gl.bindVertexArray(this.icosaVao);


        // ATTRIBS 0/1/2/3/5/7 are in the transform data1
        this.initTransformData();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 48);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 64);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 80);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 96);
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

        // Picker ------------------------------------------------------
        positionLoc = gl.getAttribLocation(glShaders[EShader.Picker], 'a_position');
        let pickerColorLoc = gl.getAttribLocation(glShaders[EShader.Picker], 'a_pickerColor');
        metadataLoc = gl.getAttribLocation(glShaders[EShader.Picker], 'a_metadata');
        modelLoc = gl.getAttribLocation(glShaders[EShader.Picker], 'a_model');
        this.pickerVPLoc = gl.getUniformLocation(glShaders[EShader.Picker], 'u_viewProjection');
        this.pickerParamsLoc = gl.getUniformLocation(glShaders[EShader.Picker], 'u_params');
        this.pickerNoiseTextureLoc = gl.getUniformLocation(glShaders[EShader.Picker], 'u_noiseTexture');

        console.log('picker positionLoc ', positionLoc)
        console.log('picker pickerColorLoc ', pickerColorLoc)
        console.log('picker metadataLoc ', metadataLoc)
        console.log('picker modelLoc ', modelLoc)
        this.pickerVao = gl.createVertexArray();
        gl.bindVertexArray(this.pickerVao);


        // ATTRIBS 0/1/2/3/5/6 are in the transform data1
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pickerBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 48);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 64);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 80);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 96);
        gl.enableVertexAttribArray(6);
        gl.vertexAttribPointer(6, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 32);
        gl.enableVertexAttribArray(5);
        gl.vertexAttribPointer(5, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 16);

        gl.vertexAttribDivisor(0,1);
        gl.vertexAttribDivisor(1,1);
        gl.vertexAttribDivisor(2,1);
        gl.vertexAttribDivisor(3,1);
        gl.vertexAttribDivisor(5,1);
        gl.vertexAttribDivisor(6,1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.icosaGeometry);

        // ATTRIBS 4 & 6 are in the vertex data (same for each instance)
        // positions
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 24, 0);

        // World Map ------------------------------------------------------------
        positionLoc = gl.getAttribLocation(glShaders[EShader.WorldMap], 'a_position');
        const uvLoc = gl.getAttribLocation(glShaders[EShader.WorldMap], 'a_uv');
        this.worldMapVPLoc = gl.getUniformLocation(glShaders[EShader.WorldMap], 'u_viewProjection');
        this.worldMapTextureLoc = gl.getUniformLocation(glShaders[EShader.WorldMap], 'u_worldMapTexture');

        this.worldMapGeometry = initWorldMap(gl)
        this.worldMapVao = gl.createVertexArray();
        gl.bindVertexArray(this.worldMapVao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldMapGeometry);
        // positions
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
        // uv coords
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    }


    public renderGl() {
        let elapsed = this.startTime - Date.now()
        this.params[0] = elapsed / 1000.0;
        let gl = this.gl

        // Nodes
        gl.useProgram(glShaders[EShader.Icosa]);
        gl.uniformMatrix4fv(this.icosaVPLoc, false, a.matViewProjection);
        gl.uniform4fv(this.paramsLoc, this.params);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.uniform1i(this.noiseTextureLoc, 0);
        gl.bindVertexArray(this.icosaVao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 60, this.istate.agraph_length);

        // World Map
        gl.useProgram(glShaders[EShader.WorldMap]);
        gl.uniformMatrix4fv(this.worldMapVPLoc, false, a.matViewProjection);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.worldMapTexture);
        gl.uniform1i(this.worldMapTextureLoc, 0);
        gl.bindVertexArray(this.worldMapVao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    public renderPicker() {
        let gl = this.gl
        gl.useProgram(glShaders[EShader.Picker]);
        gl.uniformMatrix4fv(this.pickerVPLoc, false, a.matViewProjection);
        gl.uniform4fv(this.pickerParamsLoc, this.params);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.uniform1i(this.pickerNoiseTextureLoc, 0);
        gl.bindVertexArray(this.pickerVao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 60, this.istate.agraph_length);
    }
}

