import { CShowme } from './showme'
import { EKeyId } from './core'
import { a } from './globals'
import { mat4 } from 'gl-matrix'
import { PCamera } from "camera"
import { initShadersGl } from './shaders'
import { CWebGl } from './webgl'
import { CTabla } from './tabla'
import { CMousekeyCtlr } from './mousekeyctlr'


export class CApp {
    public showme: CShowme;
    public camera: PCamera
    public  gl: any
    private initialized: boolean
    private mousekey: CMousekeyCtlr




public constructor(canvas: HTMLCanvasElement) {
    a.canvas = canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
        console.log('Use WebGL')
        a.gl = canvas.getContext("webgl2");
        if (!a.gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }
        this.initializeWebGl(a.gl)
        a.matView = mat4.create()
        a.matProjection = mat4.create()
        a.matViewProjection = mat4.create()
        this.initialized = true
        this.mousekey = new CMousekeyCtlr(this)
   }

async initializeWebGl(gl: WebGL2RenderingContext) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clearDepth(1.0)
        gl.clearStencil(0.0)
        gl.enable(gl.DEPTH_TEST)
        gl.frontFace(gl.CW)
        gl.cullFace(gl.BACK)
        gl.enable(gl.CULL_FACE)

        initShadersGl()

        var ext = gl.getExtension('OES_element_index_uint');
        console.log('ext = ' + ext)

        a.tabla = new CTabla()
        await a.tabla.initialize()
 
        a.gl2 = new CWebGl()
        await a.gl2.initialize()
        await this.initShowme()

    }

    public renderGl() {
        a.gl.clear(a.gl.COLOR_BUFFER_BIT | a.gl.DEPTH_BUFFER_BIT);
        if (this.showme) {
            this.showme.renderGl()
        }
    }

    public render() {
        if (!this.initialized) {
            return
        }
        if (a.gl) {
            this.renderGl()
        }
    }

    async initShowme() {
        let temp = new CShowme()
        await temp.initialize()
        this.showme = temp
    }

    readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState == 4 && rawFile.status == 200) {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }
}

