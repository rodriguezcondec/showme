
import { vec2, vec3, vec4 } from 'gl-matrix'

export function idToColor(id: number) : vec4 {
    let blue = (id % 64) * 4 + 2
    let green = Math.floor(id / 64) * 4 + 2
    let red = 192
    let result = vec4.fromValues(red/255, green/255, blue/255, 1)
    return result
}

export function channelToColor(channel: number) : vec4 {
    let blue = ((channel & 1) != 0) ? 1 : 0
    let green = ((channel & 2) != 0) ? 1 : 0
    let red = ((channel & 4) != 0) ? 1 : 0
    let result = vec4.fromValues(red, green, blue, 1)
    return result
}

export function randomColor() : vec4 {
    let blue = Math.random()
    let green = Math.random()
    let red = Math.random()
    let result = vec4.fromValues(red, green, blue, 1)
    return result
}

export function align8(a: number) : number {
    let result = ((a + 15 ) & 0xfffffff0)
    return result
}

export function colorToId(color: number) : number {
    if (!color) {
        return -1
    }
    let g = (color >> 8) & 255;
    let b = color & 255;
    let blue = Math.floor(b / 4)
    let green = Math.floor(g / 4)
    let id = green * 64 + blue
    return id
}


export function getNormal3( p1 : vec2, p2 : vec2, p3 : vec2 ) : vec3
{
    // find average of two vectors
    let dx1 = p2[0] - p1[0];
    let dy1 = p2[1] - p1[1];
    let dx2 = p3[0] - p2[0];
    let dy2 = p3[1] - p2[1];
    let dx = (dx1+dx2)/2;
    let dy = (dy1+dy2)/2;

    // normal is just -y, 0, x
    let result  = vec3.create()
    return vec3.normalize(result, vec3.fromValues(-dy,dx,0))
}

export function getNormal2( p1 : vec2, p2 : vec2 )
{
    let dx = p2[0] - p1[0];
    let dy = p2[1] - p1[1];

    let result  = vec3.create()
    return vec3.normalize(result, vec3.fromValues(-dy,dx,0))
}


export function distance( x1: number, y1: number, x2: number, y2: number )
{
    let dx = x2-x1
    let dy = y2-y1
    return Math.sqrt(dx*dx+dy*dy)
}

export async function loadTexture(gl: WebGL2RenderingContext, url: string) : Promise<WebGLTexture> {

    console.log('loadTexture url ' + url)
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = url;
    await image.decode();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                srcFormat, srcType, image);

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    return texture;
}
  
export function createRandomTexture(gl: WebGL2RenderingContext, width: number, height: number) : WebGLTexture {
    const npixels = width * height;
    const data = new Uint8Array(npixels*4);
    let n = 0;
    for (let i = 0; i < npixels; i++) {
        data[n+0] = Math.floor(Math.random() * 256)
        data[n+1] = Math.floor(Math.random() * 256)
        data[n+2] = Math.floor(Math.random() * 256)
        data[n+3] = 255
        n += 4
    }
    console.log('data: ', data)
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}
