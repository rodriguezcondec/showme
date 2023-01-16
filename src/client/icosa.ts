
const positions = [
    0.000000, -0.525731, 0.850651,
    0.850651, 0.000000, 0.525731,
    0.850651, 0.000000, -0.525731,
    -0.850651, 0.000000, -0.525731,
    -0.850651, 0.000000, 0.525731,
    -0.525731, 0.850651, 0.000000,
    0.525731, 0.850651, 0.000000,
    0.525731, -0.850651, 0.000000,
    -0.525731, -0.850651, 0.000000,
    0.000000, -0.525731, -0.850651,
    0.000000, 0.525731, -0.850651,
    0.000000, 0.525731, 0.850651,
]
const normals = [
    0.934172, 0.356822, 0.000000,
    0.934172, -0.356822, 0.000000,
    -0.934172, 0.356822, 0.000000,
    -0.934172, -0.356822, 0.000000,
    0.000000, 0.934172, 0.356822,
    0.000000, 0.934172, -0.356822,
    0.356822, 0.000000, -0.934172,
    -0.356822, 0.000000, -0.934172,
    0.000000, -0.934172, -0.356822,
    0.000000, -0.934172, 0.356822,
    0.356822, 0.000000, 0.934172,
    -0.356822, 0.000000, 0.934172,
    0.577350, 0.577350, -0.577350,
    0.577350, 0.577350, 0.577350,
    -0.577350, 0.577350, -0.577350,
    -0.577350, 0.577350, 0.577350,
    0.577350, -0.577350, -0.577350,
    0.577350, -0.577350, 0.577350,
    -0.577350, -0.577350, -0.577350,
    -0.577350, -0.577350, 0.577350,
]

// const centroids = [
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
//     0, 0, 0,
// ]
// 1..12, copied from OBJ file
const indices = [
    2, 3, 7,
    2, 8, 3,
    4, 5, 6,
    5, 4, 9,
    7, 6, 12,
    6, 7, 11,
    10, 11, 3,
    11, 10, 4,
    8,  9, 10,
    9, 8, 1,
    12, 1, 2,
    1, 12, 5,
    7, 3, 11,
    2, 7, 12,
    4, 6, 11,
    6, 5, 12,
    3, 8, 10,
    8, 2, 1,
    4, 10, 9,
    5, 9, 1
]

export function initIcosa(gl: WebGL2RenderingContext) : WebGLBuffer {
    console.log('initIcosa')

    let size = 20 * 3 * 6;
    let icosaData : Float32Array = new Float32Array(size)
    let i = 0;
    let scale = 5;
    // // compute centroids
    // for (let poly = 0; poly < 20; poly++) {
    //     // get indices
    //     let i1 = indices[poly*3 + 0] - 1
    //     let i2 = indices[poly*3 + 1] - 1
    //     let i3 = indices[poly*3 + 2] - 1
    //     // get positions for 3 vertices
    //     let x1 = positions[i1 + 0] * scale;
    //     let y1 = positions[i1 + 1] * scale;
    //     let z1 = positions[i1 + 2] * scale;
    //     let x2 = positions[i2 + 0] * scale;
    //     let y2 = positions[i2 + 1] * scale;
    //     let z2 = positions[i2 + 2] * scale;
    //     let x3 = positions[i3 + 0] * scale;
    //     let y3 = positions[i3 + 1] * scale;
    //     let z3 = positions[i3 + 2] * scale;
    //     centroids[poly*3 + 0] = (x1+x2+x3)/3
    //     centroids[poly*3 + 1] = (y1+y2+y3)/3
    //     centroids[poly*3 + 2] = (z1+z2+z3)/3
    // }
    for (let poly = 0; poly < 20; poly++) {
        for (let vert = 0; vert < 3; vert++) {
            let index = indices[poly*3 + vert] - 1
            // set vertex position
            icosaData[i++] = positions[index*3 + 0] * scale;
            icosaData[i++] = positions[index*3 + 1] * scale;
            icosaData[i++] = positions[index*3 + 2] * scale;
            // console.log('x: ',icosaData[i+0])
            // console.log('y: ',icosaData[i+1])
            // console.log('z: ',icosaData[i+2])
            // i += 3
            // // set normal, same for all face vertices
            icosaData[i++] = normals[poly*3 + 0];
            icosaData[i++] = normals[poly*3 + 1];
            icosaData[i++] = normals[poly*3 + 2];
            // icosaData[i++] = centroids[poly*3 + 0];
            // icosaData[i++] = centroids[poly*3 + 1];
            // icosaData[i++] = centroids[poly*3 + 2];
        }
    }

    console.log('done data init, gl: ', gl);
    let icosaBuffer : WebGLBuffer = gl.createBuffer()
    console.log('done 1')
    gl.bindBuffer(gl.ARRAY_BUFFER, icosaBuffer);
    console.log('done 2')
    gl.bufferData(gl.ARRAY_BUFFER, icosaData, gl.STATIC_DRAW);
    console.log('done 3')
    // gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    // gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    // gl.enableVertexAttribArray(0);
    // gl.enableVertexAttribArray(6);
    return icosaBuffer;

}

