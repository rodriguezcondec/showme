import { channelToColor } from './util';
import { vec4 } from 'gl-matrix';
export class CInstance {
    constructor(iinstance, group, isMc, isSub) {
        this.iinstance = iinstance;
        this.updateColorMaskUniforms(this.iinstance.channel, isSub);
    }
    updateColorMaskUniforms(channel, isSub) {
        this.colorMask = channelToColor(this.iinstance.channel);
        this.colorSaturate = isSub ? vec4.fromValues(1 - this.colorMask[0], 1 - this.colorMask[1], 1 - this.colorMask[2], 1 - this.colorMask[3]) : vec4.fromValues(0, 0, 0, 0);
    }
    release() {
        if (this.multiChannelUniformBuffer) {
            this.multiChannelUniformBuffer.destroy();
            this.multiChannelUniformBuffer = null;
        }
        this.multiColorGroup = null;
        this.simpleColorGroup = null;
        this.iinstance = null;
        this.colorMask = null;
        this.colorSaturate = null;
        this.piece = null;
    }
}
