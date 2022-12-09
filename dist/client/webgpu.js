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
import { gpuModuleFragment, gpuModuleVertex, initShadersGpu } from './wgsl';
export class CWebGpu {
    constructor() {
    }
    initialize(canvas) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initRenderObjects(canvas);
            this.initDepthCullColor();
            this.initVertexStates();
            yield this.initShaderStages();
            this.initPipelines();
            this.initBindGroups();
        });
    }
    initRenderObjects(canvas) {
        return __awaiter(this, void 0, void 0, function* () {
            let devicePixelRatio = window.devicePixelRatio || 1;
            //let devicePixelRatio = 1.5
            let presentationSize = [a.canvas.clientWidth * devicePixelRatio, a.canvas.clientHeight * devicePixelRatio];
            this.depthTexture = a.gpu.createTexture({
                size: presentationSize,
                format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
                sampleCount: 4,
            });
            this.colorStateCollision = {
                format: 'bgra8unorm',
                blend: {
                    color: {
                        srcFactor: 'one',
                        dstFactor: 'one',
                        operation: 'add'
                    },
                    alpha: {
                        srcFactor: 'one',
                        dstFactor: 'zero',
                        operation: 'add'
                    },
                }
            };
            this.context = canvas.getContext('webgpu');
            this.swapChainFormat = this.context.getPreferredFormat(a.adapter);
            this.context.configure({
                device: a.gpu,
                format: this.swapChainFormat,
                //usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_SRC,
                // for graphical debugging, copying image into main screen buffer
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST,
                size: presentationSize
            });
            const ptexture = a.gpu.createTexture({
                size: presentationSize,
                sampleCount: 4,
                format: this.swapChainFormat,
                // jkl usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST,
            });
            this.msaaView = ptexture.createView();
            this.renderPassDescriptor = {
                colorAttachments: [
                    {
                        //attachment: undefined, // Assigned later
                        view: undefined,
                        loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                        storeOp: 'store',
                    },
                ],
                depthStencilAttachment: {
                    view: this.depthTexture.createView(),
                    depthLoadValue: 1.0,
                    depthStoreOp: 'store',
                    stencilLoadValue: 0,
                    stencilStoreOp: 'store',
                },
            };
            this.clampSamplerGpu = a.gpu.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
                mipmapFilter: 'linear',
                addressModeU: 'clamp-to-edge',
                addressModeV: 'clamp-to-edge',
                maxAnisotropy: 5
            });
            this.repeatSamplerGpu = a.gpu.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
                mipmapFilter: 'linear',
                addressModeU: 'repeat',
                addressModeV: 'repeat',
                maxAnisotropy: 5
            });
        });
    }
    initDepthCullColor() {
        this.depthTestEnabled = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        };
        this.depthTestDisabled = {
            depthWriteEnabled: false,
            depthCompare: 'less',
            format: 'depth24plus',
        };
        this.primitiveCullBack = {
            topology: 'triangle-list',
            cullMode: 'back',
            frontFace: 'cw'
        };
        this.primitiveCullFront = {
            topology: 'triangle-list',
            cullMode: 'back',
            frontFace: 'ccw'
        };
        this.primitiveCullNone = {
            topology: 'triangle-list',
            cullMode: 'none',
        };
    }
    getVertexBuffers(shader) {
        switch (shader) {
            case EShader.Basic:
            case EShader.Picker:
            case EShader.Collide:
            case EShader.Overlay:
            case EShader.Phong:
            case EShader.Top:
            case EShader.Multi:
                return [this.vertexBufferLayout8];
            //case EShader.Dem:
            //	return [ this.vertexBufferLayout24 ]
            case EShader.Shadow:
                return [this.vertexBufferLayout32];
            case EShader.Side:
                return [this.vertexBufferLayout32];
            case EShader.Tabla:
                return [this.vertexBufferLayout12];
        }
        return null;
    }
    initShaderStages() {
        return __awaiter(this, void 0, void 0, function* () {
            yield initShadersGpu();
            this.vertexStates = new Array();
            this.fragmentStates = new Array();
            for (let i = 0; i < EShader.Last; i++) {
                let buffers = this.getVertexBuffers(i);
                this.vertexStates.push({
                    module: gpuModuleVertex[i],
                    entryPoint: "main",
                    buffers: buffers
                });
                if (i != EShader.Collide) {
                    this.fragmentStates.push({
                        module: gpuModuleFragment[i],
                        entryPoint: "main",
                        targets: [{ format: 'bgra8unorm' }]
                    });
                }
                else {
                    this.fragmentStates.push({
                        module: gpuModuleFragment[i],
                        entryPoint: "main",
                        targets: [this.colorStateCollision]
                    });
                }
            }
        });
    }
    initBindGroups() {
        this.sideTextureBindGroup = a.gpu.createBindGroup({
            layout: this.sidePipeline.getBindGroupLayout(1),
            entries: [
                {
                    binding: 0,
                    resource: a.w.repeatSamplerGpu,
                },
                {
                    binding: 1,
                    resource: a.tabla.texturesGpu[a.sideTextureIndex].createView(),
                },
            ]
        });
        a.tabla.bindGroups = new Array(6);
        const cubeView = a.tabla.cieloTextureGpu.createView({
            dimension: "cube",
        });
        for (let i = 0; i < 6; i++) {
            a.tabla.bindGroups[i] = a.gpu.createBindGroup({
                layout: this.tablaPipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0,
                        resource: a.w.repeatSamplerGpu,
                    },
                    {
                        binding: 1,
                        resource: a.tabla.texturesGpu[i].createView(),
                    },
                    {
                        binding: 2,
                        resource: cubeView,
                    },
                    {
                        binding: 3,
                        resource: {
                            buffer: a.tabla.uniformBufferGpu,
                        },
                    },
                ]
            });
        }
    }
    initVertexStates() {
        this.vertexBufferLayout8 = {
            arrayStride: 8,
            attributes: [
                {
                    // position
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x2',
                },
            ]
        };
        this.vertexBufferLayout12 = {
            arrayStride: 12,
            attributes: [
                {
                    // position
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x3',
                },
            ]
        };
        this.vertexBufferLayout20 = {
            arrayStride: 20,
            attributes: [
                {
                    // position
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x3',
                },
                {
                    // uvs
                    shaderLocation: 1,
                    offset: 12,
                    format: 'float32x2',
                },
            ]
        };
        this.vertexBufferLayout24 = {
            arrayStride: 24,
            attributes: [
                {
                    // position
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x3',
                },
                {
                    // normal
                    shaderLocation: 1,
                    offset: 12,
                    format: 'float32x3',
                },
            ],
        };
        this.vertexBufferLayout32 = {
            arrayStride: 32,
            attributes: [
                {
                    // position
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x3',
                },
                {
                    // normal
                    shaderLocation: 1,
                    offset: 12,
                    format: 'float32x3',
                },
                {
                    // uv
                    shaderLocation: 2,
                    offset: 24,
                    format: 'float32x2',
                },
            ],
        };
    }
    initPipelines() {
        this.topBasicPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestEnabled,
            vertex: this.vertexStates[EShader.Basic],
            fragment: this.fragmentStates[EShader.Basic],
            multisample: { count: 4, },
        });
        /*this.demPipeline = a.gpu.createRenderPipeline({
            layout: this.basicPipelineLayout,
            vertexStage: this.vertexStages[EShader.Dem],
            fragmentStage: this.fragmentStages[EShader.Dem],
            primitiveTopology: 'triangle-list',
            depthStencilState: this.depthTestEnabled,
            vertexState: this.vertexState24,
            rasterizationState: this.rasterizationCullBack,
            colorStates: this.colorStateDefault
        });*/
        this.tablaPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestDisabled,
            vertex: this.vertexStates[EShader.Tabla],
            fragment: this.fragmentStates[EShader.Tabla],
            multisample: { count: 4, },
        });
        this.topMultiPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestEnabled,
            vertex: this.vertexStates[EShader.Multi],
            fragment: this.fragmentStates[EShader.Multi],
            multisample: { count: 4, },
        });
        this.topMultiSimplePipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestEnabled,
            vertex: this.vertexStates[EShader.Multi],
            fragment: this.fragmentStates[EShader.Multi],
        });
        this.overlayPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestEnabled,
            vertex: this.vertexStates[EShader.Overlay],
            fragment: this.fragmentStates[EShader.Overlay],
            multisample: { count: 4, },
        });
        this.topPhongPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestEnabled,
            vertex: this.vertexStates[EShader.Phong],
            fragment: this.fragmentStates[EShader.Phong],
            multisample: { count: 4, },
        });
        this.pickerPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestDisabled,
            vertex: this.vertexStates[EShader.Picker],
            fragment: this.fragmentStates[EShader.Picker],
        });
        this.collisionPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestDisabled,
            vertex: this.vertexStates[EShader.Collide],
            fragment: this.fragmentStates[EShader.Collide],
        });
        this.sidePipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullBack,
            depthStencil: this.depthTestEnabled,
            vertex: this.vertexStates[EShader.Side],
            fragment: this.fragmentStates[EShader.Side],
            multisample: { count: 4, },
        });
        /*this.markerPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestEnabled,
            vertex: this.vertexStates[EShader.Marker],
            fragment: this.fragmentStates[EShader.Marker],
        });*/
        this.shadowPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestEnabled,
            vertex: this.vertexStates[EShader.Shadow],
            fragment: this.fragmentStates[EShader.Shadow],
            multisample: { count: 4, },
        });
        this.topShadowPipeline = a.gpu.createRenderPipeline({
            primitive: this.primitiveCullNone,
            depthStencil: this.depthTestEnabled,
            vertex: this.vertexStates[EShader.Top],
            fragment: this.fragmentStates[EShader.Top],
            multisample: { count: 4, },
        });
    }
}
