import { EUniform } from './core';
import { a } from './globals';
import { CInstance } from './instance';
import { mat4, vec3, vec4 } from 'gl-matrix';
export class CGroup {
    constructor(igroup, isMc, isSub) {
        this.igroup = igroup;
        this.info = vec4.create();
        this.positionRadius = vec4.create();
        this.position = vec3.create();
        this.center = vec3.create();
        this.rotation = vec3.create();
        this.matWorld = mat4.create();
        this.matMV = mat4.create();
        this.matMVP = mat4.create();
        this.instances = new Array();
        for (let i of this.igroup.instances) {
            let instance = new CInstance(i, this, isMc, isSub);
            this.instances.push(instance);
        }
        //this.setCenterAndRadius()
    }
    release() {
        this.position = null;
        this.center = null;
        this.rotation = null;
        this.matWorld = null;
        this.matMV = null;
        this.matMVP = null;
        this.instances = null;
        this.igroup = null;
    }
    setRotationZ(z) {
        this.rotation[2] = z;
        this.updateMatrix();
    }
    setRotationX(x) {
        this.rotation[0] = x;
        this.updateMatrix();
    }
    getRotationZ() {
        return this.rotation[2];
    }
    getRotationX() {
        return this.rotation[0];
    }
    clampPosition() {
        if (this.position[0] < -a.tabla.width / 2) {
            this.position[0] = -a.tabla.width / 2;
        }
        if (this.position[0] > a.tabla.width / 2) {
            this.position[0] = a.tabla.width / 2;
        }
        if (this.position[1] < -a.tabla.height / 2) {
            this.position[1] = -a.tabla.height / 2;
        }
        if (this.position[1] > a.tabla.height / 2) {
            this.position[1] = a.tabla.height / 2;
        }
    }
    setPosition(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.clampPosition();
        this.igroup.position[0] = this.position[0];
        this.igroup.position[1] = this.position[1];
        this.updateMatrix();
    }
    updatePositionRadius(isSub) {
        this.positionRadius = vec4.fromValues(this.position[0], this.position[1], this.radius, isSub ? 1 : 0);
    }
    renderTopPhong(gl) {
        this.updateMatrix();
        for (let instance of this.instances) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, instance.piece.topIndexBuffer);
            gl.uniformMatrix4fv(a.g.topMaterial.uniforms.descs[EUniform.Mv].location, false, this.matMV);
            gl.uniformMatrix4fv(a.g.topMaterial.uniforms.descs[EUniform.Projection].location, false, a.matProjection);
            gl.drawElements(gl.TRIANGLES, instance.piece.topIndexLength, gl.UNSIGNED_INT, 0);
        }
    }
    renderTopVideo(gl, isMc) {
        this.updateMatrix();
        for (let instance of this.instances) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, instance.piece.topIndexBuffer);
            if (isMc) {
                //console.log('RTV EUniform.Color location ' + a.g.topMaterial.uniforms.descs[EUniform.Color].location)
                //console.log('RTV EUniform.ColorSat location ' + a.g.topMaterial.uniforms.descs[EUniform.ColorSat].location)
                gl.uniform4fv(a.g.topMaterial.uniforms.descs[EUniform.Color].location, instance.colorMask);
                gl.uniform4fv(a.g.topMaterial.uniforms.descs[EUniform.ColorSat].location, instance.colorSaturate);
            }
            gl.uniformMatrix4fv(a.g.topMaterial.uniforms.descs[EUniform.Mvp].location, false, this.matMVP);
            gl.drawElements(gl.TRIANGLES, instance.piece.topIndexLength, gl.UNSIGNED_INT, 0);
        }
    }
    setCenterAndRadius() {
        let minx = 1000000;
        let maxx = -1000000;
        let miny = 1000000;
        let maxy = -1000000;
        for (let instance of this.instances) {
            let ip = instance.piece.ipiece;
            if (ip.bo[0] < minx) {
                minx = ip.bo[0];
            }
            if (ip.bo[1] < miny) {
                miny = ip.bo[1];
            }
            if (ip.bo[2] > maxx) {
                maxx = ip.bo[2];
            }
            if (ip.bo[3] > maxy) {
                maxy = ip.bo[3];
            }
        }
        this.center = [
            (minx + maxx) / 2,
            (miny + maxy) / 2,
            0
        ];
        let dx = (maxx - minx) / 2;
        let dy = (maxy - miny) / 2;
        this.radius = Math.sqrt(dx * dx + dy * dy);
    }
    updateMatrix() {
        let rx = mat4.create();
        let rz = mat4.create();
        let t = mat4.create();
        mat4.identity(this.matWorld);
        mat4.translate(this.matWorld, this.matWorld, vec3.fromValues(-this.center[0], -this.center[1], 0));
        mat4.fromXRotation(rx, this.rotation[0]);
        mat4.fromZRotation(rz, this.rotation[2]);
        mat4.multiply(this.matWorld, rz, this.matWorld);
        mat4.multiply(this.matWorld, rx, this.matWorld);
        mat4.fromTranslation(t, this.position);
        mat4.multiply(this.matWorld, t, this.matWorld);
        mat4.multiply(this.matMV, a.matView, this.matWorld);
        mat4.multiply(this.matMVP, a.matProjection, this.matMV);
    }
}
