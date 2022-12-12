
import { EShader } from './core'
import { a } from './globals'
import { CMaterial } from './material'
import { glUniforms } from './uniforms'
import { glShaders } from './shaders'


export class CWebGl {
    shaderMaterials: CMaterial []

    public constructor() {
        this.shaderMaterials = new Array(EShader.Last)
    }

    public async initialize() {
        let gl = a.gl
        for (let i = 0; i < EShader.Last; i++) {
            console.log('create material ' + i)
            this.shaderMaterials[i] = new CMaterial(gl, glShaders[i], glUniforms[i])
        }
    }
}

