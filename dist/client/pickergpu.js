var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { colorToId } from './util';
import { mat4, vec3, vec4 } from 'gl-matrix';
import { a } from './globals';
export class CPickerGpu {
    constructor(app) {
        this.textureWidth = a.pickerSize;
        this.textureHeight = a.pickerSize;
        this.app = app;
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
    initialize() {
        this.renderBuffer = a.gpu.createBuffer({
            size: this.textureWidth * this.textureHeight * 4,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST // | GPUBufferUsage.STORAGE  // | GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
        });
        this.depthTexture = a.gpu.createTexture({
            size: {
                width: this.textureWidth,
                height: this.textureHeight,
                depthOrArrayLayers: 1,
            },
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.renderTexture = a.gpu.createTexture({
            size: {
                width: this.textureWidth,
                height: this.textureHeight,
                depthOrArrayLayers: 1,
            },
            format: 'bgra8unorm',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING,
        });
        this.renderPassDescriptor = {
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
        this.pickerPassDescriptor = {
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
    }
    updateUniformsGpu(groups) {
        for (let group of groups) {
            group.updatePickerUniformsGpu(null);
        }
    }
    renderPicker(groups, selected) {
        this.updateUniformsGpu(groups);
        this.updateCameraUniforms(a.matView, a.matProjection);
        let commandEncoder = a.gpu.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass(this.pickerPassDescriptor);
        renderPass.setPipeline(a.w.pickerPipeline);
        renderPass.setVertexBuffer(0, a.w.topVertexBufferGpu);
        for (let group of groups) {
            if (group != selected) {
                for (let instance of group.instances) {
                    renderPass.setBindGroup(0, group.igroup.flipped ? group.backPickerBindGroup : group.topPickerBindGroup);
                    renderPass.setIndexBuffer(instance.piece.topIndexBufferGpu, 'uint32');
                    renderPass.drawIndexed(instance.piece.topIndexLength);
                }
            }
        }
        if (selected) {
            selected.updateMatrix();
            for (let instance of selected.instances) {
                renderPass.setBindGroup(0, selected.igroup.flipped ? selected.backPickerBindGroup : selected.topPickerBindGroup);
                renderPass.setIndexBuffer(instance.piece.topIndexBufferGpu, 'uint32');
                renderPass.drawIndexed(instance.piece.topIndexLength);
            }
        }
        renderPass.endPass();
        commandEncoder.copyTextureToBuffer({
            texture: this.renderTexture,
            origin: {
                x: 0,
                y: 0
            }
        }, {
            buffer: this.renderBuffer,
            bytesPerRow: this.textureWidth * 4,
        }, {
            width: this.textureWidth,
            height: this.textureHeight,
            depthOrArrayLayers: 1,
        });
        a.gpu['queue'].submit([commandEncoder.finish()]);
    }
    pickGroup(groups, x, y, selected) {
        return __awaiter(this, void 0, void 0, function* () {
            this.renderPicker(groups, selected);
            let offsetX = Math.floor(x * a.pickerSize);
            let offsetY = Math.floor((1 - y) * a.pickerSize);
            let color = yield this.readTarget(offsetX, offsetY);
            let id = colorToId(color);
            //console.log('pickGroup color = ' + color.toString(16))
            //console.log('pickGroup id = ' + id)
            return id;
        });
    }
    readTarget(offsetX, offsetY) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.renderBuffer.mapAsync(GPUMapMode.READ);
            let offset = offsetY * this.textureWidth * 4;
            const mapping = this.renderBuffer.getMappedRange(offset, this.textureWidth * 4);
            let pixels = new Uint8Array(mapping);
            const color = (pixels[offsetX * 4 + 2] << 16) | (pixels[offsetX * 4 + 1] << 8) | pixels[offsetX * 4 + 0];
            this.renderBuffer.unmap();
            return color;
        });
    }
    updateCameraUniforms(view, projection) {
        let viewProjection = mat4.create();
        mat4.multiply(viewProjection, projection, view);
        let vpData = viewProjection;
        a.gpu['queue'].writeBuffer(a.w.topPickerBuffer, 128, vpData.buffer, vpData.byteOffset, vpData.byteLength);
        a.gpu['queue'].writeBuffer(a.w.backPickerBuffer, 128, vpData.buffer, vpData.byteOffset, vpData.byteLength);
    }
    isCollision(groups, groupId, stitchId, pos, radius) {
        return __awaiter(this, void 0, void 0, function* () {
            //let time1 = Date.now()
            //console.log('isCollision')
            mat4.ortho(this.matProjection, -radius, radius, -radius, radius, 3, 2000);
            mat4.multiply(this.matProjection, this.gpuAdjust, this.matProjection);
            let matWorld = mat4.create();
            mat4.translate(matWorld, matWorld, vec3.fromValues(pos[0], pos[1], 1000));
            mat4.invert(this.matView, matWorld);
            this.updateCameraUniforms(this.matView, this.matProjection);
            this.renderCollision(groups, groupId, stitchId);
            let result = yield this.readCollision();
            //let time2 = Date.now()
            return result;
        });
    }
    updateCollisionGpu(groups, groupId, stitchId) {
        let red = vec4.fromValues(1.0, 0, 0, 1.0);
        let blue = vec4.fromValues(0, 0, 1.0, 1.0);
        for (let group of groups) {
            if (group.igroup.gid != stitchId) {
                if (group.igroup.gid == groupId) {
                    group.updatePickerUniformsGpu(red);
                }
                else {
                    group.updatePickerUniformsGpu(blue);
                }
            }
        }
    }
    readCollision() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.renderBuffer.mapAsync(GPUMapMode.READ);
            const mapping = this.renderBuffer.getMappedRange();
            let pixels = new Uint32Array(mapping);
            let n = this.textureWidth * this.textureHeight;
            for (let i = 0; i < n; i++) {
                if (pixels[i] == 0xffff00ff) {
                    this.renderBuffer.unmap();
                    return true;
                }
            }
            this.renderBuffer.unmap();
            return false;
        });
    }
    renderCollision(groups, groupId, stitchId) {
        this.updateCollisionGpu(groups, groupId, stitchId);
        let commandEncoder = a.gpu.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass(this.renderPassDescriptor);
        renderPass.setPipeline(a.w.collisionPipeline);
        renderPass.setVertexBuffer(0, a.w.topVertexBufferGpu);
        for (let group of groups) {
            if (group.igroup.gid != stitchId) {
                for (let instance of group.instances) {
                    renderPass.setBindGroup(0, group.igroup.flipped ? group.backCollisionBindGroup : group.topCollisionBindGroup);
                    renderPass.setIndexBuffer(instance.piece.topIndexBufferGpu, 'uint32');
                    renderPass.drawIndexed(instance.piece.topIndexLength);
                }
            }
        }
        renderPass.endPass();
        commandEncoder.copyTextureToBuffer({
            texture: this.renderTexture,
            origin: {
                x: 0,
                y: 0
            }
        }, {
            buffer: this.renderBuffer,
            bytesPerRow: this.textureWidth * 4
        }, {
            width: this.textureWidth,
            height: this.textureHeight,
            depthOrArrayLayers: 1,
        });
        a.gpu['queue'].submit([commandEncoder.finish()]);
    }
}
