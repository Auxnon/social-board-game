import * as THREE from "./lib/three.module.js";

import * as Render from "./Render.js";

var scene;
var camera;
var testToggle=true;

function init(){
	scene=new THREE.Scene();
	    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 200; //400
    camera.position.y = -200; //-800
    camera.up = new THREE.Vector3(0, 0, 1)

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    let m=Render.cubic(100,100,1)
    scene.add(m)
}

function make(){
	let pic= document.createElement('img');
    pic.className='portrait'
    pic.setAttribute('src', Render.bufferPrint(scene,camera));
    document.body.addChild(pic);

}
function test(){
	if(testToggle)
		Render.toggleScene(scene,camera);
	else
		Render.toggleScene();
	testToggle=!testToggle;

}

export {init,make,test}