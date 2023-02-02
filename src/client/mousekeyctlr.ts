
import { EKeyId } from './core'
import { CApp } from './app'

export class CMousekeyCtlr {
    a: CApp

    constructor(a: CApp) {
        let self = this
        this.a = a
        window.addEventListener('keydown', (evt) => {
            this.onKeydownEvent(evt)
        })
        window.addEventListener('keyup', (evt) => {
            this.onKeyupEvent(evt)
        })
        window.addEventListener('mousedown', function(evt) {
            self.onMouseEvent(evt)
            evt.preventDefault();
        }, false)
        window.addEventListener('mouseup', function(evt) {
            let x = evt.offsetX;
            let y = evt.offsetY;
            self.onMouseEvent(evt)
        })
        window.addEventListener('mousemove', (evt) => {
            let x = evt.offsetX;
            let y = evt.offsetY;
            self.onMouseEvent(evt)
        })
    }

    public onMouseLeftDown(x: number, y: number) {
        this.a.showme.handleClick(x, y)
    }

    public onMouseRightDown(x: number, y: number, evt: MouseEvent) {
    }

    public onMouseMiddleDown(x: number, y: number) {
        console.log('onMouseMiddleDown')
    }

    public onMouseMove(x: number, y: number) {
    }

    public onMouseLeftUp(x: number, y: number) {
        this.a.showme.handleClickRelease(x, y)
    }

    public onMouseEvent(evt: MouseEvent) {
        if (!this.a.showme) {
            return
        }

        if (this.a.showme.mouseIsOut && (evt.offsetX || evt.offsetY)) {
            this.a.showme.mouseIsOut = false
            // check left button
            if (!(evt.buttons & 1)) {
                this.a.showme.handleClickRelease(evt.offsetX, evt.offsetY)
            }
            return
        }
        if (!evt.offsetX && !evt.offsetY) {
            this.a.showme.mouseIsOut = true
            return
        }

        let x = evt.offsetX;
        let y = evt.offsetY;
        if (evt.type == 'mousedown') {
            if(evt.button == 0) {
                this.onMouseLeftDown(x, y)
            } else if(evt.button == 1) {
                this.onMouseMiddleDown(x, y)
            } else if(evt.button == 2) {
                this.onMouseRightDown(x, y, evt)
            }
        } else if (evt.type == 'mousemove') {
            this.onMouseMove(x, y)
        } else if (evt.type == 'mouseup') {
            if(evt.button == 0) {
                this.onMouseLeftUp(x, y)
            }
        }
    }

    public onKeydownEvent(evt: KeyboardEvent) {
        if (this.a.showme) {
            if (evt.code == 'ArrowUp') {
                this.a.showme.onAction(true, EKeyId.ArrowUp)
            } else if (evt.code == 'ArrowDown') {
                this.a.showme.onAction(true, EKeyId.ArrowDown)
            } else if (evt.code == 'ArrowLeft') {
                this.a.showme.onAction(true, EKeyId.ArrowLeft)
            } else if (evt.code == 'ArrowRight') {
                this.a.showme.onAction(true, EKeyId.ArrowRight)
            } else if (evt.code == 'KeyC') {
                this.a.showme.onAction(true, EKeyId.ColorMode)
            } else if (evt.code == 'KeyN') {
                this.a.showme.onAction(true, EKeyId.ToggleConnection)
            } else if (evt.code == 'KeyI') {
                this.a.showme.onAction(true, EKeyId.ZoomIn)
            } else if (evt.code == 'KeyO') {
                this.a.showme.onAction(true, EKeyId.ZoomOut)
            }
        }
    }

    public onKeyupEvent(evt: KeyboardEvent) {
        if (this.a.showme) {
            if (evt.code == 'ArrowUp') {
                this.a.showme.onAction(false, EKeyId.ArrowUp)
            } else if (evt.code == 'ArrowDown') {
                this.a.showme.onAction(false, EKeyId.ArrowDown)
            } else if (evt.code == 'ArrowLeft') {
                this.a.showme.onAction(false, EKeyId.ArrowLeft)
            } else if (evt.code == 'ArrowRight') {
                this.a.showme.onAction(false, EKeyId.ArrowRight)
            } else if (evt.code == 'KeyI') {
                this.a.showme.onAction(false, EKeyId.ZoomIn)
            } else if (evt.code == 'KeyO') {
                this.a.showme.onAction(false, EKeyId.ZoomOut)
            }
        }
    }
}

