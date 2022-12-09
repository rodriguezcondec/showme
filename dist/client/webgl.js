var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EShader } from './core';
import { a } from './globals';
import { CMaterial } from './material';
import { glUniforms } from './uniforms';
import { glShaders } from './shaders';
export class CWebGl {
    constructor() {
        this.shaderMaterials = new Array(EShader.Last);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            let gl = a.gl;
            for (let i = 0; i < EShader.Last; i++) {
                console.log('create material ' + i);
                this.shaderMaterials[i] = new CMaterial(gl, glShaders[i], glUniforms[i]);
            }
        });
    }
}
