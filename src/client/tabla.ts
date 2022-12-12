
import { vec3, vec4, mat4 } from 'gl-matrix'
import { a } from './globals'
import { loadTexture, align8 } from './util'
import { EShader, EUniform } from './core'




export class CTabla {

    texturesDir: string
    texturesNames: string []
    cubeMapNames: string []
    private positions: Float32Array
    private indices: Uint16Array
    uniformWhtx: vec4
    uniformCameraPos: vec4
    
    texturesGl: WebGLTexture []
    verticesGl: WebGLBuffer
    indicesGl: WebGLBuffer
    cieloTextureGl: WebGLTexture

    tablaIndex: number
    matMVP: mat4
    width: number
    height: number

    public constructor() {
        this.uniformWhtx = vec4.fromValues(1, 1, 10000, -1)
        this.uniformCameraPos = vec4.create()
        this.texturesDir = 'data/tabla/'
        this.texturesNames = [
            'tilesColor'
        ]
        this.cubeMapNames = [
            'posx',
            'negx',
            'posy',
            'negy',
            'posz',
            'negz'
        ]
        this.tablaIndex = 2
        this.matMVP = mat4.create()
    }

    private async initializeGl(gl: WebGL2RenderingContext) {
        await this.loadTexturesGl()
        await this.loadCieloGl('data/cielo/Beach/')
    }

    private async initializeGeometryGl(gl: WebGL2RenderingContext) {
        this.verticesGl = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesGl);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
        this.indicesGl = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGl);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    }

    public async initializeGeometry(width: number, height: number) {
        this.width = width
        this.height = height
        console.log('initializeGeometry width ' + width)
        console.log('initializeGeometry height ' + height)
        let z = 0
        this.uniformWhtx = vec4.fromValues(width, height, 10000, -1)
        let vertices: number [] = [
            -width/2.0,  height/2.0, z,
            width/2.0,  height/2.0, z,
            -width/2.0, -height/2.0, z,
            width/2.0, -height/2.0, z,
        ]
        let indices: number [] = [ 0, 1, 2, 2, 1, 3 ];
        this.positions = new Float32Array(vertices)
        this.indices = new Uint16Array(indices)
        await this.initializeGeometryGl(a.gl)
    }

    public async initialize() {
            await this.initializeGl(a.gl)
    }

    private async loadCieloGl(dir: string) {
        let gl = a.gl
        this.cieloTextureGl = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cieloTextureGl);

        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
  

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        for (let i = 0; i < 6; i++) {
            let filename = dir + this.cubeMapNames[i] + '.jpg'
            const image = new Image();
            image.src = filename;
            await image.decode();
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, level, internalFormat,
                    srcFormat, srcType, image);
        }
    }

    private async loadTexturesGl() {
        this.texturesGl = new Array(this.texturesNames.length)
        let n: number = 0
        for (let name of this.texturesNames) {
            let filename = this.texturesDir + name + '.jpg'
            let t : WebGLTexture = await loadTexture(a.gl, filename)
            this.texturesGl[n] = t
            n++
        }
   }

    public setTablaIndex(tablaName: string)  {
        let n: number = 0
        for (let name of this.texturesNames) {
            if (tablaName == name) {
                this.tablaIndex = n
                return
            }
            n++
        }
    }

    public async renderGl() {
        this.updateMatrix()
        let gl = a.gl
        gl.useProgram(a.gl2.shaderMaterials[EShader.Tabla].program)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesGl)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGl);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texturesGl[this.tablaIndex]);
        gl.uniform1i(a.gl2.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.PieceTexture].location, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cieloTextureGl);
        gl.uniform1i(a.gl2.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.NormalTexture].location, 1);

        gl.uniform4fv(a.gl2.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.Info].location, this.uniformWhtx);
        gl.uniformMatrix4fv(a.gl2.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.Mvp].location, false, this.matMVP);
        gl.uniform3fv(a.gl2.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.Flip].location, vec3.fromValues(a.cameraX, a.cameraY, a.cameraZ));

        var a_Position = gl.getAttribLocation(a.gl2.shaderMaterials[EShader.Tabla].program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);            
    }

    public updateMatrix() {
        mat4.multiply(this.matMVP, a.matProjection, a.matView)
    }
}