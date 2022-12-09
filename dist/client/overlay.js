import { mat4, vec4 } from 'gl-matrix';
import { a } from './globals';
import { EUniform } from './core';
export class COverlay {
    constructor() {
        this.gl = a.gl;
        this.renderTarget = null;
        this.textureWidth = a.collisionSize;
        this.textureHeight = a.collisionSize;
        this.matProjection = mat4.create();
        this.matView = mat4.create();
        this.initialize(a.gl);
    }
    updateOverlayGl(groups) {
        for (let group of groups) {
            group.updateOverlayUniformsGl(this.matProjection, this.matView);
        }
    }
    initForPuzzle(ipuzzle, flip, backflip) {
        this.flip = flip;
        this.backFlip = backflip;
        this.info = vec4.fromValues(a.dimX, a.dimY, a.thickness / 2, 1.0);
        this.backInfo = vec4.fromValues(a.dimX, a.dimY, -1.0 * a.thickness / 2, -1.0);
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
    render(groups, gid, isSub, texture) {
        this.updateOverlayGl(groups);
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
        gl.bindTexture(gl.TEXTURE_2D, this.renderTarget);
        gl.viewport(0, 0, this.textureWidth, this.textureHeight);
        isSub ? gl.clearColor(1.0, 1.0, 1.0, 1.0) : gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(a.g.topMaterial.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, a.topPosBuffer);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(a.g.topMaterial.uniforms.descs[EUniform.PieceTexture].location, 0);
        // set info and flip
        gl.uniform4fv(a.g.topMaterial.uniforms.descs[EUniform.Info].location, this.info);
        gl.uniform4fv(a.g.topMaterial.uniforms.descs[EUniform.Flip].location, this.flip);
        var a_Position = gl.getAttribLocation(a.g.topMaterial.program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 8, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.disable(gl.CULL_FACE);
        for (let group of groups) {
            if (group.igroup.gid != gid) {
                group.renderOverlay(gl);
            }
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.CULL_FACE);
        if (isSub) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
        }
    }
}
