var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EShader } from './core';
import { a } from './globals';
export var gpuModuleVertex;
export var gpuModuleFragment;
export function initShadersGpu() {
    return __awaiter(this, void 0, void 0, function* () {
        gpuModuleVertex = new Array(EShader.Last);
        gpuModuleFragment = new Array(EShader.Last);
        for (let i = 0; i < EShader.Last; i++) {
            gpuModuleVertex[i] = a.gpu.createShaderModule({
                code: wgslSrc[i].vertex
            });
            let info = yield gpuModuleVertex[i].compilationInfo();
            if (info.messages.length) {
                for (let m of info.messages) {
                    //console.log('		message: ' + m.message)
                    //console.log('		type: ' + m.type)
                    //console.log('		lineNum: ' + m.lineNum)
                    //console.log('		linePos: ' + m.linePos)
                }
            }
            gpuModuleFragment[i] = a.gpu.createShaderModule({
                code: wgslSrc[i].fragment
            });
            info = yield gpuModuleFragment[i].compilationInfo();
            if (info.messages.length) {
                for (let m of info.messages) {
                    //console.log('		message: ' + m.message)
                    //console.log('		type: ' + m.type)
                    //console.log('		lineNum: ' + m.lineNum)
                    //console.log('		linePos: ' + m.linePos)
                }
            }
        }
    });
}
export const wgslPhong = {
    vertex: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
		[[location(0)]] top_uv : vec2<f32>;
		[[location(1)]] vertPos : vec3<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;

	[[stage(vertex)]]
	fn main([[location(0)]] position : vec2<f32>) -> VOUTPUT {
		var voutput: VOUTPUT;
		voutput.top_uv = vec2<f32>(position.x/camera.info.x * camera.flip.x + camera.flip.y, position.y/camera.info.y * camera.flip.z + camera.flip.w);
		var vertPos4 : vec4<f32> = camera.viewMatrix * uniforms.modelMatrix * vec4<f32>(position, camera.info.z, 1.0);
		voutput.vertPos = vec3<f32>(vertPos4.x / vertPos4.w, vertPos4.y / vertPos4.w, vertPos4.z / vertPos4.w);
		voutput.Position = camera.viewProjectionMatrix * uniforms.modelMatrix * vec4<f32>(position, camera.info.z, 1.0);
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[group(1), binding(0)]] var mySampler: sampler;
	[[group(1), binding(1)]] var myTexture: texture_2d<f32>;
	[[group(1), binding(2)]] var normalTexture: texture_2d<f32>;
	let ambientColor : vec4<f32> = vec4<f32>(0.0, 0.0, 0.0, 1.0);
	let specularColor : vec4<f32> = vec4<f32>(1.0, 1.0, 1.0, 1.0);
	let shininess : f32 = 20.0;
	let lightColor : vec4<f32> = vec4<f32>(1.0, 1.0, 1.0, 1.0);

	fn phongBRDF(lightDir: vec3<f32>, viewDir: vec3<f32>, normal: vec3<f32>, phongDiffuseCol: vec3<f32>, phongSpecularCol: vec3<f32>, phongShininess: f32) -> vec3<f32> {
		var color: vec3<f32> = phongDiffuseCol;
		var reflectDir: vec3<f32> = reflect(-lightDir, normal);
		var specDot: f32 = max(dot(reflectDir, viewDir), 0.0);
		color = color + pow(specDot, phongShininess) * phongSpecularCol;
		return color;
	}
	
	[[stage(fragment)]]
	fn main(
		[[location(0)]] top_uv : vec2<f32>,
		[[location(1)]] vertPos : vec3<f32>
	) -> [[location(0)]] vec4<f32> {
		var lightDirection: vec3<f32> = vec3<f32>(1.0, -1.0, -7.0);
		var diffuseColor: vec4<f32> = textureSample(myTexture, mySampler, top_uv);
		var lightDir: vec3<f32> = normalize(-lightDirection);
		var viewDir: vec3<f32> = normalize(-vertPos);
		var normalColor: vec4<f32> = textureSample(normalTexture, mySampler, top_uv);;
		normalColor = (normalColor * 2.0 * camera.info.w);
		var temp: vec4<f32> = camera.viewMatrix * uniforms.modelMatrix * vec4<f32>(normalColor.r - (camera.info.w), normalColor.g - (camera.info.w), normalColor.b - (camera.info.w), 0.0); 
		var fin: vec3<f32> = temp.xyz;
		var n: vec3<f32> = normalize(fin);
		var luminance: vec3<f32> = ambientColor.rgb;
		var illuminance: f32 = dot(lightDir, n);
		if(illuminance > 0.0) {
			var brdf: vec3<f32> = phongBRDF(lightDir, viewDir, n, diffuseColor.rgb, specularColor.rgb, shininess);
			luminance = luminance + brdf * illuminance * lightColor.rgb;
		}
		var outColor: vec4<f32> = vec4<f32>(luminance, 1.0);
		return outColor;
	}
	`,
};
const wgslSide = {
    vertex: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
		[[location(0)]] top_uv : vec2<f32>;
		[[location(1)]] fin : vec3<f32>;
		[[location(2)]] vertPos : vec3<f32>;
	};

	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[stage(vertex)]]
	fn main( [[location(0)]] position : vec3<f32>,
				[[location(1)]] normal : vec3<f32>,
				[[location(2)]]	uv : vec2<f32> ) -> VOUTPUT{
		var voutput: VOUTPUT;
		voutput.top_uv = uv;
		var temp : vec4<f32> = camera.viewMatrix * uniforms.modelMatrix * vec4<f32>(normal, 0.0);
		voutput.fin = temp.xyz;
		var vertPos4 : vec4<f32> = camera.viewMatrix * uniforms.modelMatrix * vec4<f32>(position, 1.0);
		voutput.vertPos = vec3<f32>(vertPos4.x / vertPos4.w, vertPos4.y / vertPos4.w, vertPos4.z / vertPos4.w);
		voutput.Position = camera.viewProjectionMatrix * uniforms.modelMatrix * vec4<f32>(position.xyz, 1.0);
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[group(1), binding(0)]] var mySampler: sampler;
	[[group(1), binding(1)]] var myTexture: texture_2d<f32>;
	let ambientColor : vec4<f32> = vec4<f32>(0.0, 0.0, 0.0, 1.0);
	let specularColor : vec4<f32> = vec4<f32>(1.0, 1.0, 1.0, 1.0);
	let shininess : f32 = 20.0;
	let lightColor : vec4<f32> = vec4<f32>(1.0, 1.0, 1.0, 1.0);

	fn phongBRDF(lightDir: vec3<f32>, viewDir: vec3<f32>, normal: vec3<f32>, phongDiffuseCol: vec3<f32>, phongSpecularCol: vec3<f32>, phongShininess: f32) -> vec3<f32> {
		var color: vec3<f32> = phongDiffuseCol;
		var reflectDir: vec3<f32> = reflect(-lightDir, normal);
		var specDot: f32 = max(dot(reflectDir, viewDir), 0.0);
		color = color + pow(specDot, phongShininess) * phongSpecularCol;
		return color;
	}
	
	[[stage(fragment)]]
	fn main(
		[[location(0)]] top_uv : vec2<f32>,
		[[location(1)]] fin : vec3<f32>,
		[[location(2)]] vertPos : vec3<f32>
	) -> [[location(0)]] vec4<f32> {
		var lightDirection: vec3<f32> = vec3<f32>(1.0, -1.0, -7.0);
		var diffuseColor: vec4<f32> = textureSample(myTexture, mySampler, top_uv);

		var lightDir: vec3<f32> = normalize(-lightDirection);
		var viewDir: vec3<f32> = normalize(-vertPos);
		var n: vec3<f32> = normalize(fin);
	
		var luminance: vec3<f32> = ambientColor.rgb;
		
		var illuminance: f32 = dot(lightDir, n);
		if(illuminance > 0.0) {
			var brdf: vec3<f32> = phongBRDF(lightDir, viewDir, n, diffuseColor.rgb, specularColor.rgb, shininess);
			luminance = luminance + brdf * illuminance * lightColor.rgb;
		}
		var outColor: vec4<f32> = vec4<f32>(luminance * 0.5 + diffuseColor.rgb * 0.5, 1.0);
		return outColor;
	}
	`,
};
const wgslShadow = {
    vertex: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
	};

	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;

	[[stage(vertex)]]
	fn main([[location(0)]] position : vec3<f32>) -> VOUTPUT {
		var voutput: VOUTPUT;
		var purePosition: vec4<f32> = uniforms.modelMatrix * vec4<f32>(position.xyz, 1.0);
		var newpos: vec3<f32> =	vec3<f32>(purePosition.x - purePosition.z * 0.7, purePosition.y - purePosition.z * 0.5, 0.0);
		voutput.Position = camera.viewProjectionMatrix * vec4<f32>(newpos.xyz, 1.0);
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[group(1), binding(0)]] var mySampler: sampler;
	[[group(1), binding(1)]] var myTexture: texture_2d<f32>;
	[[stage(fragment)]]
	fn main() -> [[location(0)]] vec4<f32> {
		var outColor: vec4<f32> = vec4<f32>(0.0, 0.0, 0.0, 1.0);
		return outColor;
	}
	`,
};
const wgslTop = {
    vertex: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
	};

	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;

	[[stage(vertex)]]
	fn main([[location(0)]] position : vec2<f32>) -> VOUTPUT {
		var voutput: VOUTPUT;
		var purePosition: vec4<f32> = uniforms.modelMatrix * vec4<f32>(position.xy, camera.info.z, 1.0);
		var newpos: vec3<f32> =	vec3<f32>(purePosition.x - purePosition.z * 0.7, purePosition.y - purePosition.z * 0.5, 0.0);
		voutput.Position = camera.viewProjectionMatrix * vec4<f32>(newpos.xyz, 1.0);
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[stage(fragment)]]
	fn main() -> [[location(0)]] vec4<f32> {
		var outColor: vec4<f32> = vec4<f32>(0.0, 0.0, 0.0, 1.0);
		return outColor;
	}
	`,
};
const wgslPicker = {
    vertex: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;

	[[stage(vertex)]]
	fn main([[location(0)]] position : vec2<f32>) -> VOUTPUT {
		var voutput: VOUTPUT;
		voutput.Position = camera.viewProjectionMatrix * uniforms.modelMatrix * vec4<f32>(position, camera.info.z, 1.0);
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[stage(fragment)]]
	fn main() -> [[location(0)]] vec4<f32> {
		var outColor: vec4<f32> =	uniforms.color;
		return outColor;
	}
	`,
};
const wgslBasic = {
    vertex: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
		[[location(0)]] top_uv : vec2<f32>;
	};

	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;

	[[stage(vertex)]]
	fn main([[location(0)]] position : vec2<f32>) -> VOUTPUT {
		var voutput : VOUTPUT;
		voutput.top_uv = vec2<f32>(position.x/camera.info.x * camera.flip.x + camera.flip.y, position.y/camera.info.y * camera.flip.z + camera.flip.w);
		voutput.Position = camera.viewProjectionMatrix * uniforms.modelMatrix * vec4<f32>(position, camera.info.z, 1.0);
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[group(1), binding(0)]] var mySampler: sampler;
	[[group(1), binding(1)]] var myTexture: texture_2d<f32>;
	
	[[stage(fragment)]]
	fn main([[location(0)]] top_uv : vec2<f32>) -> [[location(0)]] vec4<f32> {
		var diffuseColor: vec4<f32> = textureSample(myTexture, mySampler, top_uv);
		var outColor: vec4<f32> = vec4<f32>(diffuseColor.rgb, 1.0);
		return outColor;
	}
	`,
};
const wgslTablaNew = {
    vertex: `
	[[block]] struct TabUniforms {
		modelViewProjectionMatrix : mat4x4<f32>;
		info : vec4<f32>;
		cameraPos : vec4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
		[[location(0)]] top_uv : vec2<f32>;
		[[location(1)]] tabla_pos : vec3<f32>;
	};

	[[group(0), binding(3)]] var<uniform> uniforms : TabUniforms;

	[[stage(vertex)]]
	fn main([[location(0)]] position : vec3<f32>) -> VOUTPUT {
		var voutput : VOUTPUT;
		voutput.top_uv = vec2<f32>(position.x/350.0, position.y/350.0);
		voutput.tabla_pos = position - uniforms.cameraPos.xyz;
		voutput.Position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct TabUniforms {
		modelViewProjectionMatrix : mat4x4<f32>;
		info : vec4<f32>;
		cameraPos : vec4<f32>;
	};

	[[group(0), binding(0)]] var mySampler: sampler;
	[[group(0), binding(1)]] var tablaTexture: texture_2d<f32>;
	[[group(0), binding(2)]] var cieloTexture: texture_cube<f32>;
	[[group(0), binding(3)]] var<uniform> uniforms : TabUniforms;

	[[stage(fragment)]]

	fn main( 
			[[location(0)]] top_uv : vec2<f32>, 
			[[location(1)]] tabla_pos : vec3<f32>
		) -> [[location(0)]] vec4<f32> {
		var outColor: vec4<f32> = textureSample(tablaTexture, mySampler, top_uv);
		return outColor;
	}
	`,
};
const wgslTabla = {
    vertex: `
	[[block]] struct TabUniforms {
		modelViewProjectionMatrix : mat4x4<f32>;
		info : vec4<f32>;
		cameraPos : vec4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
		[[location(0)]] top_uv : vec2<f32>;
		[[location(1)]] tabla_pos : vec3<f32>;
	};

	[[group(0), binding(3)]] var<uniform> uniforms : TabUniforms;

	[[stage(vertex)]]
	fn main([[location(0)]] position : vec3<f32>) -> VOUTPUT {
		var voutput : VOUTPUT;
		voutput.top_uv = vec2<f32>(position.x/350.0, position.y/350.0);
		voutput.tabla_pos = position - uniforms.cameraPos.xyz;
		voutput.Position = uniforms.modelViewProjectionMatrix * vec4<f32>(position, 1.0);
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct TabUniforms {
		modelViewProjectionMatrix : mat4x4<f32>;
		info : vec4<f32>;
		cameraPos : vec4<f32>;
	};

	[[group(0), binding(0)]] var mySampler: sampler;
	[[group(0), binding(1)]] var tablaTexture: texture_2d<f32>;
	[[group(0), binding(2)]] var cieloTexture: texture_cube<f32>;
	[[group(0), binding(3)]] var<uniform> uniforms : TabUniforms;

	[[stage(fragment)]]

	fn main( 
			[[location(0)]] top_uv : vec2<f32>, 
			[[location(1)]] tabla_pos : vec3<f32>
		) -> [[location(0)]] vec4<f32> {
		var normal: vec3<f32> = vec3<f32>(0.0, 0.0, 1.0);
		var I: vec3<f32> = normalize(tabla_pos);
		let R: vec3<f32> = I - 2.0 * dot(normal, I) * normal;
		var RR: vec3<f32> = vec3<f32>(R.x,R.z,-R.y);
		var skyColor: vec4<f32> = textureSample(cieloTexture, mySampler, RR);
		var outColor: vec4<f32> = textureSample(tablaTexture, mySampler, top_uv) * 0.70 + skyColor * 0.30;
		return outColor;
	}
	`,
};
const wgslMulti = {
    vertex: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
		[[location(0)]] top_uv : vec2<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;

	[[stage(vertex)]]
	fn main([[location(0)]] position : vec2<f32>) -> VOUTPUT {
		var voutput: VOUTPUT;
		voutput.top_uv = vec2<f32>(position.x/camera.info.x * camera.flip.x + camera.flip.y, position.y/camera.info.y * camera.flip.z + camera.flip.w);
		voutput.Position = camera.viewProjectionMatrix * uniforms.modelMatrix * vec4<f32>(position, camera.info.z, 1.0);
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	[[block]] struct ColorUniforms {
		mask : vec4<f32>;
		saturate : vec4<f32>;
		positionRadius : vec4<f32>;
		modelWorldMatrix : mat4x4<f32>;
	};

	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[group(1), binding(0)]] var mySampler: sampler;
	[[group(1), binding(1)]] var myTexture: texture_2d<f32>;
	[[group(2), binding(0)]] var<uniform> colorUniforms : ColorUniforms;
	
	[[stage(fragment)]]
	fn main([[location(0)]] top_uv : vec2<f32>) -> [[location(0)]] vec4<f32> {
		var diffuseColor: vec4<f32> = textureSample(myTexture, mySampler, top_uv);
		var outColor: vec4<f32> = vec4<f32>(diffuseColor.r * colorUniforms.mask.r, diffuseColor.g * colorUniforms.mask.g, diffuseColor.b * colorUniforms.mask.b, 1.0);
		outColor = outColor + colorUniforms.saturate;
		return outColor;
	}
	`,
};
const wgslOverlay = {
    vertex: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	[[block]] struct ColorUniforms {
		mask : vec4<f32>;
		saturate : vec4<f32>;
		positionRadius : vec4<f32>;
		modelWorldMatrix : mat4x4<f32>;
	};
	struct VOUTPUT {
		[[builtin(position)]] Position : vec4<f32>;
		[[location(0)]] top_uv : vec2<f32>;
		[[location(1)]] overlay_uv : vec2<f32>;
	};
	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[group(2), binding(0)]] var<uniform> colorUniforms : ColorUniforms;

	[[stage(vertex)]]
	fn main([[location(0)]] position : vec2<f32>) -> VOUTPUT {
		var voutput: VOUTPUT;
		voutput.top_uv = vec2<f32>(position.x/camera.info.x * camera.flip.x + camera.flip.y, position.y/camera.info.y * camera.flip.z + camera.flip.w);
		voutput.Position = camera.viewProjectionMatrix * uniforms.modelMatrix * vec4<f32>(position, camera.info.z, 1.0);
		var purePosition: vec4<f32> = colorUniforms.modelWorldMatrix * vec4<f32>(position, camera.info.z, 1.0);
		var r: f32 = colorUniforms.positionRadius.z;
		voutput.overlay_uv = vec2<f32>((purePosition.x - colorUniforms.positionRadius.x + r) / r / 2.0, 1.0 - ((purePosition.y - colorUniforms.positionRadius.y + r) / r / 2.0));
		return voutput;
	}
	`,
    fragment: `
	[[block]] struct Uniforms {
		modelMatrix : mat4x4<f32>;
		color : vec4<f32>;
	};
	[[block]] struct CameraUniforms {
		viewMatrix : mat4x4<f32>;
		projectionMatrix : mat4x4<f32>;
		viewProjectionMatrix : mat4x4<f32>;
		flip : vec4<f32>;
		info : vec4<f32>;
	};
	[[block]] struct ColorUniforms {
		mask : vec4<f32>;
		saturate : vec4<f32>;
		positionRadius : vec4<f32>;
		modelWorldMatrix : mat4x4<f32>;
	};

	[[group(0), binding(0)]] var<uniform> uniforms : Uniforms;
	[[group(0), binding(1)]] var<uniform> camera : CameraUniforms;
	[[group(1), binding(0)]] var mySampler: sampler;
	[[group(1), binding(1)]] var myTexture: texture_2d<f32>;
	[[group(1), binding(2)]] var overlayTexture: texture_2d<f32>;
	[[group(2), binding(0)]] var<uniform> colorUniforms : ColorUniforms;

	[[stage(fragment)]]
	fn main(
		[[location(0)]] top_uv : vec2<f32>,
		[[location(1)]] overlay_uv : vec2<f32>
	) -> [[location(0)]] vec4<f32> {
		var diffuseColor: vec4<f32> = textureSample(myTexture, mySampler, top_uv);
		var overlayColor: vec4<f32> = textureSample(overlayTexture, mySampler, overlay_uv);
		var srcColor: vec4<f32> = vec4<f32>(diffuseColor.r * colorUniforms.mask.r, diffuseColor.g * colorUniforms.mask.g, diffuseColor.b * colorUniforms.mask.b, 1.0);
		srcColor = srcColor + colorUniforms.saturate;
		var outColor: vec4<f32>;
		if (colorUniforms.positionRadius.w > 0.0) {
			outColor = srcColor + overlayColor;
			outColor = outColor + vec4<f32>(-1.0, -1.0, -1.0, 0.0);
		} else {
			outColor = srcColor + overlayColor;
		}
		return outColor;
	}
	`,
};
let wgslSrc = [
    wgslBasic,
    wgslPicker,
    //wgslDem,
    wgslMulti,
    wgslOverlay,
    wgslPhong,
    wgslPicker,
    wgslShadow,
    wgslSide,
    wgslTabla,
    wgslTop
];
