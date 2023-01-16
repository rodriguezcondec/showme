/// <reference path="../../node_modules/@webgpu/types/dist/index.d.ts" />

import { IState } from './core'
import { CNode } from './node'
import { vec2, vec3, vec4, mat4 } from 'gl-matrix'
import { initIcosa } from './icosa'
import { glShaders } from './shaders';


const NODE_TRANSFORM_SIZE: number = 20;


export class CWorld {
	public istate: IState
	public nodes: CNode []
	public  gl: WebGL2RenderingContext
	private iter: number

	public topTexture: WebGLTexture
	public inDrag: boolean
	public inTap: boolean
	public inDragStartTime: number
	public mouseIsOut: boolean
	public inSwipe: boolean
	public inTouchX: number
	public inTouchY: number
	public inTouchTime: number
	private buttonBarPosition: string
	private showVideoButton: boolean
	private lastTime: number
    private icosaGeometry: WebGLBuffer
    private transformBuffer: WebGLBuffer
    private transformData: Float32Array
    private vao: WebGLVertexArrayObject
    public viewLoc: WebGLUniformLocation;
    public projectionLoc: WebGLUniformLocation;

	public constructor(istate: IState, gl: WebGL2RenderingContext) {
		this.istate = istate;
        this.gl = gl;
		this.inDrag = false
		this.mouseIsOut = true
		this.buttonBarPosition = 'left'
		this.showVideoButton = false
        this.iter = 0;
        this.lastTime = 0;
        this.nodes = new Array();
	}



	// private createDrawList() {
	// 	this.setTableBounds();
	// 	this.drawlist = new Array()
	// 	for ( let group of this.groups ) {
	// 		if (group.position[0] + group.radius < this.minX) {
	// 			continue
	// 		}
	// 		if (group.position[0] - group.radius > this.maxX) {
	// 			continue
	// 		}
	// 		if (group.position[1] + group.radius < this.minY) {
	// 			continue
	// 		}
	// 		if (group.position[1] - group.radius > this.maxY) {
	// 			continue
	// 		}
	// 		this.drawlist.push(group)
	// 	}
	// 	if (this.listsize != this.drawlist.length) {
	// 		this.listsize = this.drawlist.length
	// 		console.log('this.listsize = ' + this.listsize)
	// 	}
	// }

	// private clampCamera() {
	// 	if (a.cameraX < -a.tabla.width/2) {
	// 		a.cameraX = -a.tabla.width/2
	// 	}
	// 	if (a.cameraX > a.tabla.width/2) {
	// 		a.cameraX = a.tabla.width/2
	// 	}
	// 	if (a.cameraY < -a.tabla.height/2) {
	// 		a.cameraY = -a.tabla.height/2
	// 	}
	// 	if (a.cameraY > a.tabla.height/2) {
	// 		a.cameraY = a.tabla.height/2
	// 	}
	// }

	public update() {
        let n = 1000
        for (let node of this.nodes) {
            node.incRotationY(2 * Math.PI / 180 * n / 4000)
            node.updateMatrix()
            n++
        }
        this.setTransformData()
	}

    private initTransformData() {
        let gl = this.gl
        this.transformData = new Float32Array(this.istate.agraphlen * NODE_TRANSFORM_SIZE);
        let n: number = 0;
        for (let node of this.nodes) {
            for (let i = 0; i < 4; i++ ) {
                this.transformData[n++] = node.color[i]
            }
            for (let i = 0; i < 16; i++ ) {
                this.transformData[n++] = node.matWorld[i]
            }
        }
        console.log('initTransformData: len ', this.transformData.length)
        this.transformBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
    }

    private setTransformData() {
        let gl = this.gl
        let n: number = 0;
        for (let node of this.nodes) {
            for (let i = 0; i < 4; i++ ) {
                this.transformData[n++] = node.color[i]
            }
            for (let i = 0; i < 16; i++ ) {
                this.transformData[n++] = node.matWorld[i]
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
    }

	public async initialize() {
        console.log('world::initialize, num nodes: ' + this.istate.agraphlen);
        // create nodes, initialize position
        // x: bits 32-47
        // y: bits 16-31
        // x: bits 0-15
        for (let inode of this.istate.nodes) {
            let node = new CNode(inode)
            this.nodes.push(node);
  
        }

        let gl = this.gl;

        const positionLoc = gl.getAttribLocation(glShaders[0], 'a_position');
        const colorLoc = gl.getAttribLocation(glShaders[0], 'a_color');
        const modelLoc = gl.getAttribLocation(glShaders[0], 'a_model');
        // const centroidLoc = gl.getAttribLocation(glShaders[0], 'a_centroid');
        const normalLoc = gl.getAttribLocation(glShaders[0], 'a_normal');
        this.viewLoc = gl.getUniformLocation(glShaders[0], 'u_view');
        this.projectionLoc = gl.getUniformLocation(glShaders[0], 'u_projection');
        console.log('positionLoc ', positionLoc)
        console.log('modelLoc ', modelLoc)
        console.log('colorLoc ', colorLoc)
        console.log('normalLoc ', normalLoc)

        this.icosaGeometry = initIcosa(gl)

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.initTransformData();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 16);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 32);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 48);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 64);
        gl.enableVertexAttribArray(5);
        gl.vertexAttribPointer(5, 4, gl.FLOAT, false, NODE_TRANSFORM_SIZE*4, 0);

        gl.vertexAttribDivisor(0,1);
        gl.vertexAttribDivisor(1,1);
        gl.vertexAttribDivisor(2,1);
        gl.vertexAttribDivisor(3,1);
        gl.vertexAttribDivisor(5,1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.icosaGeometry);
        // positions
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 24, 0);
        // normals
        gl.enableVertexAttribArray(6);
        gl.vertexAttribPointer(6, 3, gl.FLOAT, false, 24, 12);
        // centroids
        // gl.enableVertexAttribArray(6);
        // gl.vertexAttribPointer(6, 3, gl.FLOAT, false, 36, 24);
        // gl.enableVertexAttribArray(1);
        // gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);


        // gl.vertexAttribDivisor(6,1);
		// a.cameraX = this.istate.camera.position[0]
		// a.cameraY = this.istate.camera.position[1]
		// a.cameraZ = this.istate.camera.position[2]
		// a.pcamera = new PCamera(a.cameraX, a.cameraY, a.cameraZ, this.istate.camera.tilt)
		// this.zoomLogarithm = Math.log(a.cameraZ)
		// this.positions = new Float32Array(this.ipuzzle.coords)
		// this.keyFrameEngine = new CKeyFrameEngine(this)
		
		// let t : ITabla = this.ipuzzle.tabla
		// let halfw = Math.abs(t.minx) > Math.abs(t.maxx) ? Math.abs(t.minx) : Math.abs(t.maxx)
		// let halfh = Math.abs(t.miny) > Math.abs(t.maxy) ? Math.abs(t.miny) : Math.abs(t.maxy)
		// let fudge = 1.6
		// await a.tabla.initializeGeometry(halfw*2/50*fudge, halfh*2/50*fudge)
		// a.tabla.setTablaIndex(this.istate.tabla)

		// if (this.ipuzzle.video) {
		// 	this.setVideoButton('play', true)
		// 	this.video = this.setupVideo(this.ipuzzle.video);
		// 	if (a.gl) {
		// 		this.initVideoTexture(a.gl);
		// 	}
		// } 

		// if (a.gpu) {
		// 	await this.initializeGpu()
		// } else {
		// 	await this.initializeGl(a.gl)
		// }

		// this.pieces = new Array()
		// for (let ipiece of this.ipuzzle.pieces) {
		// 	let piece : CPiece = new CPiece(ipiece)
		// 	this.pieces.push(piece)
		// 	piece.createMeshes(this.ipuzzle, this.istate)	
		// }

		// this.groups = new Array()
		// let isMc: boolean = this.ipuzzle.multi != EMulti.None
		// let isSub: boolean = this.ipuzzle.multi == EMulti.Sub
		// for (let igroup of this.istate.groups) {
		// 	let group : CGroup = new CGroup(igroup, isMc, isSub)
		// 	for (let instance of group.instances) {
		// 		instance.piece = this.getPiece(instance.iinstance.pid)
		// 	}
		// 	this.groups.push(group)
		// 	group.position = [group.igroup.position[0], group.igroup.position[1], a.bottomZ]
		// 	group.rotation[2] = group.igroup.zstep * Math.PI / 2
		// 	if (group.igroup.flipped) {
		// 		group.rotation[0] = Math.PI
		// 	} else {
		// 		group.rotation[0] = 0
		// 	}
		// 	group.updateMatrix()
		// }
		// for (let group of this.groups) {
		// 	group.setCenterAndRadius();
		// }
	}

	async initializeGl(gl: WebGL2RenderingContext) {
		this.gl = gl

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
		// 	var a_Normal = gl.getAttribLocation(a.g.topMaterial.program, 'a_Normal');
		// 	if(a_Normal < 0) {
		// 	  console.log('Failed to get the storage location of a_Normal');
		// 	  return -1;
		// 	} 
		
		// 	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 24, 0);
		// 	gl.enableVertexAttribArray(a_Position);
		// 	gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 24, 12);
		// 	gl.enableVertexAttribArray(a_Normal);
		// } else {
		// 	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 8, 0);
		// 	gl.enableVertexAttribArray(a_Position);
		// }

	}


	public renderGl() {
		this.iter++
		if (this.iter % 60 == 0) {
			let now = Date.now()
			let delta = now - this.lastTime
			this.lastTime = now
		}

		// this.update()
		// let overlayExclusion: boolean
		let gl = this.gl

		// gl.depthMask(false)
		// if (a.tabla) {
		// 	a.tabla.renderGl()
		// }
		// gl.depthMask(true)
        //gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.STATIC_DRAW);
		//gl.useProgram(glShaders[0])
        gl.bindVertexArray(this.vao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 60, this.istate.agraphlen);

		// gl.useProgram(a.g.topMaterial.program)
		// gl.bindBuffer(gl.ARRAY_BUFFER, a.topPosBuffer)
		// gl.activeTexture(gl.TEXTURE0);
		// gl.bindTexture(gl.TEXTURE_2D, this.video ? this.videoTexture : this.topTexture);
		// gl.bindTexture(gl.TEXTURE_2D, this.video ? this.videoTexture : this.topTexture);
		// gl.uniform1i(a.g.topMaterial.uniforms.descs[EUniform.PieceTexture].location, 0);   

		// if (this.ipuzzle.shader == EShaderMode.Phong) {
		// 	gl.activeTexture(gl.TEXTURE1);
		// 	gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
		// 	gl.uniform1i(a.g.topMaterial.uniforms.descs[EUniform.NormalTexture].location, 1);   
		// }
		
		// /*if (this.ipuzzle.shader == EShaderMode.Dem) {
		// 	var a_Position = gl.getAttribLocation(a.g.topMaterial.program, 'a_Position');
		// 	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 24, 0);
		// 	gl.enableVertexAttribArray(a_Position);
		// 	var a_Normal = gl.getAttribLocation(a.g.topMaterial.program, 'a_Normal');
		// 	gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 24, 12);
		// 	gl.enableVertexAttribArray(a_Normal);
		// } else {*/

		// var a_Position = gl.getAttribLocation(a.g.topMaterial.program, 'a_Position');
		// gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 8, 0);
		// gl.enableVertexAttribArray(a_Position);

		// let isMc: boolean = this.ipuzzle.multi != EMulti.None

		// // Draw Tops for non-flipped
		// gl.uniform4fv(a.g.topMaterial.uniforms.descs[EUniform.Info].location, this.info);
		// gl.uniform4fv(a.g.topMaterial.uniforms.descs[EUniform.Flip].location, this.flip);
		// for ( let group of this.drawlist ) {
		// 	overlayExclusion = (isMc && this.selectedGroupId == group.igroup.gid)
		// 	if ((!group.igroup.flipped || group.isFlipping) && !overlayExclusion) {
		// 		this.ipuzzle.shader != EShaderMode.Phong ? group.renderTopVideo(gl, isMc) : group.renderTopPhong(gl)
		// 	}
		// }

		// // Draw Tops for flipped
		// gl.uniform4fv(a.g.topMaterial.uniforms.descs[EUniform.Info].location, this.backInfo);
		// gl.uniform4fv(a.g.topMaterial.uniforms.descs[EUniform.Flip].location, this.backFlip);
		// for ( let group of this.drawlist ) {
		// 	overlayExclusion = (isMc && this.selectedGroupId == group.igroup.gid)
		// 	if ((group.igroup.flipped || group.isFlipping) && !overlayExclusion) {
		// 		this.ipuzzle.shader != EShaderMode.Phong ? group.renderTopVideo(gl, isMc) : group.renderTopPhong(gl)
		// 	}
		// }	

		// if (this.selectedGroupId != -1) {
		// 	let group = this.getGroup(this.selectedGroupId)
		// 	if (isMc) {
		// 		gl.useProgram(a.g.shaderMaterials[EShader.Overlay].program)
		// 		gl.bindBuffer(gl.ARRAY_BUFFER, a.topPosBuffer)
		// 		gl.activeTexture(gl.TEXTURE0);
		// 		gl.bindTexture(gl.TEXTURE_2D, this.video ? this.videoTexture : this.topTexture);
		// 		gl.bindTexture(gl.TEXTURE_2D, this.video ? this.videoTexture : this.topTexture);
		// 		gl.uniform1i(a.g.shaderMaterials[EShader.Overlay].uniforms.descs[EUniform.PieceTexture].location, 0);   
	
		// 		gl.activeTexture(gl.TEXTURE1);
		// 		gl.bindTexture(gl.TEXTURE_2D, a.overlayGl.renderTarget);
		// 		gl.uniform1i(a.g.shaderMaterials[EShader.Overlay].uniforms.descs[EUniform.NormalTexture].location, 1);   
	
		// 		gl.uniformMatrix4fv(a.g.shaderMaterials[EShader.Overlay].uniforms.descs[EUniform.Mv].location, false, group.matWorld);
		// 		gl.uniform4fv(a.g.shaderMaterials[EShader.Overlay].uniforms.descs[EUniform.Projection].location, group.positionRadius);
		// 		gl.uniform4fv(a.g.shaderMaterials[EShader.Overlay].uniforms.descs[EUniform.Info].location, this.info);
		// 		gl.uniform4fv(a.g.shaderMaterials[EShader.Overlay].uniforms.descs[EUniform.Flip].location, this.flip);
		// 		group.renderAboveOverlay(gl)
		
		// 		gl.uniform4fv(a.g.shaderMaterials[EShader.Overlay].uniforms.descs[EUniform.Info].location, this.backInfo);
		// 		gl.uniform4fv(a.g.shaderMaterials[EShader.Overlay].uniforms.descs[EUniform.Flip].location, this.backFlip);
		// 		group.renderAboveOverlay(gl)
		// 	}

		// 	gl.useProgram(a.g.shaderMaterials[EShader.Top].program)
		// 	gl.bindBuffer(gl.ARRAY_BUFFER, a.topPosBuffer)
		// 	var a_Position = gl.getAttribLocation(a.g.shaderMaterials[EShader.Top].program, 'a_Position');
		// 	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 8, 0);
		// 	gl.enableVertexAttribArray(a_Position);
		// 	gl.uniformMatrix4fv(a.g.shaderMaterials[EShader.Top].uniforms.descs[EUniform.Mv].location, false, a.matViewProjection);
		// 	gl.uniformMatrix4fv(a.g.shaderMaterials[EShader.Top].uniforms.descs[EUniform.Projection].location, false, group.matWorld);
		// 	gl.uniform4fv(a.g.shaderMaterials[EShader.Top].uniforms.descs[EUniform.Info].location, group.igroup.flipped ? this.backInfo : this.info);
		// 	for ( let instance of group.instances ) {
		// 		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, instance.piece.topIndexBuffer);
		// 		gl.drawElements(gl.TRIANGLES, instance.piece.topIndexLength, gl.UNSIGNED_INT, 0);
		// 	}
		// } else if (a.placingGroupId != -1) {
		// 	let group = this.getGroup(a.placingGroupId)
		// 	gl.useProgram(a.g.shaderMaterials[EShader.Top].program)
		// 	gl.bindBuffer(gl.ARRAY_BUFFER, a.topPosBuffer)
		// 	var a_Position = gl.getAttribLocation(a.g.shaderMaterials[EShader.Top].program, 'a_Position');
		// 	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 8, 0);
		// 	gl.enableVertexAttribArray(a_Position);
		// 	gl.uniformMatrix4fv(a.g.shaderMaterials[EShader.Top].uniforms.descs[EUniform.Mv].location, false, a.matViewProjection);
		// 	gl.uniformMatrix4fv(a.g.shaderMaterials[EShader.Top].uniforms.descs[EUniform.Projection].location, false, group.matWorld);
		// 	gl.uniform4fv(a.g.shaderMaterials[EShader.Top].uniforms.descs[EUniform.Info].location, group.igroup.flipped ? this.backInfo : this.info);
		// 	for ( let instance of group.instances ) {
		// 		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, instance.piece.topIndexBuffer);
		// 		gl.drawElements(gl.TRIANGLES, instance.piece.topIndexLength, gl.UNSIGNED_INT, 0);
		// 	}
		// }


		// //gl.enable(gl.BLEND);
		// //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		// gl.useProgram(a.g.shaderMaterials[EShader.Shadow].program)
		// for ( let group of this.drawlist ) {
		// 	group.renderShadow(gl)
		// }
		// //gl.disable(gl.BLEND);

		// gl.enable(gl.CULL_FACE)
		// gl.useProgram(a.g.shaderMaterials[EShader.Side].program)
		// gl.activeTexture(gl.TEXTURE0);
		// gl.bindTexture(gl.TEXTURE_2D, a.tabla.texturesGl[a.sideTextureIndex]);
		// gl.uniform1i(a.g.shaderMaterials[EShader.Side].uniforms.descs[EUniform.PieceTexture].location, 0);
		// for ( let group of this.drawlist ) {
		// 	group.renderSide(gl)
		// }

	}

	public release() {
		// console.log('puzzle release')
		// for ( let group of this.groups ) {
		// 	console.log('puzzle release group')
		// 	for ( let instance of group.instances ) {
		// 		instance.release()
		// 		instance = null
		// 	}
		// 	group.release()
		// 	group = null
		// }			   
		// this.groups = null 
		// for ( let piece of this.pieces ) {
		// 	console.log('puzzle release piece')
		// 	piece.release()
		// 	piece = null
		// }
		// a.pcamera.release()
		// a.pcamera = null
		// this.pieces = null
		// if (a.gpu) {
		// 	console.log('puzzle release gpu')
		// 	a.w.topTextureGpu.destroy()
		// 	a.w.topTextureGpu = null
		// 	if (a.w.normalTextureGpu) {
		// 		a.w.normalTextureGpu.destroy()
		// 		a.w.normalTextureGpu = null
		// 	}
		// }
		// // release gpu resources, etc.
		// if (this.collision) {
		// 	this.collision.collisionBuffer = null
		// 	this.collision = null
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

