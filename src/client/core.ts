

export enum EShader {
    Icosa = 0,
    Picker,
    WorldMap,
    Last
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

export interface INode {
    ip: string
    betweenness: number
    closeness: number
    num_connections: number
    geolocation: {
        ip: string
        country: string
        city: string
        latitude: number
        longitude: number
        timezone: string
        isp: string
    }
}

export interface IState {
    agraph_length: number
    elapsed: number
    nodes: INode []
    min_betweenness: number
    max_betweenness: number
    min_closeness: number
    max_closeness: number
}
