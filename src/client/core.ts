

export enum EShader {
	Basic = 0,
	Phong,
	Tabla,
	Top,
	Last
}

export enum EUniform {
	Info = 0,
	Mv,
	Mvp,
	PieceTexture,
	Projection,
	NormalTexture,
	Flip,
	Color,
	ColorSat
}


export enum EShaderMode {
	Basic = 'basic',
	Dem = 'dem',
	Multi = 'multi',
	Phong = 'phong',
}

export enum EMulti {
	None = 'none',
	Add = 'add',
	Sub = 'sub',
}

export enum EFlipType {
	None = 0,
	X,
	Y,
	Both
}

export interface ICamera {
	position: [number, number, number]
}
export interface IShader {
	vertex: string
	fragment: string
}
export interface IEdgeInfo {
	id: number
	dir: number
	adj: number
	distanceStart: number
	distanceEnd: number

}
export interface IPiece {
	pid: number
	nedges: number
	npolys: number
	bo: [number, number, number, number]
	edgeinfo: IEdgeInfo []
	edgepolys: IEdgePoly []
	contourDistance: number
}
export interface IEdgePoly {
	eid: number
	indices: [number, number, number]
	pl: number[]
}

export interface IInstance {
	iid: number
	pid: number
	channel: number
}

export interface IVideo {
	name: string
	width: number
	height: number
	x: number
	y: number
	cropx: number
	cropy: number
}

export interface IGroup {
	gid: number
	instances: IInstance []
	flipped: boolean
	zstep: number
	position: [number, number, number]
}


export interface IMetadata {
	puzzlename: string
	puzzledescription: string
	thumbnail: string
	numberOfPieces: number
}


export enum EKeyId {
	ArrowLeft = 'left',
	ArrowRight = 'right',
	ArrowUp = 'up',
	ArrowDown = 'down',
	ZoomIn = 'in',
	ZoomOut = 'out',
}

export enum EEdgeFlag {
	left = 1,
	right = 2,
	top = 4,
	bottom = 8,
}


export interface IKeyAction {
	id: EKeyId
	timestamp: number;
	acceleration: number;
	velocity: number
}

export interface ISwipePanInfo {
	startX: number
	startY: number
	startCameraX: number;
	startCameraY: number;
	cameraDestX: number
	cameraDestY: number
}

