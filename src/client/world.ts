/// <reference path="../../node_modules/@webgpu/types/dist/index.d.ts" />

import { IState, EShader, INode, EColorMode } from './core'
import { CNode } from './node'
import { vec2, vec3, vec4, mat4 } from 'gl-matrix'
import { icosaGeometry } from './geomicosa'
import { gradientGeometry } from './geomgradient'
import { lineGeometry } from './geomline'
import { CPicker } from './picker';
import { PCamera } from './camera';
import { initWorldMap } from './worldmap'
import { glShaders } from './shaders';
import { createRandomTexture, loadTexture } from './util';


const NODE_TRANSFORM_SIZE: number = 28;
const CONNECTION_TRANSFORM_SIZE: number = 12;


export class CWorld {
    public istate: IState;
    public nodes: CNode [];
    public  gl: WebGL2RenderingContext;
    private noiseTexture: WebGLTexture;
    private worldMapTexture: WebGLTexture;
    private gradientTexture: WebGLTexture;
    private picker: CPicker;

    public topTexture: WebGLTexture;
    public inDrag: boolean;
    public inTap: boolean;
    public inDragStartTime: number;
    public mouseIsOut: boolean;
    public inSwipe: boolean;
    public inTouchX: number;
    public inTouchY: number;
    public inTouchTime: number;
    private icosaGeometry: WebGLBuffer;
    private gradientGeometry: WebGLBuffer;
    private worldMapGeometry: WebGLBuffer;
    private lineGeometry: WebGLBuffer;
    private transformBuffer: WebGLBuffer;
    private pickerBuffer: WebGLBuffer;
    private connectionBuffer: WebGLBuffer;
    private transformData: Float32Array;
    private connectionData: Float32Array;
    private icosaVao: WebGLVertexArrayObject;
    private pickerVao: WebGLVertexArrayObject;
    private worldMapVao: WebGLVertexArrayObject;
    private gradientVao: WebGLVertexArrayObject;
    private connectionVao: WebGLVertexArrayObject;
    public icosaVPLoc: WebGLUniformLocation;
    public worldMapVPLoc: WebGLUniformLocation;
    public connectionVPLoc: WebGLUniformLocation;
    public paramsLoc: WebGLUniformLocation;
    public noiseTextureLoc: WebGLUniformLocation;
    public worldMapTextureLoc: WebGLUniformLocation;
    public gradientTextureLoc: WebGLUniformLocation;
    public pickerVPLoc: WebGLUniformLocation;
    public pickerParamsLoc: WebGLUniformLocation;
    public pickerNoiseTextureLoc: WebGLUniformLocation;
    private startTime: number;
    private params: vec4;
    private selectedId: number;
    private white: vec4;;
    private maxConnections: number;
    private minConnections: number;
    private drawConnections: boolean;
    private numConnectionsToDraw: number;
    public connectionMode: boolean;
    public displayCommand: boolean;
    public displayFps: boolean;
    public displayGradient: boolean;
    private minBetweenness: number;
    private maxBetweenness: number;
    private minCloseness: number;
    private maxCloseness: number;
    public colorMode: EColorMode;
    private canvas: HTMLCanvasElement;
    private camera: PCamera;
    private betweennessDescription: string;
    private closenessDescription: string;
    private degreeDescription: string;

    public timeNode: Text;
    public fpsNode: Text;
    public ipNode: Text;
    public betweennessNode: Text;
    public closenessNode: Text;
    public connectionsNode: Text;
    public latitudeNode: Text;
    public longitudeNode: Text;
    public cityNode: Text;
    public countryNode: Text;
    public positionNode: Text;
    public heightNode: Text;
    public colorModeNode: Text;
    public gradientNode: Text;


    private initTextNodes() {

        // Create text nodes to save some time for the browser.
        this.timeNode = document.createTextNode("");
        this.fpsNode = document.createTextNode("");
        this.ipNode = document.createTextNode("");
        this.betweennessNode = document.createTextNode("");
        this.closenessNode = document.createTextNode("");
        this.connectionsNode = document.createTextNode("");
        this.latitudeNode = document.createTextNode("");
        this.longitudeNode = document.createTextNode("");
        this.positionNode = document.createTextNode("");
        this.heightNode = document.createTextNode("");
        this.cityNode = document.createTextNode("");
        this.countryNode = document.createTextNode("");
        this.colorModeNode = document.createTextNode("");
        this.gradientNode = document.createTextNode("");

        this.updateColorDisplay();

        // Add those text nodes where they need to go
        document.querySelector("#time").appendChild(this.timeNode);
        document.querySelector("#fps").appendChild(this.fpsNode);
        document.querySelector("#ip").appendChild(this.ipNode);
        document.querySelector("#betweenness").appendChild(this.betweennessNode);
        document.querySelector("#closeness").appendChild(this.closenessNode);
        document.querySelector("#connections").appendChild(this.connectionsNode);
        document.querySelector("#latitude").appendChild(this.latitudeNode);
        document.querySelector("#longitude").appendChild(this.longitudeNode);
        document.querySelector("#position").appendChild(this.positionNode);
        document.querySelector("#height").appendChild(this.heightNode);
        document.querySelector("#city").appendChild(this.cityNode);
        document.querySelector("#country").appendChild(this.countryNode);
        document.querySelector("#colormode").appendChild(this.colorModeNode);
        document.querySelector("#gradient").appendChild(this.gradientNode);
        document.getElementById("overlayRight").style.visibility = "hidden";
    }

    public constructor(istate: IState, gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, camera: PCamera) {
        this.istate = istate;
        this.canvas = canvas;
        this.camera = camera;
        this.gl = gl;
        this.inDrag = false;
        this.mouseIsOut = true;
        this.nodes = new Array();
        this.startTime = Date.now();
        this.params = vec4.create();
        this.picker = new CPicker(gl);
        this.selectedId = -1;
        this.white = vec4.fromValues(1, 1, 1, 1);
        this.maxConnections = 0;
        this.minConnections = 10000;
        this.drawConnections = false;
        this.numConnectionsToDraw = 0;
        this.connectionMode = false;
        this.displayCommand = true;
        this.displayFps = true;
        this.displayGradient = true;
        this.minBetweenness = 100;
        this.maxBetweenness = 0;
        this.minCloseness = 100;
        this.maxCloseness = 0;
        this.colorMode = EColorMode.Random
        this.initTextNodes();
    };

    private updateNodeColors() {
        let n: number = 0;
        for (let node of this.nodes) {
            this.transformData.set(node.getCurrentColor(this.colorMode), n);
            n += NODE_TRANSFORM_SIZE
        }
    }

    public updateColorDisplay() {
        switch (this.colorMode) {
            case EColorMode.Random:
                this.colorModeNode.nodeValue = 'random'
                break;
            case EColorMode.Between:
                this.colorModeNode.nodeValue = 'betweenness'
                // this.gradientNode.nodeValue = this.betweennessDescription;
                document.getElementById("gradient").textContent = this.betweennessDescription;
                break;
            case EColorMode.Close:
                this.colorModeNode.nodeValue = 'closeness'
                // this.gradientNode.nodeValue = this.closenessDescription;
                document.getElementById("gradient").textContent = this.closenessDescription;
                break;
            case EColorMode.Degree:
                this.colorModeNode.nodeValue = 'degree'
                // this.gradientNode.nodeValue = this.degreeDescription;
                document.getElementById("gradient").textContent = this.degreeDescription;
                break;
        }
        this.updateNodeColors();
        document.getElementById("gradient").style.visibility = this.colorMode != EColorMode.Random && this.displayGradient ? "visible" : "hidden";
    }

    public cycleColorMode() {
        this.colorMode++;
        if (this.colorMode == EColorMode.Last) {
            this.colorMode = EColorMode.Random;
        }
        this.updateColorDisplay();
    }

    public update() {
        if (!this.transformData) {
            return;
        }
        // let now = Date.now();
        for (let node of this.nodes) {
            node.incRotationY(2 * Math.PI / 180 * node.numConnections / 400);
            node.updateMatrix();
        }
        this.updateTransformData();
        // let done = Date.now();
        // console.log(`now ${now} done ${done} delta ${done-now}`)
    }

    public handleClick(x: number, y: number) {
        console.log(`world: handleClick: ${x}, ${y}`)
        let screenCoords : vec2 = vec2.fromValues(x/this.canvas.width, 1 - y/this.canvas.height )
        this.picker.preRender(screenCoords[0], screenCoords[1])
        this.renderPicker();
        let id = this.picker.postRender();
        console.log(`  got id ${id}`)
        if (id >= 0) {
            let node = this.nodes[id];
            this.ipNode.nodeValue = node.inode.ip;
            this.betweennessNode.nodeValue = node.inode.betweenness.toFixed(6);
            this.closenessNode.nodeValue = node.inode.closeness.toFixed(6);
            this.connectionsNode.nodeValue = node.numConnections.toString();
            this.latitudeNode.nodeValue = node.inode.geolocation.latitude.toFixed(4);
            this.longitudeNode.nodeValue = node.inode.geolocation.longitude.toFixed(4);
            this.cityNode.nodeValue = node.inode.geolocation.city;
            this.countryNode.nodeValue = node.inode.geolocation.country;
            this.positionNode.nodeValue = node.inode.cell_position.toString();
            this.heightNode.nodeValue = node.inode.cell_height.toString();
            document.getElementById("overlayRight").style.visibility = "visible";
        } else {
            document.getElementById("overlayRight").style.visibility = "hidden";
        }
        if (id != this.selectedId) {
            if (this.selectedId != -1) {
                // restore color
                this.transformData.set(this.nodes[this.selectedId].getCurrentColor(this.colorMode), this.selectedId*NODE_TRANSFORM_SIZE);
            }
            if (id != -1) {
                // set new selection to white
                let node: CNode = this.nodes[id];
                this.transformData.set(this.white, id*NODE_TRANSFORM_SIZE);
                this.setConnectionData(node);
                this.numConnectionsToDraw = node.numConnections;
                this.drawConnections = true;
            } else {
                this.drawConnections = false;
            }
            this.selectedId = id
        }
    }

    private initTransformData() {
        let gl = this.gl;
        this.transformData = new Float32Array(this.istate.agraph_length * NODE_TRANSFORM_SIZE);
        let n: number = 0;
        for (let node of this.nodes) {
            this.transformData.set(node.randomColor, n);
            this.transformData.set(node.metadata, n+4);
            this.transformData.set(node.idColor, n+8);
            this.transformData.set(node.matWorld, n+12);
            n += NODE_TRANSFORM_SIZE
        }
        this.transformBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
        this.pickerBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pickerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
    }

    private initConnectionData(maxConnections: number) {
        let gl = this.gl
        this.connectionData = new Float32Array(maxConnections * CONNECTION_TRANSFORM_SIZE);
        this.connectionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.connectionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.connectionData, gl.STATIC_DRAW);
    }

    private setConnectionData(node: CNode) {
        console.log('setConnectionData, node ', node.id);
        let gl = this.gl;
        let n: number = 0;
        console.log('  num_connections : ', node.numConnections);
        for (let index of node.inode.connections) {
            let conn: CNode = this.nodes[index];
            this.connectionData.set(conn.randomColor, n);
            this.connectionData.set(node.position, n+4);
            let delta: vec3 = vec3.create();
            vec3.sub(delta, conn.position, node.position);
            this.connectionData.set(delta, n+8);
            n += 12;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.connectionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.connectionData, gl.STATIC_DRAW);
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

    private initNodesGl() {
        let gl = this.gl;
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

        this.icosaGeometry = icosaGeometry(gl)
        this.icosaVao = gl.createVertexArray();
        gl.bindVertexArray(this.icosaVao);

        this.initTransformData();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 0);
        gl.enableVertexAttribArray(metadataLoc);
        gl.vertexAttribPointer(metadataLoc, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 16);
        gl.enableVertexAttribArray(modelLoc);
        gl.vertexAttribPointer(modelLoc, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 48);
        gl.enableVertexAttribArray(modelLoc+1);
        gl.vertexAttribPointer(modelLoc+1, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 64);
        gl.enableVertexAttribArray(modelLoc+2);
        gl.vertexAttribPointer(modelLoc+2, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 80);
        gl.enableVertexAttribArray(modelLoc+3);
        gl.vertexAttribPointer(modelLoc+3, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 96);

        gl.vertexAttribDivisor(modelLoc,1);
        gl.vertexAttribDivisor(modelLoc+1,1);
        gl.vertexAttribDivisor(modelLoc+2,1);
        gl.vertexAttribDivisor(modelLoc+3,1);
        gl.vertexAttribDivisor(colorLoc,1);
        gl.vertexAttribDivisor(metadataLoc,1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.icosaGeometry);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(normalLoc);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 24, 12);

    }

    private initPickerGl() {
        let gl = this.gl;
        let positionLoc = gl.getAttribLocation(glShaders[EShader.Picker], 'a_position');
        let pickerColorLoc = gl.getAttribLocation(glShaders[EShader.Picker], 'a_pickerColor');
        let metadataLoc = gl.getAttribLocation(glShaders[EShader.Picker], 'a_metadata');
        let modelLoc = gl.getAttribLocation(glShaders[EShader.Picker], 'a_model');
        this.pickerVPLoc = gl.getUniformLocation(glShaders[EShader.Picker], 'u_viewProjection');
        this.pickerParamsLoc = gl.getUniformLocation(glShaders[EShader.Picker], 'u_params');
        this.pickerNoiseTextureLoc = gl.getUniformLocation(glShaders[EShader.Picker], 'u_noiseTexture');

        console.log('picker positionLoc ', positionLoc)
        console.log('picker pickerColorLoc ', pickerColorLoc)
        console.log('picker metadataLoc ', metadataLoc)
        console.log('picker modelLoc ', modelLoc)
        this.pickerVao = gl.createVertexArray();
        gl.bindVertexArray(this.pickerVao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.pickerBuffer);
        gl.enableVertexAttribArray(metadataLoc);
        gl.vertexAttribPointer(metadataLoc, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 16);
        gl.enableVertexAttribArray(pickerColorLoc);
        gl.vertexAttribPointer(pickerColorLoc, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 32);
        gl.enableVertexAttribArray(modelLoc);
        gl.vertexAttribPointer(modelLoc+0, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 48);
        gl.enableVertexAttribArray(modelLoc+1);
        gl.vertexAttribPointer(modelLoc+1, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 64);
        gl.enableVertexAttribArray(modelLoc+2);
        gl.vertexAttribPointer(modelLoc+2, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 80);
        gl.enableVertexAttribArray(modelLoc+3);
        gl.vertexAttribPointer(modelLoc+3, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 96);

        gl.vertexAttribDivisor(modelLoc+0,1);
        gl.vertexAttribDivisor(modelLoc+1,1);
        gl.vertexAttribDivisor(modelLoc+2,1);
        gl.vertexAttribDivisor(modelLoc+3,1);
        gl.vertexAttribDivisor(pickerColorLoc,1);
        gl.vertexAttribDivisor(metadataLoc,1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.icosaGeometry);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 24, 0);


    }

    private initWorldMapGl() {
        let gl = this.gl;
        this.worldMapVPLoc = gl.getUniformLocation(glShaders[EShader.WorldMap], 'u_viewProjection');
        this.worldMapTextureLoc = gl.getUniformLocation(glShaders[EShader.WorldMap], 'u_worldMapTexture');

        this.worldMapGeometry = initWorldMap(gl)
        this.worldMapVao = gl.createVertexArray();
        gl.bindVertexArray(this.worldMapVao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.worldMapGeometry);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    }

    private initGradientGl() {
        let gl = this.gl;
        this.gradientTextureLoc = gl.getUniformLocation(glShaders[EShader.Gradient], 'u_gradientTexture');
        this.gradientGeometry = gradientGeometry(gl)
        this.gradientVao = gl.createVertexArray();
        gl.bindVertexArray(this.gradientVao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.gradientGeometry);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    }

    initConnectionsGl() {
        let gl = this.gl;
        let positionLoc = gl.getAttribLocation(glShaders[EShader.Connection], 'a_position');
        let colorLoc = gl.getAttribLocation(glShaders[EShader.Connection], 'a_color');
        let vertex1Loc = gl.getAttribLocation(glShaders[EShader.Connection], 'a_vertex1');
        let vertex2Loc = gl.getAttribLocation(glShaders[EShader.Connection], 'a_vertex2');
        this.connectionVPLoc = gl.getUniformLocation(glShaders[EShader.Connection], 'u_viewProjection');

        console.log('connection positionLoc ', positionLoc)
        console.log('connection colorLoc ', colorLoc)
        console.log('connection vertex1Loc ', vertex1Loc)
        console.log('connection vertex2Loc ', vertex2Loc)

        this.lineGeometry = lineGeometry(gl)
        this.connectionVao = gl.createVertexArray();
        gl.bindVertexArray(this.connectionVao);

        this.initConnectionData(this.maxConnections);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.connectionBuffer);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, CONNECTION_TRANSFORM_SIZE*4, 0);
        gl.enableVertexAttribArray(vertex1Loc);
        gl.vertexAttribPointer(vertex1Loc, 4, gl.FLOAT, false, CONNECTION_TRANSFORM_SIZE*4, 16);
        gl.enableVertexAttribArray(vertex2Loc);
        gl.vertexAttribPointer(vertex2Loc, 4, gl.FLOAT, false, CONNECTION_TRANSFORM_SIZE*4, 32);

        gl.vertexAttribDivisor(colorLoc,1);
        gl.vertexAttribDivisor(vertex1Loc,1);
        gl.vertexAttribDivisor(vertex2Loc,1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineGeometry);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 12, 0);
    }

    public async initTexturesGl() {
        let gl = this.gl;
        this.noiseTexture = createRandomTexture(gl, 1024, 1);
        let width = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        console.log('max width is ', width);
        let precision = gl.getParameter(gl.DEPTH_BITS) ;
        console.log('precision is ', precision);
        if (width >= 8192) {
            this.worldMapTexture = await loadTexture(gl, "data/Blue_Marble_NG_8k.jpeg");
        } else {
            this.worldMapTexture = await loadTexture(gl, "data/Blue_Marble_NG_4k.jpeg");
        }
        this.gradientTexture = await loadTexture(gl, "data/gradient.jpeg");

    }

    private updateStats(inode: INode) {
        if (inode.connections.length > this.maxConnections) {
            this.maxConnections = inode.connections.length;
        }
        if (inode.connections.length < this.minConnections) {
            this.minConnections = inode.connections.length;
        }
        if (inode.betweenness < this.minBetweenness) {
            this.minBetweenness = inode.betweenness;
        }
        if (inode.betweenness > this.maxBetweenness) {
            this.maxBetweenness = inode.betweenness;
        }
        if (inode.closeness < this.minCloseness) {
            this.minCloseness = inode.closeness;
        }
        if (inode.closeness > this.maxCloseness) {
            this.maxCloseness = inode.closeness;
        }
    }

    private colorFromNormalizedValue(v: number) : vec4 {
        if (v < 0.25) {
            // blue -> cyan
            v = v * 4;
            return vec4.fromValues(0, v, 1, 1);
        } else if (v < 0.5) {
            // cyan -> green
            v = (v-0.25) * 4;
            return vec4.fromValues(0, 1, 1-v, 1);
        } else if (v < 0.75) {
            // green -> yellow
            v = (v-0.50) * 4;
            return vec4.fromValues(v, 1, 0, 1);
        } else {
            // yellow -> red
            v = (v-0.75) * 4;
            return vec4.fromValues(1, 1-v, 0, 1);
        }
    }

    private setAuxColors() {
        for (let node of this.nodes) {
            let b = (node.inode.betweenness - this.minBetweenness) / (this.maxBetweenness - this.minBetweenness);
            node.betweenColor = this.colorFromNormalizedValue(b);

            let c =  (node.inode.closeness - this.minCloseness) / (this.maxCloseness - this.minCloseness);
            node.closeColor = this.colorFromNormalizedValue(c);

            let d =  (node.numConnections - this.minConnections) / (this.maxConnections - this.minConnections);
            node.degreeColor = this.colorFromNormalizedValue(d);
        }
    }

    private setDescriptions() {
        this.betweennessDescription = 'MIN: ' + this.minBetweenness.toFixed(6) + ' ---- BETWEENNESS ---- MAX: ' + this.maxBetweenness.toFixed(6);
        this.closenessDescription = 'MIN: ' + this.minCloseness.toFixed(4) +     ' ----- CLOSENESS ----- MAX: ' + this.maxCloseness.toFixed(4);
        this.degreeDescription = 'MIN: ' + this.minConnections +                    ' ------- DEGREE ------ MAX: ' + this.maxConnections;
        console.log(this.betweennessDescription);
        console.log(this.closenessDescription);
        console.log(this.degreeDescription);
    
    }

    public async initialize() {
        console.log('world::initialize, num nodes: ' + this.istate.agraph_length);
        let gl = this.gl;
        let id = 0;
        for (let inode of this.istate.nodes) {
            let node = new CNode(inode, id, this.camera)
            this.nodes.push(node);
            id++;
        }

        for (let inode of this.istate.nodes) {
            this.updateStats(inode);
        }

        this.setDescriptions();
        this.setAuxColors();
        await this.initTexturesGl();
        this.initNodesGl();
        this.initPickerGl();
        this.initWorldMapGl();
        this.initConnectionsGl();
        this.initGradientGl();
    }

    private renderWorldMap() {
        let gl = this.gl
        gl.depthMask(false);
        gl.useProgram(glShaders[EShader.WorldMap]);
        gl.uniformMatrix4fv(this.worldMapVPLoc, false, this.camera.matViewProjection);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.worldMapTexture);
        gl.uniform1i(this.worldMapTextureLoc, 0);
        gl.bindVertexArray(this.worldMapVao);
        gl.drawArrays(gl.TRIANGLES, 0, 108);
    }

    private renderGradient() {
        let gl = this.gl
        gl.depthMask(false);
        gl.useProgram(glShaders[EShader.Gradient]);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.gradientTexture);
        gl.uniform1i(this.gradientTextureLoc, 0);
        gl.bindVertexArray(this.gradientVao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    renderConnections() {
        let gl = this.gl
        gl.useProgram(glShaders[EShader.Connection]);
        gl.uniformMatrix4fv(this.connectionVPLoc, false, this.camera.matViewProjection);
        gl.bindVertexArray(this.connectionVao);
        gl.drawArraysInstanced(gl.LINES, 0, 2, this.numConnectionsToDraw);
    }

    renderNodes() {
        let gl = this.gl
        gl.depthMask(true);
        gl.useProgram(glShaders[EShader.Icosa]);
        gl.uniformMatrix4fv(this.icosaVPLoc, false, this.camera.matViewProjection);
        gl.uniform4fv(this.paramsLoc, this.params);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.uniform1i(this.noiseTextureLoc, 0);
        gl.bindVertexArray(this.icosaVao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 60, this.istate.agraph_length);
    }

    public renderGl() {
        let elapsed = this.startTime - Date.now()
        this.params[0] = elapsed / 1000.0;
        this.renderWorldMap()
        if (this.drawConnections && this.connectionMode) {
            this.renderConnections()
        }
        this.renderNodes()
        if (this.colorMode != EColorMode.Random && this.displayGradient) {
            this.renderGradient();
        }
    }

    public renderPicker() {
        let gl = this.gl
        gl.useProgram(glShaders[EShader.Picker]);
        gl.uniformMatrix4fv(this.pickerVPLoc, false, this.camera.matViewProjection);
        gl.uniform4fv(this.pickerParamsLoc, this.params);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.uniform1i(this.pickerNoiseTextureLoc, 0);
        gl.bindVertexArray(this.pickerVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pickerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 60, this.istate.agraph_length);
    }
}

