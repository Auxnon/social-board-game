import * as Render from "./Render.js";

function init(){

Render.loadModel('./assets/models/Hex.glb',m=>{
	console.log('got children '+m.children.length)
	for(let i=0;i<m.children.length;i++){
		//Render.addModel(m.children[i])
		m.children[i]
		Render.addModel(m.children[i])
		m.children[i].scale.set(200,200,200)
	}
 	
	window.m=m;//.children[0]
})

}

export {init}