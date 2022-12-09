var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EKeyId } from './core';
import { a } from './globals';
import { PCamera } from './camera';
export class CPuzzle {
    constructor() {
        this.actions = new Array();
        this.selectedGroupId = -1;
        a.placingGroupId = -1;
        this.lastUpdateTime = Date.now();
        this.velPanX = 0;
        this.velPanY = 0;
        this.velZoom = 0;
        this.inDrag = false;
        this.mouseIsOut = true;
        this.iter = 0;
        this.lastTime = 0;
    }
    onAction(isDown, id) {
        if (isDown) {
            console.log('add action ' + id);
            let action = {
                id: id,
                timestamp: Date.now(),
                acceleration: 0,
                velocity: 0
            };
            this.actions.push(action);
        }
        else {
            console.log('remove action ' + id);
            this.actions = this.actions.filter(function (action, index, arr) {
                if (action.id == id) {
                    let duration = Date.now() - action.timestamp;
                    //console.log('...duration ' + duration)
                }
                return action.id != id;
            });
        }
    }
    handleClickRelease(x, y) {
    }
    handleClick(x, y) {
    }
    deselectGroup(doCancel) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    updateActions(delta) {
        // reach maximum velocity in 200 ms
        const ACC = 2.5;
        const MAXVEL = 0.5;
        let accelX = 0;
        let accelY = 0;
        let accelZ = 0;
        let accelT = 0;
        if (this.actions.length) {
            //console.log('updateActions')
            for (let action of this.actions) {
                //console.log('action.id ' + action.id)
                switch (action.id) {
                    case EKeyId.ArrowLeft:
                        accelX = -ACC * delta / 1500;
                        this.velPanX += accelX;
                        if (this.velPanX < -MAXVEL) {
                            this.velPanX = -MAXVEL;
                        }
                        break;
                    case EKeyId.ArrowRight:
                        accelX = ACC * delta / 1500;
                        this.velPanX += accelX;
                        if (this.velPanX > MAXVEL) {
                            this.velPanX = MAXVEL;
                        }
                        break;
                    case EKeyId.ArrowDown:
                        accelY = ACC * delta / 1500;
                        this.velPanY += accelY;
                        if (this.velPanY > MAXVEL) {
                            this.velPanY = MAXVEL;
                        }
                        break;
                    case EKeyId.ArrowUp:
                        accelY = -ACC * delta / 1500;
                        this.velPanY += accelY;
                        if (this.velPanY < -MAXVEL) {
                            this.velPanY = -MAXVEL;
                        }
                        break;
                    case EKeyId.ZoomIn:
                        accelZ = -ACC * delta / 1000;
                        this.velZoom += accelZ;
                        if (this.velZoom < -MAXVEL) {
                            this.velZoom = -MAXVEL;
                        }
                        break;
                    case EKeyId.ZoomOut:
                        accelZ = ACC * delta / 1000;
                        this.velZoom += accelZ;
                        if (this.velZoom > MAXVEL) {
                            this.velZoom = MAXVEL;
                        }
                        break;
                }
            }
        }
        if (!this.inSwipe) {
            // if no acceleration, apply deacceleration to any current velocities
            if (accelX == 0 && this.velPanX != 0) {
                //console.log('do deacceleration')
                accelX = ACC * 2 * delta / 1000;
                if (this.velPanX > 0) {
                    this.velPanX -= accelX;
                    if (this.velPanX < 0) {
                        this.velPanX = 0;
                    }
                }
                else {
                    this.velPanX += accelX;
                    if (this.velPanX > 0) {
                        this.velPanX = 0;
                    }
                }
            }
            if (accelY == 0 && this.velPanY != 0) {
                //console.log('do deacceleration')
                accelY = ACC * 2 * delta / 1000;
                if (this.velPanY > 0) {
                    this.velPanY -= accelY;
                    if (this.velPanY < 0) {
                        this.velPanY = 0;
                    }
                }
                else {
                    this.velPanY += accelY;
                    if (this.velPanY > 0) {
                        this.velPanY = 0;
                    }
                }
            }
        }
        else {
            let gummiband = 8;
            a.cameraX += (this.swipePanInfo.cameraDestX - a.cameraX) / gummiband;
            a.cameraY += (this.swipePanInfo.cameraDestY - a.cameraY) / gummiband;
            a.pcamera.update();
        }
        if (accelZ == 0 && this.velZoom != 0) {
            //console.log('do deacceleration')
            accelZ = ACC * 2 * delta / 1000;
            if (this.velZoom > 0) {
                this.velZoom -= accelZ;
                if (this.velZoom < 0) {
                    this.velZoom = 0;
                }
            }
            else {
                this.velZoom += accelZ;
                if (this.velZoom > 0) {
                    this.velZoom = 0;
                }
            }
        }
        // apply pan velocity
        if (this.velPanX || this.velPanY) {
            let dimen = (a.worldWidth > a.worldHeight) ? a.worldWidth : a.worldHeight;
            let dx = this.velPanX * delta / 1000 * dimen;
            let dy = this.velPanY * delta / 1000 * dimen;
            a.cameraX += dx;
            a.cameraY -= dy;
            a.pcamera.update();
        }
        // apply zoom velocity
        if (this.velZoom) {
            let dz = this.velZoom * delta / 1000;
            this.zoomLogarithm += dz;
            a.cameraZ = Math.exp(this.zoomLogarithm);
            a.pcamera.update();
        }
    }
    clampCamera() {
        if (a.cameraX < -a.tabla.width / 2) {
            a.cameraX = -a.tabla.width / 2;
        }
        if (a.cameraX > a.tabla.width / 2) {
            a.cameraX = a.tabla.width / 2;
        }
        if (a.cameraY < -a.tabla.height / 2) {
            a.cameraY = -a.tabla.height / 2;
        }
        if (a.cameraY > a.tabla.height / 2) {
            a.cameraY = a.tabla.height / 2;
        }
    }
    update() {
        a.theta -= 0.01;
        let time = Date.now();
        let delta = time - this.lastUpdateTime;
        this.lastUpdateTime = time;
        if (a.countdown) {
            a.countdown--;
            if (!a.countdown) {
                if (a.oldGlBuffers.length) {
                    for (let buffer of a.oldGlBuffers) {
                        console.log('delete a buffer---------------------');
                        a.gl.deleteBuffer(buffer);
                    }
                    a.oldGlBuffers = [];
                }
            }
        }
        this.updateActions(delta);
        this.clampCamera();
        a.pcamera.update();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            a.cameraX = 0;
            a.cameraY = 0;
            a.cameraZ = 1200;
            a.pcamera = new PCamera(a.cameraX, a.cameraY, a.cameraZ);
            this.zoomLogarithm = Math.log(a.cameraZ);
            yield a.tabla.initializeGeometry(1024, 1024);
            a.tabla.setTablaIndex('tilesColor');
            yield this.initializeGl(a.gl);
        });
    }
    initializeGl(gl) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gl = gl;
        });
    }
    renderGl() {
        this.iter++;
        if (this.iter % 60 == 0) {
            let now = Date.now();
            let delta = now - this.lastTime;
            this.lastTime = now;
        }
        this.update();
        if (a.tabla) {
            a.tabla.renderGl();
        }
    }
    release() {
    }
}
