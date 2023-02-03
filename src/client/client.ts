
import { CApp } from './app'

let app : CApp;

function main() {
    app = new CApp(document.querySelector("#bancan"))
    window['showmeapp'] = app;
}

main()

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {

    var canvas: HTMLCanvasElement = document.querySelector("#bancan");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bounds = canvas.getBoundingClientRect();
    if (app.gl) {
        app.gl.viewport(0,0,bounds.width,bounds.height)
    }
    if (app.camera) {
        app.camera.update();
    }
}

window.addEventListener('contextmenu', function (e) { 
    e.preventDefault();
}, false);

var animate = function () {
    app.render();
    requestAnimationFrame(animate);
};

animate();
