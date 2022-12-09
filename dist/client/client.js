import { a } from './globals';
import { CApp } from './app';
let app;
function main() {
    //global.devicePixelRatio = 1;
    let myElement = document.getElementById('myElement');
    app = new CApp(document.querySelector("#bancan"));
    window['pzlapp'] = app;
}
main();
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    var canvas = document.querySelector("#bancan");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const bounds = canvas.getBoundingClientRect();
    if (a.gl) {
        a.gl.viewport(0, 0, bounds.width, bounds.height);
    }
    if (a.pcamera) {
        a.pcamera.update();
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
