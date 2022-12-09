
import { vec3, mat4 } from 'gl-matrix'
import { CWebGl } from "./webgl"
import { PCamera } from "camera"
import { CTabla } from './tabla'


export interface IGlobalInfo {
	useMsaa: boolean
	g: CWebGl
	sideTextureIndex: number
	canvas: HTMLCanvasElement
	theta: number

	tabla: CTabla
	npolys: number

	minCellDim: number
	cellsX: number
	cellsY: number
	dimX: number
	dimY: number
	thickness: number
	sideTextureScale: number
	bottomZ: number
	bounceZ: number
	ceilingZ: number
	panMillis: number
	panCoeff: number
	panCoeffX: number
	panCoeffY: number
	placingGroupId: number

	pcamera: PCamera

	cameraX: number
	cameraY: number
	cameraZ: number
	worldWidth: number
	worldHeight: number

	gl: WebGLRenderingContext
	matView: mat4
	matViewProjection: mat4
	matProjection: mat4
	matNormal: mat4
	lightDirection: vec3
	updateMc: boolean
	tapDuration: number
	isTouch: boolean
	oldGlBuffers: WebGLBuffer []
	countdown: number
}

let THICK = 12

export let a : IGlobalInfo= {
	useMsaa: true,
	g: null,

	sideTextureIndex: 2,
	canvas: null,
	theta: Math.PI / 2,
	tabla: null,
	npolys: 0,

	minCellDim: 0,
	cellsX: 0,
	cellsY: 0,
	dimX: 0,
	dimY: 0,
	thickness: THICK,
	sideTextureScale: 48,
	bottomZ: THICK/2,
	ceilingZ: THICK*3/2,
	bounceZ: THICK*5/2,
	panMillis: 500,
	panCoeff: 0.25,
	panCoeffX: 0,
	panCoeffY: 0,
	placingGroupId: -1,

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
	matNormal: null,
	lightDirection: null,
	updateMc: false,
	tapDuration: 250,
	isTouch: false,
	oldGlBuffers: [],
	countdown: 0
} 

