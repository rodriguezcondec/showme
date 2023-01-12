

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

export interface ICamera {
    position: [number, number, number]
}

export interface IShader {
    vertex: string
    fragment: string
}

export enum EKeyId {
    ArrowLeft = 'left',
    ArrowRight = 'right',
    ArrowUp = 'up',
    ArrowDown = 'down',
    ZoomIn = 'in',
    ZoomOut = 'out',
}

export interface IKeyAction {
    id: EKeyId
    timestamp: number;
    acceleration: number;
    velocity: number
}

export interface IState {
    agraphlen: number
    elapsed: number
    node_ids: string []
    betweenness: number []
    closeness: number []
    num_connections: number []
    min_betweenness: number
    max_betweenness: number
    min_closeness: number
    max_closeness: number
}
