
const vertexData = [
    // top left
    -1800, 900,    0, 0,
    // bottom right
    1800, -900,    1, 1,
    // bottom left
    -1800, -900,   0, 1,
    // top left
    -1800, 900,    0, 0,
    // top right
    1800,  900,    1, 0,
    // bottom right
    1800, -900,    1, 1,
]


export function initWorldMap(gl: WebGL2RenderingContext) : WebGLBuffer {
    console.log('initWorldMap')

    let worldMapData : Float32Array = new Float32Array(vertexData)
    console.log('worldMapData len ', worldMapData.length);
    let worldMapBuffer : WebGLBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, worldMapBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, worldMapData, gl.STATIC_DRAW);
    return worldMapBuffer;

}

