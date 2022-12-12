
import { a } from './globals'
import { EShader, IShader } from './core'

export var glShaders : WebGLProgram []


function createProgram(shader: IShader) : WebGLProgram {
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

const glslPhong : IShader = {
  vertex: `
precision highp float; 
attribute vec2 a_Position;
uniform mat4 modelview;
uniform mat4 projection;
uniform vec4 info;
uniform vec4 flip;
varying vec2 top_uv;
varying vec3 vertPos;
void main(){
  top_uv = vec2(a_Position.x/info.x * flip.x + flip.y, a_Position.y/info.y * flip.z + flip.w);
  vec4 vertPos4 = modelview * vec4(a_Position, info.z, 1.0);
  vertPos = vec3(vertPos4) / vertPos4.w;
  gl_Position = projection * modelview * vec4(a_Position.xy, info.z, 1.0);
}
`,
  fragment: `
precision highp float;
varying vec2 top_uv;
varying vec3 vertPos;
uniform mat4 modelview;
uniform sampler2D pieceTexture;
uniform sampler2D normalTexture;
uniform vec4 info;
uniform vec4 flip;
const vec4 ambientColor = vec4(0.0, 0.0, 0.0, 1.0);
const vec4 specularColor = vec4(1.0, 1.0, 1.0, 1.0);
const float shininess = 20.0;
const vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);
vec3 phongBRDF(vec3 lightDir, vec3 viewDir, vec3 normal, vec3 phongDiffuseCol, vec3 phongSpecularCol, float phongShininess) {
  vec3 color = phongDiffuseCol;
  vec3 reflectDir = reflect(-lightDir, normal);
  float specDot = max(dot(reflectDir, viewDir), 0.0);
  color += pow(specDot, phongShininess) * phongSpecularCol;
  return color;
}
void main() {
  vec3 lightDirection = vec3(1.0, -1.0, -7.0);
  vec4 diffuseColor = texture2D(pieceTexture, top_uv);
  vec3 lightDir = normalize(-lightDirection);
  vec3 viewDir = normalize(-vertPos);
  vec4 normalColor = texture2D(normalTexture, top_uv);
  normalColor = (normalColor * 2.0 * info.w) - (info.w);
  vec3 fin = vec3(modelview * vec4(normalColor.rgb, 0.0));
  vec3 n = normalize(fin);
  vec3 luminance = ambientColor.rgb;
  
  float illuminance = dot(lightDir, n);
  if(illuminance > 0.0) {
    vec3 brdf = phongBRDF(lightDir, viewDir, n, diffuseColor.rgb, specularColor.rgb, shininess);
    luminance += brdf * illuminance * lightColor.rgb;
  }
  gl_FragColor.rgb = luminance;
  gl_FragColor.a = 1.0;
}
`
}

const glslTabla : IShader = {
  vertex: `
precision highp float; 
attribute vec3 a_Position;
uniform mat4 mvp;
uniform vec4 info;
varying vec2 top_uv;
varying vec3 tabla_pos;
void main(){
  top_uv = vec2(a_Position.x/350.0, a_Position.y/350.0);
  tabla_pos = a_Position;
  gl_Position = mvp * vec4(a_Position, 1.0);
}
`,
  fragment: `
precision highp float;
varying vec2 top_uv;
varying vec3 tabla_pos;
uniform vec3 cameraPos;
uniform sampler2D tablaTexture;
uniform samplerCube cieloTexture;
void main() {
    vec3 normal = vec3(0.0, 0.0, 1.0);
    vec3 I = normalize(tabla_pos - cameraPos);
    vec3 R = reflect(I, normal);
    vec3 RR = vec3(R.x,R.z,-R.y);
    vec4 skyColor = textureCube(cieloTexture, RR);
    gl_FragColor = texture2D(tablaTexture, top_uv) * 0.7 + skyColor * 0.3;
    //gl_FragColor = texture2D(tablaTexture, top_uv);
}
`
}

const glslBasic : IShader = {
  vertex: `
precision highp float;
attribute vec2 a_Position;
uniform mat4 mvp;
uniform vec4 info;
uniform vec4 flip;
varying vec2 top_uv;
varying vec3 vertPos;
void main(){
  top_uv = vec2(a_Position.x/info.x * flip.x + flip.y, a_Position.y/info.y * flip.z + flip.w);
  gl_Position = mvp * vec4(a_Position.xy, info.z, 1.0);
}
`,
  fragment: `
precision highp float;
varying vec2 top_uv;
uniform sampler2D pieceTexture;
void main() {
  gl_FragColor = texture2D(pieceTexture, top_uv);
  gl_FragColor.a = 1.0;
}
`
}

  const glslTop : IShader = {
    vertex: `
  attribute vec2 a_Position;
  uniform mat4 model;
  uniform mat4 vp;
  uniform vec4 info;
  void main(){
    vec4 purePosition = model * vec4(a_Position.xy, info.z, 1.0);
    vec3 newpos = vec3(purePosition.x - purePosition.z * 0.7, purePosition.y - purePosition.z * 0.5, 0.0);
    gl_Position = vp * vec4(newpos.xyz, 1.0);
  }
  `,
    fragment: `
  precision highp float;
  void main() {
        gl_FragColor = vec4(0.15, 0.15, 0.15, 1.0);
  }
  `
  }

let glslSrc : IShader [] = [
    glslBasic,
    glslPhong,
    glslTabla,
    glslTop,
]
