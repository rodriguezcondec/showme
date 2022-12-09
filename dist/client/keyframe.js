import { a } from './globals';
export var EKeyframeAction;
(function (EKeyframeAction) {
    EKeyframeAction[EKeyframeAction["LIFT"] = 1] = "LIFT";
    EKeyframeAction[EKeyframeAction["PLACE"] = 2] = "PLACE";
    EKeyframeAction[EKeyframeAction["BOUNCE_UP"] = 3] = "BOUNCE_UP";
    EKeyframeAction[EKeyframeAction["BOUNCE_DOWN"] = 4] = "BOUNCE_DOWN";
    EKeyframeAction[EKeyframeAction["FLIP"] = 5] = "FLIP";
    EKeyframeAction[EKeyframeAction["ROTATE_CW"] = 6] = "ROTATE_CW";
    EKeyframeAction[EKeyframeAction["ROTATE_CCW"] = 7] = "ROTATE_CCW";
    //PAN_X,
    //PAN_Y,
    EKeyframeAction[EKeyframeAction["CANCEL_SELECT"] = 8] = "CANCEL_SELECT";
})(EKeyframeAction || (EKeyframeAction = {}));
export var EKeyframeCurve;
(function (EKeyframeCurve) {
    EKeyframeCurve[EKeyframeCurve["LINEAR"] = 0] = "LINEAR";
    EKeyframeCurve[EKeyframeCurve["SQRT"] = 1] = "SQRT";
    EKeyframeCurve[EKeyframeCurve["SQUARE"] = 2] = "SQUARE";
    EKeyframeCurve[EKeyframeCurve["SCURVE"] = 3] = "SCURVE";
})(EKeyframeCurve || (EKeyframeCurve = {}));
export class CKeyframe {
    constructor(action, curve, duration, group, sPos, sRot, ePos, eRot) {
        this.action = action;
        this.curve = curve;
        this.group = group;
        this.startTime = Date.now();
        this.duration = duration;
        this.endTime = this.startTime + this.duration;
        this.startPosition = sPos;
        this.startRotation = sRot;
        this.endPosition = ePos;
        this.endRotation = eRot;
    }
    apply_curve(value, curve) {
        let result = 0;
        switch (curve) {
            case EKeyframeCurve.LINEAR:
                result = value;
                break;
            case EKeyframeCurve.SQRT:
                result = Math.sqrt(value);
                break;
            case EKeyframeCurve.SQUARE:
                result = value * value;
                break;
            case EKeyframeCurve.SCURVE:
                if (value < 0.5) {
                    let temp = value * 2.0;
                    temp *= temp;
                    result = temp / 2.0;
                }
                else {
                    let temp = (value - 0.5) * 2.0;
                    temp = Math.sqrt(temp);
                    result = temp / 2.0 + 0.5;
                }
                break;
        }
        return result;
    }
    updateCancelSelect(part) {
        //console.log('updateCancelSelect ' + part)
        let px = (this.endPosition[0] - this.startPosition[0]) * part + this.startPosition[0];
        let py = (this.endPosition[1] - this.startPosition[1]) * part + this.startPosition[1];
        let pz = (this.endPosition[2] - this.startPosition[2]) * part + this.startPosition[2];
        let rx = (this.endRotation[0] - this.startRotation[0]) * part + this.startRotation[0];
        let rz = (this.endRotation[2] - this.startRotation[2]) * part + this.startRotation[2];
        //console.log('px: ' + px)
        //console.log('py: ' + py)
        //console.log('pz: ' + pz)
        this.group.setPosition(px, py, pz);
        this.group.setRotationX(rx);
        this.group.setRotationZ(rz);
        if (part >= 1) {
            a.placingGroupId = -1;
            console.log('flipping OFF: updateCancelSelect');
            this.group.isFlipping = false;
        }
    }
    handle() {
        let done = false;
        let currentTime = Date.now();
        let value;
        let curvePart;
        if (currentTime >= this.endTime) {
            curvePart = 1;
            value = this.endValue;
            done = true;
            if (this.action == EKeyframeAction.FLIP) {
                console.log('flipping OFF: handle keyframe');
                this.group.isFlipping = false;
            }
            else if (this.action == EKeyframeAction.PLACE) {
                a.placingGroupId = -1;
            }
        }
        else {
            let linearPart = (currentTime - this.startTime) / this.duration;
            curvePart = this.apply_curve(linearPart, this.curve);
            value = this.startValue + this.deltaValue * curvePart;
        }
        switch (this.action) {
            case EKeyframeAction.LIFT:
                this.group.setPosition(this.group.position[0], this.group.position[1], value);
                a.updateMc = true;
                break;
            case EKeyframeAction.PLACE:
            case EKeyframeAction.BOUNCE_UP:
            case EKeyframeAction.BOUNCE_DOWN:
                this.group.setPosition(this.group.position[0], this.group.position[1], value);
                break;
            case EKeyframeAction.FLIP:
                this.group.setRotationX(value);
                break;
            case EKeyframeAction.ROTATE_CW:
            case EKeyframeAction.ROTATE_CCW:
                this.group.setRotationZ(value);
                a.updateMc = true;
                break;
            // case EKeyframeAction.PAN_X:
            //	 a.cameraX = value;
            //	 a.pcamera.update()
            //	 break;
            // case EKeyframeAction.PAN_Y:
            //	 a.cameraY = value;
            //	 a.pcamera.update()
            //	 break;
            case EKeyframeAction.CANCEL_SELECT:
                this.updateCancelSelect(curvePart);
                break;
        }
        return done;
    }
}
export class CKeyFrameEngine {
    constructor(puzzle) {
        this.keyframes = new Array();
        this.puzzle = puzzle;
    }
    addWithCallback(action, curve, duration, group, callback) {
        let keyframe = this.add(action, curve, duration, group);
        keyframe.callback = callback;
    }
    add(action, curve, duration, group) {
        let keyframe = new CKeyframe(action, curve, duration, group);
        switch (action) {
            case EKeyframeAction.LIFT:
                keyframe.startValue = group.position[2];
                keyframe.endValue = a.ceilingZ;
                keyframe.deltaValue = keyframe.endValue - keyframe.startValue;
                break;
            case EKeyframeAction.PLACE:
                keyframe.startValue = group.position[2];
                keyframe.endValue = a.bottomZ;
                keyframe.deltaValue = keyframe.endValue - keyframe.startValue;
                break;
            case EKeyframeAction.BOUNCE_UP:
                keyframe.startValue = group.position[2];
                keyframe.endValue = a.bounceZ;
                keyframe.deltaValue = keyframe.endValue - keyframe.startValue;
                break;
            case EKeyframeAction.BOUNCE_DOWN:
                keyframe.startValue = group.position[2];
                keyframe.endValue = a.ceilingZ;
                keyframe.deltaValue = keyframe.endValue - keyframe.startValue;
                break;
            case EKeyframeAction.FLIP:
                keyframe.startValue = group.getRotationX();
                console.log('flipping ON');
                keyframe.group.isFlipping = true;
                if (!group.igroup.flipped) {
                    group.igroup.flipped = true;
                    keyframe.endValue = Math.PI;
                    keyframe.deltaValue = keyframe.endValue - keyframe.startValue;
                }
                else {
                    group.igroup.flipped = false;
                    keyframe.endValue = 0;
                    keyframe.deltaValue = keyframe.endValue - keyframe.startValue;
                }
                this.keyframes = this.keyframes.filter(function (keyframe, index, arr) {
                    return keyframe.action != EKeyframeAction.FLIP;
                });
                break;
            case EKeyframeAction.ROTATE_CW:
                keyframe.startValue = group.igroup.zstep * Math.PI / 2;
                if (group.igroup.zstep == 0) {
                    group.igroup.zstep = 3;
                }
                else {
                    group.igroup.zstep--;
                }
                keyframe.endValue = keyframe.startValue - Math.PI * 2 / a.rotationSectors;
                keyframe.deltaValue = keyframe.endValue - keyframe.startValue;
                break;
            case EKeyframeAction.ROTATE_CCW:
                keyframe.startValue = group.igroup.zstep * Math.PI * 2 / a.rotationSectors;
                if (group.igroup.zstep == 3) {
                    group.igroup.zstep = 0;
                }
                else {
                    group.igroup.zstep++;
                }
                keyframe.endValue = keyframe.startValue + Math.PI * 2 / a.rotationSectors;
                keyframe.deltaValue = keyframe.endValue - keyframe.startValue;
                break;
        }
        this.keyframes.push(keyframe);
        return keyframe;
    }
    addCancelSelect(curve, duration, group, sPos, sRot, ePos, eRot) {
        console.log('addCancelSelect spos ' + JSON.stringify(sPos));
        console.log('addCancelSelect epos ' + JSON.stringify(ePos));
        console.log('addCancelSelect srot ' + JSON.stringify(sRot));
        console.log('addCancelSelect erot ' + JSON.stringify(eRot));
        let keyframe = new CKeyframe(EKeyframeAction.CANCEL_SELECT, curve, duration, group, sPos, sRot, ePos, eRot);
        this.keyframes.push(keyframe);
    }
    // public addPanXY(x: number, y: number, curve: EKeyframeCurve, duration: number) {
    // 	a.panCoeffX = a.panCoeff * x
    // 	a.panCoeffY = a.panCoeff * y
    // 	let dimen : number = (a.worldWidth > a.worldHeight) ? a.worldWidth : a.worldHeight
    // 	let keyframeX: CKeyframe = new CKeyframe(EKeyframeAction.PAN_X, curve, duration, null)
    // 	keyframeX.startValue = a.cameraX
    // 	keyframeX.endValue = a.cameraX + dimen * a.panCoeffX
    // 	keyframeX.deltaValue = keyframeX.endValue - keyframeX.startValue
    //	 this.keyframes.push(keyframeX)
    // 	let keyframeY: CKeyframe = new CKeyframe(EKeyframeAction.PAN_Y, curve, duration, null)
    // 	keyframeY.startValue = a.cameraY
    // 	keyframeY.endValue = a.cameraY + dimen * a.panCoeffY
    // 	keyframeY.deltaValue = keyframeY.endValue - keyframeY.startValue
    //	 this.keyframes.push(keyframeY)
    // }
    update() {
        let changed = false;
        for (let keyframe of this.keyframes) {
            let done = keyframe.handle();
            if (done) {
                changed = true;
                if (keyframe.action == EKeyframeAction.BOUNCE_UP) {
                    this.add(EKeyframeAction.BOUNCE_DOWN, EKeyframeCurve.SQUARE, a.bounceMillis, keyframe.group);
                }
                if (keyframe.callback) {
                    keyframe.callback();
                }
            }
        }
        if (changed) {
            let currentTime = Date.now();
            this.keyframes = this.keyframes.filter(function (keyframe, index, arr) {
                return keyframe.endTime > currentTime;
            });
        }
    }
}
