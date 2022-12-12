import { a } from './globals'
import { mat4, vec3 } from 'gl-matrix'

export class PCamera {
    private position: vec3
    private matrix: mat4
    private gpuAdjust: mat4
    private near: number
    private far: number
    private fovx: number
    public constructor(x: number, y: number, z: number) {
        this.position = vec3.create()
        this.gpuAdjust = mat4.fromValues(
            1, 0, 0,   0,
            0, 1, 0,   0,
            0, 0, 0.5, 0,
            0, 0, 0.5, 1
        )
        this.near = 3
        this.far = 6000
        a.cameraX = x
        a.cameraY = y
        a.cameraZ = z
        this.fovx = 60 * Math.PI / 180
        this.update()
    }

    public release() {
        this.position = null
        this.gpuAdjust = null
    }

    public update() : void {
        let aspect = a.canvas.width / a.canvas.height
        a.worldWidth = a.cameraZ * 1 / 0.886
        a.worldHeight = a.worldWidth / aspect

        mat4.perspective(a.matProjection, this.fovx / aspect, aspect, this.near, this.far)
        mat4.multiply(a.matProjection, this.gpuAdjust, a.matProjection)

        let rx = mat4.create()
        mat4.fromXRotation(rx, 0)
        let matWorld = mat4.create()
        mat4.translate(matWorld, matWorld, vec3.fromValues(a.cameraX, a.cameraY, a.cameraZ))
        mat4.multiply(matWorld, matWorld, rx)
        mat4.invert(a.matView, matWorld)
        mat4.multiply(a.matViewProjection, a.matProjection, a.matView)
    }
}   