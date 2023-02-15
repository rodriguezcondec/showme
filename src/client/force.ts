import { showOpenFilePicker } from 'file-system-access'
import ForceGraph3D from '3d-force-graph';
import { IState } from './core';


export async function loadForceState() {
    let fileHandle : FileSystemFileHandle;
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
    fileHandle.getFile().then( async (file) => {
        const contents = await file.text();
        handleStateText(contents);
    });
}

function handleStateText(text: string) {
    let istate : IState = JSON.parse(text);
    console.log('my istate: ', istate);
    const N = 300;
    let nodes = new Array();
    let links = new Array();
    let i = 0;
    for (let node of istate.nodes) {
        let id = 'id' + i.toString();
        let name = 'name' + i.toString();
        let group = (Math.floor(node.geolocation.longitude/10) + 18).toString();
        let ip = node.ip;
        let city = node.geolocation.city;
        nodes.push({id, name, ip, city, group});
        for (let connection of node.connections) {
            let cid = 'id' + connection.toString();
            let link = {
                source: id,
                target: cid
            }
            links.push(link);
        }
        i++;
    }
    const Data = {
        nodes, links
    }

    console.log('Data: ', Data);
    const Graph = ForceGraph3D()
    (document.getElementById('graph'))
        .linkVisibility(false)
        .nodeAutoColorBy('group')
        .nodeLabel(node => `${node['name']}: ${node['ip']} ${node['city']}`)
        .graphData(Data);
   

    Graph.onNodeClick(node => {
        Graph.linkVisibility((link) => {
            return link.source['name'] == node['name'];})
           });

}

var clickforce = document.getElementById("clickforce");
if (clickforce) clickforce.addEventListener("click", loadForceState, false);