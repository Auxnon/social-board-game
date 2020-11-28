import * as THREE from "./lib/three.module.js";

import * as Render from "./Render.js";

var scene;
var camera;
var testToggle=true;

function init(){
	scene=new THREE.Scene();
	    camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.z = 200; //400
    camera.position.y = -200; //-800
    camera.up = new THREE.Vector3(0, 0, 1)

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var ambientLight = new THREE.AmbientLight( 0x8F8F8F ); // soft white light  0x404040
   scene.add( ambientLight );

    //let m=Render.cubic(100,100,1)
    //scene.add(m)
}

function make(m,size,offset){
    if(size)
        m.scale.set(size,size,size)
    else
        m.scale.set(75,75,75)

    if(offset)
        m.position.set(0,0,offset)
    else
        m.position.set(0,0,-75)

    scene.add(m)
	let pic= document.createElement('img');
    pic.className='hexPortrait'
    pic.setAttribute('src', Render.bufferPrint(scene,camera));
    //document.querySelector('#main').appendChild(pic);

    scene.remove(m)
    return pic;
}
function test(){
	if(testToggle)
		Render.toggleScene(scene,camera);
	else
		Render.toggleScene();
	testToggle=!testToggle;

}

export {init,make,test}