
import { a } from './globals'
import { EShader, IShader } from './core'

export var glShaders : WebGLProgram []


export function createProgram(shader: IShader) : WebGLProgram {
    let gl = a.gl
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, shader.vertex)
    gl.compileShader(vertexShader)
  
    var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    var compilationLog = gl.getShaderInfoLog(vertexShader);
  
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, shader.fragment)
    gl.compileShader(fragmentShader)
  
    compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    compilationLog = gl.getShaderInfoLog(fragmentShader);
  
    let program : WebGLProgram = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
  
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program
}

export function initShadersGl() {
    glShaders = new Array(EShader.Last)
    for (let i = 0; i < EShader.Last; i++) {
      glShaders[i] = createProgram(glslSrc[i])
    }
}


const glslIcosa : IShader = {
    vertex: `#version 300 es
  uniform mat4 u_viewProjection;
  uniform sampler2D u_noiseTexture;
  uniform vec4 u_params;
  in vec3 a_position;
  in vec3 a_normal;
  in vec4 a_color;
  in vec4 a_metadata;
  in mat4 a_model;
  out vec4 vColor;
  void main(){
    float secs = u_params.x * a_metadata.x * 0.000005;
    vec4 brownian = texture(u_noiseTexture, vec2(secs,0.5)) * 1.2;
    vec3 lightDirection = normalize(vec3(0.2, 0.2, -1.0));
    mat4 normalMatrix = inverse(a_model);
    normalMatrix = transpose(normalMatrix);
    vec3 transformedNormal = (normalMatrix * vec4(a_normal, 1.0)).xyz;
    float light = dot(transformedNormal, lightDirection);
    light = 0.3 + light * 0.7;
    vColor = vec4(a_color.r * light, a_color.g * light, a_color.b * light, 1.0);
    gl_Position = u_viewProjection * a_model * vec4(a_position + brownian.xyz, 1.0);
  }
  `,
    fragment: `#version 300 es
  precision highp float;
  in vec4 vColor;
  out vec4 fragColor;
  void main() {
    fragColor = vColor;
  }
  `
  }


  const glslPicker : IShader = {
    vertex: `#version 300 es
  uniform mat4 u_viewProjection;
  uniform sampler2D u_noiseTexture;
  uniform vec4 u_params;
  in vec3 a_position;
  in vec4 a_pickerColor;
  in vec4 a_metadata;
  in mat4 a_model;
  out vec4 vColor;
  void main(){
    float secs = u_params.x * a_metadata.x * 0.000005;
    vec4 brownian = texture(u_noiseTexture, vec2(secs,0.5)) * 1.2;
    vColor = a_pickerColor;
    gl_Position = u_viewProjection * a_model * vec4(a_position + brownian.xyz, 1.0);
  }
  `,
    fragment: `#version 300 es
  precision highp float;
  in vec4 vColor;
  out vec4 fragColor;
  void main() {
    fragColor = vColor;
  }
  `
  }


  const glslWorldMap : IShader = {
    vertex: `#version 300 es
  uniform mat4 u_viewProjection;
  in vec2 a_position;
  in vec2 a_uv;
  out vec2 vUv;

  void main(){
    vUv = a_uv;
    gl_Position = u_viewProjection * vec4(a_position, 0.0, 1.0);
  }
  `,
  fragment: `#version 300 es
  precision highp float;
  in vec2 vUv;
  uniform sampler2D u_worldMapTexture;
  out vec4 fragColor;
  void main() {
    float latitude = vUv.x - 0.5;
    float longitude = vUv.y - 0.5;
    float theta = asin(1.732050808*longitude);
    float x = latitude / cos(theta) + 0.5;
    vec2 transformedUv = vec2(x, vUv.y);
    if (transformedUv.x < 0.0 || transformedUv.x > 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        fragColor = texture(u_worldMapTexture, transformedUv);
    }
  }
  `
  }


let glslSrc : IShader [] = [
    glslIcosa,
    glslPicker,
    glslWorldMap
]
