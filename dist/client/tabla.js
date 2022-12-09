var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { vec3, vec4, mat4 } from 'gl-matrix';
import { a } from './globals';
import { loadTexture } from './util';
import { EShader, EUniform } from './core';
export class CTabla {
    constructor() {
        //this.defaultWidth = 1200
        //this.defaultHeight = 1200
        // uniform: width, height, tile size, unused
        this.uniformWhtx = vec4.fromValues(1, 1, 10000, -1);
        this.uniformCameraPos = vec4.create();
        this.texturesDir = 'data/tabla/';
        this.texturesNames = [
            'tilesColor'
        ];
        this.cubeMapNames = [
            'posx',
            'negx',
            'posy',
            'negy',
            'posz',
            'negz'
        ];
        this.tablaIndex = 2;
        this.matMVP = mat4.create();
    }
    initializeGl(gl) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadTexturesGl();
            yield this.loadCieloGl('data/cielo/Beach/');
        });
    }
    initializeGeometryGl(gl) {
        return __awaiter(this, void 0, void 0, function* () {
            this.verticesGl = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesGl);
            gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
            this.indicesGl = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGl);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        });
    }
    initializeGeometry(width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            this.width = width;
            this.height = height;
            console.log('initializeGeometry width ' + width);
            console.log('initializeGeometry height ' + height);
            let z = 0;
            this.uniformWhtx = vec4.fromValues(width, height, 10000, -1);
            let vertices = [
                -width / 2.0, height / 2.0, z,
                width / 2.0, height / 2.0, z,
                -width / 2.0, -height / 2.0, z,
                width / 2.0, -height / 2.0, z,
            ];
            let indices = [0, 1, 2, 2, 1, 3];
            this.positions = new Float32Array(vertices);
            this.indices = new Uint16Array(indices);
            yield this.initializeGeometryGl(a.gl);
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeGl(a.gl);
        });
    }
    loadCieloGl(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            let gl = a.gl;
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
                let filename = dir + this.cubeMapNames[i] + '.jpg';
                const image = new Image();
                image.src = filename;
                yield image.decode();
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, level, internalFormat, srcFormat, srcType, image);
            }
        });
    }
    loadTexturesGl() {
        return __awaiter(this, void 0, void 0, function* () {
            this.texturesGl = new Array(this.texturesNames.length);
            let n = 0;
            for (let name of this.texturesNames) {
                let filename = this.texturesDir + name + '.jpg';
                let t = yield loadTexture(a.gl, filename);
                this.texturesGl[n] = t;
                n++;
            }
        });
    }
    setTablaIndex(tablaName) {
        let n = 0;
        for (let name of this.texturesNames) {
            if (tablaName == name) {
                this.tablaIndex = n;
                return;
            }
            n++;
        }
    }
    renderGl() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateMatrix();
            let gl = a.gl;
            gl.useProgram(a.g.shaderMaterials[EShader.Tabla].program);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesGl);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesGl);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texturesGl[this.tablaIndex]);
            gl.uniform1i(a.g.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.PieceTexture].location, 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cieloTextureGl);
            gl.uniform1i(a.g.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.NormalTexture].location, 1);
            gl.uniform4fv(a.g.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.Info].location, this.uniformWhtx);
            gl.uniformMatrix4fv(a.g.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.Mvp].location, false, this.matMVP);
            gl.uniform3fv(a.g.shaderMaterials[EShader.Tabla].uniforms.descs[EUniform.Flip].location, vec3.fromValues(a.cameraX, a.cameraY, a.cameraZ));
            var a_Position = gl.getAttribLocation(a.g.shaderMaterials[EShader.Tabla].program, 'a_Position');
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 12, 0);
            gl.enableVertexAttribArray(a_Position);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        });
    }
    cycleTexture() {
        this.tablaIndex++;
        if (this.tablaIndex >= this.texturesNames.length) {
            this.tablaIndex = 0;
        }
    }
    updateMatrix() {
        mat4.multiply(this.matMVP, a.matProjection, a.matView);
    }
}
