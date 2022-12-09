import { colorToId } from './util';
import { a } from './globals';
import { vec4 } from 'gl-matrix';
import { EShader } from './core';
export class CPicker {
    constructor(settings) {
        this.gl = a.gl;
        this.renderTarget = null;
        this.pixelBuffer = new Uint8Array(4);
        this.textureWidth = a.pickerSize;
        this.textureHeight = a.pickerSize;
        this.settings = settings;
        this.initialize(this.gl);
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
    render(gl, groups, selected) {
        var a_Position = gl.getAttribLocation(a.g.shaderMaterials[EShader.Picker].program, 'a_Position');
        if (this.settings.dem) {
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 24, 0);
        }
        else {
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 8, 0);
        }
        //gl.vertexAttribPointer(a_Position, 2, gl.UNSIGNED_SHORT, false, 2*2, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.disable(gl.CULL_FACE);
        let info = vec4.fromValues(a.dimX, a.dimY, a.thickness / 2, 1.0);
        let backInfo = vec4.fromValues(a.dimX, a.dimY, -1.0 * a.thickness / 2, -1.0);
        for (let group of groups) {
            if (group != selected) {
                group.renderPicker(gl, group.igroup.flipped ? backInfo : info);
            }
        }
        if (selected) {
            selected.renderPicker(gl, selected.igroup.flipped ? backInfo : info);
        }
        gl.enable(gl.CULL_FACE);
    }
    pickGroup(groups, x, y, selected) {
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
        gl.bindTexture(gl.TEXTURE_2D, this.renderTarget);
        gl.viewport(0, 0, this.textureWidth, this.textureHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(a.g.shaderMaterials[EShader.Picker].program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, a.topPosBuffer);
        this.render(this.gl, groups, selected);
        let offsetX = Math.floor(x * a.pickerSize);
        let offsetY = Math.floor(y * a.pickerSize);
        this.readTarget(gl, offsetX, offsetY);
        const color = (this.pixelBuffer[0] << 16) |
            (this.pixelBuffer[1] << 8) |
            (this.pixelBuffer[2]);
        let id = colorToId(color);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        return id;
    }
    readTarget(gl, offsetX, offsetY) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.renderTarget);
        gl.readPixels(offsetX, offsetY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixelBuffer);
    }
}
