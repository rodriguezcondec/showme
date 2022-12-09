export class CMaterial {
    constructor(gl, program, uniforms) {
        this.uniforms = uniforms;
        this.program = program;
        for (let desc of this.uniforms.descs) {
            if (desc.name) {
                desc.location = gl.getUniformLocation(this.program, desc.name);
                if (!desc.location) {
                    console.log('Failed to get the storage location of ' + desc.name);
                    //return;
                }
            }
        }
    }
}
