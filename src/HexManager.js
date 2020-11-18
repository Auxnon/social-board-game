import * as Render from "./Render.js";
import * as THREE from "./lib/three.module.js";

var hex=[]

function init(){

Render.loadModel('./assets/models/Hex.glb',m=>{
	console.log('got children '+m.children.length)
	let basicMat = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, metalness: 0, roughness: 1.0}); // 

	for(let i=0;i<m.children.length;i++){
		//m.children[i]
		let mm=m.children[i]
		//m.children[i].scale.set(200,200,200)
		mm.rotation.x=Math.PI/2
		mm.position.set(0,0,60)
		mm.scale.set(20,20,20)
    //mm.material= new THREE.MeshBasicMaterial( {color: 0x20E89F, side: THREE.FrontSide} );

		mm.material=basicMat
		//Render.addModel(mm)
		hex[mm.name]=mm;


	}
	window.hex=hex;
	window.land=land
 	
	//window.m=m;//.children[0]
})

}

function land(st,x,y) {
	let m=hex["Grass_"+st].clone();
	m.position.set(x,y,40)
	Render.addModel(m)

}

export {init}