import { mat4, vec3 } from 'gl-matrix';
export class CMesh {
    constructor() {
        this.position = vec3.create();
        this.modelViewMatrix = mat4.create();
    }
    setPosition(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
    }
}
