import { mat4, vec3, vec4 } from 'gl-matrix';
import { a } from './globals';
import { EShader } from './core';
export class CCollision {
    constructor(gl, settings) {
        this.gl = gl;
        this.renderTarget = null;
        this.textureWidth = a.collisionSize;
        this.textureHeight = a.collisionSize;
        this.collisionBuffer = new Uint32Array(this.textureWidth * this.textureHeight);
        this.settings = settings;
        this.initialize(gl);
    }
    initialize(gl) {
        // Create a texture to render to
        this.renderTarget = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.renderTarget);
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, this.textureWidth, this.textureHeight, border, format, type, data);
        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.renderTarget, level);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    render(gl, groups, pieceId, stitchId) {
        gl.disable(gl.CULL_FACE);
        var a_Position = gl.getAttribLocation(a.g.shaderMaterials[EShader.Picker].program, 'a_Position');
        if (this.settings.dem) {
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 24, 0);
        }
        else {
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 8, 0);
        }
        gl.enableVertexAttribArray(a_Position);
        let red = vec4.fromValues(1, 0, 0, 1);
        let blue = vec4.fromValues(0, 0, 1, 1);
        let info = vec4.fromValues(a.dimX, a.dimY, a.thickness / 2, 1.0);
        for (let group of groups) {
            let color = group.pickerColor;
            if (group.igroup.gid != stitchId) {
                if (group.igroup.gid == pieceId) {
                    group.pickerColor = red;
                }
                else {
                    group.pickerColor = blue;
                }
                group.updateMatrix();
                group.renderPicker(gl, info);
                group.pickerColor = color;
            }
        }
        gl.enable(gl.CULL_FACE);
    }
    isCollision(groups, pieceId, stitchId, pos, radius) {
        let gl = this.gl;
        // render to our targetTexture by binding the framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
        // render cube with our 3x2 texture
        gl.bindTexture(gl.TEXTURE_2D, this.renderTarget);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, this.textureWidth, this.textureHeight);
        // Clear the attachment(s).
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        let proj = mat4.create();
        let view = mat4.create();
        mat4.ortho(proj, -radius, radius, -radius, radius, 10, 100000);
        let matWorld = mat4.create();
        mat4.translate(matWorld, matWorld, vec3.fromValues(pos[0], pos[1], 20000));
        mat4.invert(view, matWorld);
        let oldProj = a.matProjection;
        let oldView = a.matView;
        a.matProjection = proj;
        a.matView = view;
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.ONE, gl.ONE);
        this.gl.useProgram(a.g.shaderMaterials[EShader.Picker].program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, a.topPosBuffer);
        this.render(this.gl, groups, pieceId, stitchId);
        let result = this.readTarget(gl);
        a.matProjection = oldProj;
        a.matView = oldView;
        gl.blendFunc(gl.ONE, gl.ZERO);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        let n = this.textureWidth * this.textureHeight;
        for (let i = 0; i < n; i++) {
            if (this.collisionBuffer[i] == 0xffff00ff) {
                return true;
            }
        }
        return false;
    }
    readTarget(gl) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.renderTarget);
        let pixelBuffer = new Uint8Array(this.collisionBuffer.buffer);
        gl.readPixels(0, 0, this.textureWidth, this.textureHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer);
        /*var canvas: HTMLCanvasElement = document.querySelector("#auxcan");
        let ctx = canvas.getContext("2d");
        var imgData = ctx.createImageData(this.textureWidth, this.textureHeight);
        let i : number
        for (i = 0; i < pixelBuffer.length; i++) {
            imgData.data[i] = pixelBuffer[i];// red
        }
        ctx.putImageData(imgData, 0, 0, 0, 0, this.textureWidth, this.textureHeight);*/
    }
}
