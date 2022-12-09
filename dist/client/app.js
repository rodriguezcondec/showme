var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CPuzzle } from './puzzle';
import { EKeyId } from './core';
import { a } from './globals';
import { mat4 } from 'gl-matrix';
import { initShadersGl } from './shaders';
import { CWebGl } from './webgl';
import { CTabla } from './tabla';
import { CMousekeyCtlr } from './mousekeyctlr';
export class CApp {
    constructor(canvas) {
        a.canvas = canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log('Use WebGL');
        a.gl = canvas.getContext("webgl");
        if (!a.gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }
        this.initializeWebGl(a.gl);
        a.matView = mat4.create();
        a.matProjection = mat4.create();
        a.matNormal = mat4.create();
        a.matViewProjection = mat4.create();
        this.initialized = true;
        this.mousekey = new CMousekeyCtlr(this);
    }
    handleDownEvent(from) {
        if (from == 'pan_left') {
            this.p.onAction(true, EKeyId.ArrowLeft);
        }
        else if (from == 'pan_right') {
            this.p.onAction(true, EKeyId.ArrowRight);
        }
        else if (from == 'pan_up') {
            this.p.onAction(true, EKeyId.ArrowUp);
        }
        else if (from == 'pan_down') {
            this.p.onAction(true, EKeyId.ArrowDown);
        }
        else if (from == 'zoom_in') {
            this.p.onAction(true, EKeyId.ZoomIn);
        }
        else if (from == 'zoom_out') {
            this.p.onAction(true, EKeyId.ZoomOut);
        }
    }
    handleUpEvent(from) {
        if (from == 'pan_left') {
            this.p.onAction(false, EKeyId.ArrowLeft);
        }
        else if (from == 'pan_right') {
            this.p.onAction(false, EKeyId.ArrowRight);
        }
        else if (from == 'pan_up') {
            this.p.onAction(false, EKeyId.ArrowUp);
        }
        else if (from == 'pan_down') {
            this.p.onAction(false, EKeyId.ArrowDown);
        }
        else if (from == 'zoom_in') {
            this.p.onAction(false, EKeyId.ZoomIn);
        }
        else if (from == 'zoom_out') {
            this.p.onAction(false, EKeyId.ZoomOut);
        }
    }
    appMouseDown(event, from) {
        console.log('appMouseDown: ' + from);
        this.handleDownEvent(from);
    }
    appMouseUp(event, from) {
        console.log('appMouseUp: ' + from);
        this.handleUpEvent(from);
    }
    appMouseOut(event, from) {
        console.log('appMouseOut: ' + from);
        this.handleUpEvent(from);
    }
    appTouchCancel(event, from) {
        console.log('appTouchCancel: ' + from);
        this.handleUpEvent(from);
    }
    appTouchEnd(event, from) {
        console.log('appTouchEnd: ' + from);
        this.handleUpEvent(from);
    }
    appTouchStart(event, from) {
        console.log('appTouchStart: ' + from);
        this.handleDownEvent(from);
    }
    readS3File(bucket, name) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`readS3File bucket ${bucket}, name ${name}`);
            const options = {
                method: 'POST',
                credential: 'include',
                // crossorigin: true,  
                mode: 'cors',
                headers: {
                    'Access-Control-Allow-Origin': 'http://192.168.0.14',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ bucket, name })
            };
            // asdf let response = await fetch(':3006/api/v1/image/asset', options);
            let response = yield fetch('http://192.168.0.14:3006/api/v1/image/asset', options);
            console.log('response: ');
            console.log(response);
        });
    }
    loadPuzzle(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('loadPuzzle ' + id);
            yield this.initPuzzle();
        });
    }
    loadId(id) {
        console.log('loadId: ' + id);
        if (this.p) {
            let temp = this.p;
            this.p = null;
            temp.release();
            temp = null;
        }
        this.loadPuzzle(id);
    }
    initializeWebGl(gl) {
        return __awaiter(this, void 0, void 0, function* () {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clearStencil(0.0);
            gl.enable(gl.DEPTH_TEST);
            gl.frontFace(gl.CW);
            gl.cullFace(gl.BACK);
            gl.enable(gl.CULL_FACE);
            initShadersGl();
            var ext = gl.getExtension('OES_element_index_uint');
            console.log('ext = ' + ext);
            a.tabla = new CTabla();
            yield a.tabla.initialize();
            a.g = new CWebGl();
            yield a.g.initialize();
            let id = window['puzzleId'];
            this.loadId(id);
        });
    }
    renderGl() {
        a.gl.clear(a.gl.COLOR_BUFFER_BIT | a.gl.DEPTH_BUFFER_BIT);
        if (this.p) {
            this.p.renderGl();
        }
    }
    render() {
        if (!this.initialized) {
            return;
        }
        if (a.gl) {
            this.renderGl();
        }
    }
    initPuzzle() {
        return __awaiter(this, void 0, void 0, function* () {
            let temp = new CPuzzle();
            yield temp.initialize();
            this.p = temp;
        });
    }
    readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState == 4 && rawFile.status == 200) {
                callback(rawFile.responseText);
            }
        };
        rawFile.send(null);
    }
}
