import { CPuzzle } from './puzzle'
import { EKeyId } from './core'
import { a } from './globals'
import { mat4 } from 'gl-matrix'
import { PCamera } from "camera"
import { initShadersGl } from './shaders'
import { CWebGl } from './webgl'
import { CTabla } from './tabla'
import { CMousekeyCtlr } from './mousekeyctlr'


export class CApp {
	public p: CPuzzle;
	public camera: PCamera
	public  gl: any
	private initialized: boolean
	private mousekey: CMousekeyCtlr

	private handleDownEvent(from: string) {
		if (from == 'pan_left') {
			this.p.onAction(true, EKeyId.ArrowLeft)
		} else if (from == 'pan_right') {
			this.p.onAction(true, EKeyId.ArrowRight)
		} else if (from == 'pan_up') {
			this.p.onAction(true, EKeyId.ArrowUp)
		} else if (from == 'pan_down') {
			this.p.onAction(true, EKeyId.ArrowDown)
		} else if (from == 'zoom_in') {
			this.p.onAction(true, EKeyId.ZoomIn)
		} else if (from == 'zoom_out') {
			this.p.onAction(true, EKeyId.ZoomOut)
		} 
	}
	private handleUpEvent(from: string) {
		if (from == 'pan_left') {
			this.p.onAction(false, EKeyId.ArrowLeft)
		} else if (from == 'pan_right') {
			this.p.onAction(false, EKeyId.ArrowRight)
		} else if (from == 'pan_up') {
			this.p.onAction(false, EKeyId.ArrowUp)
		} else if (from == 'pan_down') {
			this.p.onAction(false, EKeyId.ArrowDown)
		} else if (from == 'zoom_in') {
			this.p.onAction(false, EKeyId.ZoomIn)
		} else if (from == 'zoom_out') {
			this.p.onAction(false, EKeyId.ZoomOut)
		}
	}

	public appMouseDown(event: MouseEvent, from: string) {
		console.log('appMouseDown: ' + from)
		this.handleDownEvent(from)
	}

	public appMouseUp(event: MouseEvent, from: string) {
		console.log('appMouseUp: ' + from)
		this.handleUpEvent(from)
	}

	public appMouseOut(event: MouseEvent, from: string) {
		console.log('appMouseOut: ' + from)
		this.handleUpEvent(from)
	}

	public appTouchCancel(event: TouchEvent, from: string) {
		console.log('appTouchCancel: ' + from)
		this.handleUpEvent(from)
	}

	public appTouchEnd(event: TouchEvent, from: string) {
		console.log('appTouchEnd: ' + from)
		this.handleUpEvent(from)
	}

	public appTouchStart(event: TouchEvent, from: string) {
		console.log('appTouchStart: ' + from)
		this.handleDownEvent(from)
	}




public constructor(canvas: HTMLCanvasElement) {
    a.canvas = canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
        console.log('Use WebGL')
        a.gl = canvas.getContext("webgl");
        if (!a.gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }
        this.initializeWebGl(a.gl)
        a.matView = mat4.create()
        a.matProjection = mat4.create()
        a.matNormal = mat4.create()
        a.matViewProjection = mat4.create()

        this.initialized = true

		this.mousekey = new CMousekeyCtlr(this)
		
	}

    public async readS3File(bucket: string, name: string)  {
        console.log(`readS3File bucket ${bucket}, name ${name}`)

        const options : any = {
            method: 'POST',

            credential: 'include',  
            // crossorigin: true,  

            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': 'http://192.168.0.14',
                'content-type': 'application/json'
            },
            body: JSON.stringify({bucket, name})
          };
    
        // asdf let response = await fetch(':3006/api/v1/image/asset', options);
        let response = await fetch('http://192.168.0.14:3006/api/v1/image/asset', options);
        console.log('response: ')
        console.log(response)
    }

	public async loadPuzzle(id: string) {
		console.log('loadPuzzle ' + id)
		await this.initPuzzle()
	}
	public loadId(id: string) {
		console.log('loadId: ' + id)
		if (this.p) {
			let temp = this.p
			this.p = null
			temp.release()
			temp = null
		}
		this.loadPuzzle(id)
	}


async initializeWebGl(gl: WebGLRenderingContext) {
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
 
		a.g = new CWebGl()
		await a.g.initialize()
		let id: string = window['puzzleId'];
		this.loadId(id)
	}

	public renderGl() {
		a.gl.clear(a.gl.COLOR_BUFFER_BIT | a.gl.DEPTH_BUFFER_BIT);
		if (this.p) {
			this.p.renderGl()
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

	async initPuzzle() {
		let temp = new CPuzzle()
		await temp.initialize()
		this.p = temp
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

