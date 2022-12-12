
import { EKeyId, IKeyAction } from './core'
import { a } from './globals';
import { PCamera } from './camera';

export class CShowme {
    public  gl: WebGL2RenderingContext
    private iter: number
    private lastTime: number
    public actions: IKeyAction []
    private velPanX: number
    private velPanY: number
    private velZoom: number
    private zoomLogarithm: number
    private lastUpdateTime: number
    public mouseIsOut: boolean

    public constructor() {
        this.actions = new Array()
        this.lastUpdateTime = Date.now()
        this.velPanX = 0
        this.velPanY = 0
        this.velZoom = 0
        this.mouseIsOut = true
        this.iter = 0
        this.lastTime = 0
    }
    

    onAction(isDown: boolean, id: EKeyId) {
        if (isDown) {
            let action: IKeyAction = {
                id: id,
                timestamp: Date.now(),
                acceleration: 0,
                velocity: 0
            }
            this.actions.push(action)
        } else {
            this.actions = this.actions.filter(function(action, index, arr){ 
                return action.id != id;
            });
        }
    }

    public handleClickRelease(x: number, y: number) {
    }

    public handleClick(x: number, y: number) {
    }

    private updateActions(delta: number) {
        // reach maximum velocity in 200 ms
        const ACC = 2.5
        const MAXVEL = 0.5
        let accelX: number = 0
        let accelY: number = 0
        let accelZ: number = 0
        let accelT: number = 0
        if (this.actions.length) {
            for (let action of this.actions) {
                switch (action.id) {
                    case EKeyId.ArrowLeft:
                        accelX = -ACC * delta / 1500;
                        this.velPanX += accelX
                        if (this.velPanX < -MAXVEL) {
                            this.velPanX = -MAXVEL
                        }
                        break
                    case EKeyId.ArrowRight:
                        accelX = ACC * delta / 1500;
                        this.velPanX += accelX
                        if (this.velPanX > MAXVEL) {
                            this.velPanX = MAXVEL
                        }
                        break
                    case EKeyId.ArrowDown:
                        accelY = ACC * delta / 1500;
                        this.velPanY += accelY
                        if (this.velPanY > MAXVEL) {
                            this.velPanY = MAXVEL
                        }
                        break
                    case EKeyId.ArrowUp:
                        accelY = -ACC * delta / 1500;
                        this.velPanY += accelY
                        if (this.velPanY < -MAXVEL) {
                            this.velPanY = -MAXVEL
                        }
                        break
                    case EKeyId.ZoomIn:
                        accelZ = -ACC * delta / 1000;
                        this.velZoom += accelZ
                        if (this.velZoom < -MAXVEL) {
                            this.velZoom = -MAXVEL
                        }
                        break
                    case EKeyId.ZoomOut:
                        accelZ = ACC * delta / 1000;
                        this.velZoom += accelZ
                        if (this.velZoom > MAXVEL) {
                            this.velZoom = MAXVEL
                        }
                        break
                }
            }
        }

        // if no acceleration, apply deacceleration to any current velocities
        if (accelX == 0 && this.velPanX != 0) {
            //console.log('do deacceleration')
            accelX = ACC * 2 * delta / 1000;
            if (this.velPanX > 0) {
                this.velPanX -= accelX;
                if (this.velPanX < 0) {
                    this.velPanX = 0
                } 
            } else {
                this.velPanX += accelX;
                if (this.velPanX > 0) {
                    this.velPanX = 0
                } 
            }
        }

        if (accelY == 0 && this.velPanY != 0) {
            accelY = ACC * 2 * delta / 1000;
            if (this.velPanY > 0) {
                this.velPanY -= accelY;
                if (this.velPanY < 0) {
                    this.velPanY = 0
                } 
            } else {
                this.velPanY += accelY;
                if (this.velPanY > 0) {
                    this.velPanY = 0
                } 
            }
        } 

        if (accelZ == 0 && this.velZoom != 0) {
            accelZ = ACC * 2 * delta / 1000;
            if (this.velZoom > 0) {
                this.velZoom -= accelZ;
                if (this.velZoom < 0) {
                    this.velZoom = 0
                } 
            } else {
                this.velZoom += accelZ;
                if (this.velZoom > 0) {
                    this.velZoom = 0
                } 
            }
        }

        // apply pan velocity
        if (this.velPanX || this.velPanY) {
            let dimen : number = (a.worldWidth > a.worldHeight) ? a.worldWidth : a.worldHeight
            let dx = this.velPanX * delta / 1000 * dimen
            let dy = this.velPanY * delta / 1000 * dimen
            a.cameraX += dx;
            a.cameraY -= dy;
            a.pcamera.update()
        }

        // apply zoom velocity
        if (this.velZoom) {
            let dz = this.velZoom * delta / 1000
            this.zoomLogarithm += dz
            a.cameraZ = Math.exp(this.zoomLogarithm)
            a.pcamera.update()
        }
    }

    private clampCamera() {
        if (a.cameraX < -a.tabla.width/2) {
            a.cameraX = -a.tabla.width/2
        }
        if (a.cameraX > a.tabla.width/2) {
            a.cameraX = a.tabla.width/2
        }
        if (a.cameraY < -a.tabla.height/2) {
            a.cameraY = -a.tabla.height/2
        }
        if (a.cameraY > a.tabla.height/2) {
            a.cameraY = a.tabla.height/2
        }
    }

    public update() {
        let time = Date.now()
        let delta = time - this.lastUpdateTime
        this.lastUpdateTime = time
        this.updateActions(delta)
        this.clampCamera()
        a.pcamera.update()
    }

    public async initialize() {
        a.cameraX = 0
        a.cameraY = 0
        a.cameraZ = 1200
        a.pcamera = new PCamera(a.cameraX, a.cameraY, a.cameraZ)
        this.zoomLogarithm = Math.log(a.cameraZ)
        await a.tabla.initializeGeometry(1024, 1024)
        await this.initializeGl(a.gl)
    }

    async initializeGl(gl: WebGL2RenderingContext) {
        this.gl = gl
    }

    public renderGl() {
        this.iter++
        if (this.iter % 60 == 0) {
            let now = Date.now()
            let delta = now - this.lastTime
            this.lastTime = now
        }

        this.update()

        if (a.tabla) {
            a.tabla.renderGl()
        }

    }

    public release() {
    }
}

