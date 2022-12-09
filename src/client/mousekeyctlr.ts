
//import { ICtlr } from './ctlr'
import { EKeyId } from './core'
import { CApp } from './app'
import { a } from './globals'

export class CMousekeyCtlr {
	a: CApp
	// private rightMouseDown: boolean

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
		/*window.addEventListener('wheel', (evt) => {
			self.onWheelEvent(evt)
		})*/
	}

	public onMouseLeftDown(x: number, y: number) {
		this.a.p.handleClick(x, y)
	}

	public onMouseRightDown(x: number, y: number, evt: MouseEvent) {
	}

	public onMouseMiddleDown(x: number, y: number) {
		console.log('onMouseMiddleDown')
	}

	public onMouseMove(x: number, y: number) {
	}
	public onMouseLeftUp(x: number, y: number) {
		this.a.p.handleClickRelease(x, y)
	}


	public onMouseEvent(evt: MouseEvent) {
		if (window['inPuzzleButton']) {
			return
		}
		if (!this.a.p) {
			return
		}

		if (this.a.p.mouseIsOut && (evt.offsetX || evt.offsetY)) {
			console.log('mouseover ---------------------------------buttons: ' + evt.buttons)
			this.a.p.mouseIsOut = false
			// check left button
			if (!(evt.buttons & 1)) {
				this.a.p.handleClickRelease(evt.offsetX, evt.offsetY)
			}
			return
		}
		if (!evt.offsetX && !evt.offsetY) {
			console.log('mouseout ---------------------------------buttons: ' + evt.buttons)
			this.a.p.mouseIsOut = true
			return
		}


		let x = evt.offsetX;
		let y = evt.offsetY;
		//let ctrlKey = evt.ctrlKey
		//let alt = evt.altKey
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
		let keynum = -1
		let keystring: string = null
		if (evt.keyCode >= 48 && evt.keyCode <= 57) {
			keynum = evt.keyCode - 48
		} else if (evt.keyCode >= 64 && evt.keyCode <= 90) {
			keystring = evt.key
		}

		if (this.a.p) {
			console.log('got evt.code ' + evt.code) 
			if (evt.code == 'ArrowUp') {
				this.a.p.onAction(true, EKeyId.ArrowUp)
			} else if (evt.code == 'ArrowDown') {
				this.a.p.onAction(true, EKeyId.ArrowDown)
			} else if (evt.code == 'ArrowLeft') {
				this.a.p.onAction(true, EKeyId.ArrowLeft)
			} else if (evt.code == 'ArrowRight') {
				this.a.p.onAction(true, EKeyId.ArrowRight)
			} else if (evt.code == 'KeyI') {
				this.a.p.onAction(true, EKeyId.ZoomIn)
			} else if (evt.code == 'KeyO') {
				this.a.p.onAction(true, EKeyId.ZoomOut)
			}
		}
	}

	public onKeyupEvent(evt: KeyboardEvent) {
		let keynum = -1
		let keystring: string = null
		if (evt.keyCode >= 48 && evt.keyCode <= 57) {
			keynum = evt.keyCode - 48
		} else if (evt.keyCode >= 64 && evt.keyCode <= 90) {
			keystring = evt.key
		}

		if (this.a.p) {
			if (evt.code == 'ArrowUp') {
				this.a.p.onAction(false, EKeyId.ArrowUp)
			} else if (evt.code == 'ArrowDown') {
				this.a.p.onAction(false, EKeyId.ArrowDown)
			} else if (evt.code == 'ArrowLeft') {
				this.a.p.onAction(false, EKeyId.ArrowLeft)
			} else if (evt.code == 'ArrowRight') {
				this.a.p.onAction(false, EKeyId.ArrowRight)
			} else if (evt.code == 'KeyI') {
				this.a.p.onAction(false, EKeyId.ZoomIn)
			} else if (evt.code == 'KeyO') {
				this.a.p.onAction(false, EKeyId.ZoomOut)
			}
		}
	}

}

