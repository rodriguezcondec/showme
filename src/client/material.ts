
export interface IUniformDesc {
    name: string
    location: WebGLUniformLocation
}

export interface IUniforms {
    descs: IUniformDesc []
}

export class CMaterial {
    public program: WebGLProgram
    public uniforms: IUniforms
    public constructor(gl: WebGL2RenderingContext, program: WebGLProgram, uniforms: IUniforms) {
        this.uniforms = uniforms
        this.program = program
        for (let desc of this.uniforms.descs) {
            if (desc.name) {
                desc.location = gl.getUniformLocation(this.program, desc.name);
                if (!desc.location) {
                    console.log('Failed to get the storage location of ' + desc.name);
                }
            }
        }
    }
}   