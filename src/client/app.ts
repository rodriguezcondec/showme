import { initShadersGl } from './shaders'
import { IState, EColorMode, INITIAL_CAMERA_Z } from './core'
import { CMousekeyCtlr } from './mousekeyctlr'
import { CWorld } from './world'
import { PCamera } from './camera'
import { EKeyId, IKeyAction } from './core'
import { zoomLogToScale } from './util'

export class CApp {
    private mousekey: CMousekeyCtlr
    private initialized: boolean;
    private startTime: number;
    private lastTime: number;
    private iter: number;
    public gl: WebGL2RenderingContext;
    private canvas: HTMLCanvasElement
    public camera: PCamera;
    private world: CWorld;

    public actions: IKeyAction [];
    private velPanX: number;
    private velPanY: number;
    private velZoom: number;
    private zoomLogarithm: number;
    private lastUpdateTime: number;
    public mouseIsOut: boolean;


    public constructor(canvas: HTMLCanvasElement, handle: FileSystemFileHandle) {
        this.canvas = canvas
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        console.log('Use WebGL')
        this.gl = canvas.getContext("webgl2");
        if (!this.gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }

        let self = this
        handle.getFile().then( async (file: File) => {
            const contents = await file.text();
                let istate = <IState>JSON.parse(contents)
                    await self.init(istate)
            });

        this.startTime = Date.now()/1000
        this.lastTime = 0
        this.iter = 0
        this.lastUpdateTime = Date.now();
        this.velPanX = 0;
        this.velPanY = 0;
        this.velZoom = 0;
        this.mouseIsOut = true;
        this.actions = new Array();
    }

    async init(state: IState) {
        console.log('init: state ', state);
        this.camera = new PCamera(0, 0, INITIAL_CAMERA_Z, this.canvas);
        this.initialize();
        this.initializeWebGl(this.gl);
        this.world = new CWorld(state, this.gl, this.canvas, this.camera);
        await this.world.initialize();
        this.initialized = true;
        this.mousekey = new CMousekeyCtlr(this);
    }

    async initializeWebGl(gl: WebGL2RenderingContext) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clearStencil(0.0);
            gl.enable(gl.DEPTH_TEST);
            gl.frontFace(gl.CW);
            gl.cullFace(gl.BACK);
            gl.enable(gl.CULL_FACE);
            gl.lineWidth(4.0);
            initShadersGl(gl);
        }

    private updateFps() {
        this.iter++
        if (this.iter % 15 == 0) {
            let now = Date.now();
            let delta = now - this.lastTime;
            this.lastTime = now;
            let fps = 1000*15/delta;
            this.world.fpsNode.nodeValue = fps.toFixed(6);
        }
    }

    public renderGl() {
        this.updateFps();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.world.timeNode.nodeValue = (Date.now()/1000 - this.startTime).toFixed(2);
        if (this.world) {
            this.update();
            this.world.renderGl();
        }
    }

    public render() {
        if (!this.initialized) {
            return;
        }
        if (this.gl) {
            this.renderGl();
        }
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

    onAction(isDown: boolean, id: EKeyId) {
        if (isDown) {
            if (id == EKeyId.ToggleConnection && this.world) {
                this.world.connectionMode = !this.world.connectionMode;
            }
            if (id == EKeyId.ToggleCommand && this.world) {
                this.world.displayCommand = !this.world.displayCommand;
                console.log('displayCommand now ', this.world.displayCommand);
                document.getElementById("instructions").style.visibility = this.world.displayCommand ? "visible" : "hidden";
            }
            if (id == EKeyId.ToggleFps && this.world) {
                this.world.displayFps = !this.world.displayFps;
                document.getElementById("overlayLeft").style.visibility = this.world.displayFps ? "visible" : "hidden";
            }
            if (id == EKeyId.ToggleGradient && this.world) {
                this.world.displayGradient = !this.world.displayGradient;
                document.getElementById("gradient").style.visibility = this.world.displayGradient ? "visible" : "hidden";

            }
            if (id == EKeyId.ColorMode && this.world) {
                this.world.cycleColorMode();
            }
            let action: IKeyAction = {
                id: id,
                timestamp: Date.now(),
                acceleration: 0,
                velocity: 0
            };
            this.actions.push(action);
        } else {
            this.actions = this.actions.filter(function(action, index, arr){ 
                return action.id != id;
            });
        }
    }

    public handleClickRelease(x: number, y: number) {
    }

    public handleClick(x: number, y: number) {
        this.world.handleClick(x-0.5, y-0.5)
    }

    private updateActions(delta: number) {
        // reach maximum velocity in 200 ms
        const ACC = 2.5;
        const MAXVEL = 0.7;
        let accelX: number = 0;
        let accelY: number = 0;
        let accelZ: number = 0;
        if (this.actions.length) {
            for (let action of this.actions) {
                switch (action.id) {
                    case EKeyId.ArrowLeft:
                        accelX = -ACC * delta / 1500;
                        this.velPanX += accelX;
                        if (this.velPanX < -MAXVEL) {
                            this.velPanX = -MAXVEL;
                        }
                        break
                    case EKeyId.ArrowRight:
                        accelX = ACC * delta / 1500;
                        this.velPanX += accelX;
                        if (this.velPanX > MAXVEL) {
                            this.velPanX = MAXVEL;
                        }
                        break
                    case EKeyId.ArrowDown:
                        accelY = ACC * delta / 1500;
                        this.velPanY += accelY;
                        if (this.velPanY > MAXVEL) {
                            this.velPanY = MAXVEL;
                        }
                        break
                    case EKeyId.ArrowUp:
                        accelY = -ACC * delta / 1500;
                        this.velPanY += accelY;
                        if (this.velPanY < -MAXVEL) {
                            this.velPanY = -MAXVEL;
                        }
                        break
                    case EKeyId.ZoomIn:
                        accelZ = -ACC * delta / 1000;
                        this.velZoom += accelZ;
                        if (this.velZoom < -MAXVEL) {
                            this.velZoom = -MAXVEL;
                        }
                        break
                    case EKeyId.ZoomOut:
                        accelZ = ACC * delta / 1000;
                        this.velZoom += accelZ;
                        if (this.velZoom > MAXVEL) {
                            this.velZoom = MAXVEL;
                        }
                        break
                }
            }
        }

        // if no acceleration, apply deacceleration to any current velocities
        if (accelX == 0 && this.velPanX != 0) {
            accelX = ACC * 2 * delta / 1000;
            if (this.velPanX > 0) {
                this.velPanX -= accelX;
                if (this.velPanX < 0) {
                    this.velPanX = 0;
                } 
            } else {
                this.velPanX += accelX;
                if (this.velPanX > 0) {
                    this.velPanX = 0;
                } 
            }
        }

        if (accelY == 0 && this.velPanY != 0) {
            accelY = ACC * 2 * delta / 1000;
            if (this.velPanY > 0) {
                this.velPanY -= accelY;
                if (this.velPanY < 0) {
                    this.velPanY = 0;
                } 
            } else {
                this.velPanY += accelY;
                if (this.velPanY > 0) {
                    this.velPanY = 0;
                } 
            }
        } 

        if (accelZ == 0 && this.velZoom != 0) {
            accelZ = ACC * 2 * delta / 1000;
            if (this.velZoom > 0) {
                this.velZoom -= accelZ;
                if (this.velZoom < 0) {
                    this.velZoom = 0;
                } 
            } else {
                this.velZoom += accelZ;
                if (this.velZoom > 0) {
                    this.velZoom = 0;
                } 
            }
        }

        // apply pan velocity
        if (this.velPanX || this.velPanY) {
            let dimen : number = (this.camera.worldWidth > this.camera.worldHeight) ? this.camera.worldWidth : this.camera.worldHeight;
            let dx = this.velPanX * delta / 1000 * dimen;
            let dy = this.velPanY * delta / 1000 * dimen;
            this.camera.x += dx;
            this.camera.y -= dy;
            this.camera.update();
        }

        // apply zoom velocity
        if (this.velZoom) {
            let dz = this.velZoom * delta / 1000
            this.zoomLogarithm += dz
            if (this.zoomLogarithm > 8.14786) {
                this.zoomLogarithm = 8.14786;
                this.velZoom = 0;
            }
            if (this.zoomLogarithm < 3.158883) {
                this.zoomLogarithm = 3.158883;
                this.velZoom = 0;
            }
            this.camera.nodeScale = zoomLogToScale(this.zoomLogarithm);
            this.camera.z = Math.exp(this.zoomLogarithm)
            // console.log(`Z ${this.camera.z}, log ${this.zoomLogarithm}, nodeScale ${this.camera.nodeScale}`)
            this.camera.update()
        }
    }

    public update() {
        let time = Date.now()
        let delta = time - this.lastUpdateTime
        this.lastUpdateTime = time
        this.updateActions(delta)
        this.camera.update()
        this.world.update()
    }

    public async initialize() {
        this.zoomLogarithm = Math.log(INITIAL_CAMERA_Z);
        this.camera.nodeScale = zoomLogToScale(this.zoomLogarithm);
        this.camera.update();
    }

}

