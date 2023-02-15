
import { CApp } from './app'
import { showOpenFilePicker } from 'file-system-access'
let app : CApp;

var clickgeo = document.getElementById("clickgeo");
if (clickgeo) clickgeo.addEventListener("click", loadGeoState, false);
async function loadGeoState() {
    let fileHandle: FileSystemFileHandle;
    try {
        if (window.showOpenFilePicker) {
            console.log('Using native window.showOpenFilePicker');
            [fileHandle] = await window.showOpenFilePicker();
        } else {
            console.log('Using polyfile version of showOpenFilePicker');
            [fileHandle] = await showOpenFilePicker();
        }
    } catch (err) {
        console.log(err);
        console.log('User cancelled request, or problem loading file.  Gracefully exiting loadState');
        return;
    }

    console.log('fileHandle: ', fileHandle);
    document.getElementById("clickdiv").style.display = "none";
    document.getElementById("instructions").style.visibility = 'visible';
    document.getElementById("overlayLeft").style.visibility = 'visible';
    document.getElementById("gradient").style.visibility = 'visible';

    app = new CApp(document.querySelector("#bancan"), fileHandle)
    window['showmeapp'] = app;
}

window.addEventListener('resize', onWindowResize, false);

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
    if (app) app.render();
    requestAnimationFrame(animate);
};

animate();
