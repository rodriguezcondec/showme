
import { mat4 } from 'gl-matrix'
import { PCamera } from "camera"
import { CWorld } from './world'


export interface IGlobalInfo {
    world: CWorld
    canvas: HTMLCanvasElement
    pcamera: PCamera
    cameraX: number
    cameraY: number
    cameraZ: number
    worldWidth: number
    worldHeight: number
    gl: WebGL2RenderingContext
    matView: mat4
    matViewProjection: mat4
    matProjection: mat4
    timeNode: Text,
    fpsNode: Text,
    ipNode: Text,
    betweennessNode: Text,
    closenessNode: Text,
    connectionsNode: Text,
    latitudeNode: Text,
    longitudeNode: Text,
    cityNode: Text,
    countryNode: Text,
}

export let a : IGlobalInfo= {
    canvas: null,
    pcamera: null,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
    worldWidth: 0,
    worldHeight: 0,
    gl: null,
    matView: null,
    matProjection: null,
    matViewProjection: null,
    world: null,
    timeNode: null,
    fpsNode: null,
    latitudeNode: null,
    longitudeNode: null,
    cityNode: null,
    countryNode: null,
    ipNode: null,
    betweennessNode: null,
    closenessNode: null,
    connectionsNode: null
} 

