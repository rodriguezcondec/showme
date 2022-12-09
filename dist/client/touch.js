export var ETouchState;
(function (ETouchState) {
    ETouchState[ETouchState["None"] = 0] = "None";
    ETouchState[ETouchState["Press"] = 1] = "Press";
    ETouchState[ETouchState["Drag"] = 2] = "Drag";
    ETouchState[ETouchState["Pinch"] = 3] = "Pinch";
    ETouchState[ETouchState["Swipe"] = 4] = "Swipe";
    ETouchState[ETouchState["Zoom"] = 5] = "Zoom";
    ETouchState[ETouchState["Flip"] = 6] = "Flip";
})(ETouchState || (ETouchState = {}));
export class CTouch {
    constructor(app) {
        this.pinchInScale = 0.7;
        this.pinchOutScale = 1.34;
        this.lastTapTime = 0;
        this.panPiece = -1;
        this.state = ETouchState.None;
        this.panScalar = 200;
        this.selectX = 0;
        let self = this;
        this.a = app;
        this.inButton = false;
        this.ignoreEnd = false;
        console.log('CTouch');
        window.addEventListener('touchcancel', (evt) => {
            this.onTouchCancel(evt);
        });
        window.addEventListener('touchend', (evt) => {
            this.onTouchEnd(evt);
        });
        window.addEventListener('touchmove', (evt) => {
            this.onTouchMove(evt);
        });
        window.addEventListener('touchstart', (evt) => {
            this.onTouchStart(evt);
        });
    }
    onTouchCancel(evt) {
        console.log('onTouchCancel');
        var touches = evt.changedTouches;
        let touch = touches[0];
        this.a.p.handleClickRelease(touch.clientX, touch.clientY);
    }
    onTouchEnd(evt) {
        console.log('onTouchEnd');
        if (this.ignoreEnd) {
            console.log('ignore this onTouchEnd');
            this.ignoreEnd = false;
            return;
        }
        var touches = evt.changedTouches;
        let touch = touches[0];
        this.a.p.handleClickRelease(touch.clientX, touch.clientY);
    }
    onTouchMove(evt) {
        console.log('onTouchMove');
        var touches = evt.changedTouches;
        let touch = touches[0];
        let x = touch.clientX;
        let y = touch.clientY;
        if (this.a.p.inDrag) {
            this.a.p.moveGroup(this.a.p.selectedGroupId, x, y, true);
        }
        else if (this.a.p.inSwipe) {
            //console.log('onTouchMove, inSwipe')
            this.a.p.updateSwipeTarget(x, y);
        }
    }
    onTouchStart(evt) {
        console.log('onTouchStart');
        if (this.inButton) {
            console.log('ignore this onTouchStart');
            this.ignoreEnd = true;
            return;
        }
        var touches = evt.changedTouches;
        console.log('touches.length' + touches.length);
        let touch = touches[0];
        let x = touch.clientX;
        let y = touch.clientY;
        console.log('touch.clientX: ' + touch.clientX);
        console.log('touch.clientY: ' + touch.clientY);
        this.a.p.handleClick(x, y);
    }
}
