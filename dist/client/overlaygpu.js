var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { mat4, vec3 } from 'gl-matrix';
import { a } from './globals';
export class COverlayGpu {
    constructor() {
        this.textureWidth = a.pickerSize;
        this.textureHeight = a.pickerSize;
        this.matProjection = mat4.create();
        this.matView = mat4.create();
        this.gpuAdjust = mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 1);
        /*this.gpuAdjust = mat4.fromValues(
            1, 0, 0,   0,
            0, 1, 0,   0,
            0, 0, 0.5, 0,
            0, 0, 0.5, 1
        )*/
        this.initialize();
    }
    release() {
        //this.renderBuffer.destroy()
        this.depthTexture.destroy();
        this.renderTexture.destroy();
    }
    initialize() {
        //console.log('overlay GPU width ' + this.textureWidth)
        /*this.renderBuffer = a.gpu.createBuffer({
            size: this.textureWidth*this.textureHeight*4,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST // | GPUBufferUsage.STORAGE  // | GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
        });*/
        this.depthTexture = a.gpu.createTexture({
            size: {
                width: this.textureWidth,
                height: this.textureHeight,
            },
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.renderTexture = a.gpu.createTexture({
            size: {
                width: this.textureWidth,
                height: this.textureHeight,
            },
            format: a.w.swapChainFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING,
        });
        this.addRenderPassDescriptor = {
            colorAttachments: [
                {
                    view: this.renderTexture.createView(),
                    loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    storeOp: 'store'
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
        this.subRenderPassDescriptor = {
            colorAttachments: [
                {
                    view: this.renderTexture.createView(),
                    loadValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
                    storeOp: 'store'
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
    }
    /*private updateUniformsGpu(groups: CGroup []) {
        for ( let group of groups ) {
            group.updatePickerUniformsGpu(null, a.matProjection, a.matView)
        }
    }*/
    render(groups, groupId, isSub) {
        //this.updateOverlayGpu(groups)
        let commandEncoder = a.gpu.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass(isSub ? this.subRenderPassDescriptor : this.addRenderPassDescriptor);
        renderPass.setPipeline(a.w.topMultiSimplePipeline);
        renderPass.setVertexBuffer(0, a.w.topVertexBufferGpu);
        renderPass.setBindGroup(1, a.w.overlayTextureBindGroup);
        for (let group of groups) {
            if (!group.igroup.flipped && group.igroup.gid != groupId) {
                renderPass.setBindGroup(0, group.topMultiSimpleGroup);
                for (let instance of group.instances) {
                    renderPass.setBindGroup(2, instance.simpleColorGroup);
                    renderPass.setIndexBuffer(instance.piece.topIndexBufferGpu, 'uint32');
                    renderPass.drawIndexed(instance.piece.topIndexLength);
                }
            }
        }
        renderPass.setPipeline(a.w.topMultiSimplePipeline);
        renderPass.setVertexBuffer(0, a.w.topVertexBufferGpu);
        for (let group of groups) {
            if (group.igroup.flipped && group.igroup.gid != groupId) {
                renderPass.setBindGroup(0, group.backMultiSimpleGroup);
                for (let instance of group.instances) {
                    renderPass.setBindGroup(2, instance.simpleColorGroup);
                    renderPass.setIndexBuffer(instance.piece.topIndexBufferGpu, 'uint32');
                    renderPass.drawIndexed(instance.piece.topIndexLength);
                }
            }
        }
        renderPass.endPass();
        /* jkl commandEncoder.copyTextureToBuffer(
            {
                texture: this.renderTexture,
                origin: {
                    x: 0,
                    y: 0
                }
            },
            {
                buffer: this.renderBuffer,
                bytesPerRow: this.textureWidth*4,
            },
            {
                width: this.textureWidth,
                height: this.textureHeight,
                depthOrArrayLayers: 1,
            }
        );*/
        a.gpu['queue'].submit([commandEncoder.finish()]);
    }
    renderOverlay(groups, groupId, pos, radius, isSub) {
        return __awaiter(this, void 0, void 0, function* () {
            let time1 = Date.now();
            mat4.ortho(this.matProjection, -radius, radius, -radius, radius, 10, 100000);
            mat4.multiply(this.matProjection, this.gpuAdjust, this.matProjection);
            let matWorld = mat4.create();
            mat4.translate(matWorld, matWorld, vec3.fromValues(pos[0], pos[1], 20000));
            mat4.invert(this.matView, matWorld);
            let viewProjection = mat4.create();
            mat4.multiply(viewProjection, this.matProjection, this.matView);
            let vData = this.matView;
            let pData = this.matProjection;
            let vpData = viewProjection;
            a.gpu['queue'].writeBuffer(a.w.topOverlayBuffer, 0, vData.buffer, vData.byteOffset, vData.byteLength);
            a.gpu['queue'].writeBuffer(a.w.topOverlayBuffer, 64, pData.buffer, pData.byteOffset, pData.byteLength);
            a.gpu['queue'].writeBuffer(a.w.topOverlayBuffer, 128, vpData.buffer, vpData.byteOffset, vpData.byteLength);
            a.gpu['queue'].writeBuffer(a.w.backOverlayBuffer, 0, vData.buffer, vData.byteOffset, vData.byteLength);
            a.gpu['queue'].writeBuffer(a.w.backOverlayBuffer, 64, pData.buffer, pData.byteOffset, pData.byteLength);
            a.gpu['queue'].writeBuffer(a.w.backOverlayBuffer, 128, vpData.buffer, vpData.byteOffset, vpData.byteLength);
            this.render(groups, groupId, isSub);
        });
    }
}
