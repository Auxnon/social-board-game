import * as THREE from "./lib/three.module.js";
import * as IK from './lib/three-ik.js';

import * as Render from "./Render.js";
import * as Control from "./Control.js";

var iks=[];
var pivot
var movingTarget
var host
function init(){


	window.addEventListener('keyup',ev=>{
		if(ev.which=='87'){
			
			if(window.lastMesh){
				makeSpline(window.lastMesh)
			}
		}
	})
}
function makeSpline(target){
	host=target
		let ik = new IK.IK();
		let chain = new IK.IKChain();
	let constraints = [new IK.IKBallConstraint(90)];
	

// Create a target that the IK's effector will reach
// for.

//const movingTarget = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
//movingTarget.position.z = 2;


// Create a chain of THREE.Bone's, each wrapped as an IKJoint
// and added to the IKChain


//lastMesh.children[0].children[0].children[0].children[0].children[1].children[0]
movingTarget = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
movingTarget.position.z = 0.75;
pivot = new THREE.Object3D();
pivot.add(movingTarget);
Render.addModel(pivot)

target.children.forEach(obj=>{
	if(obj.type=='Bone'){
		walkBone(obj,chain,constraints,0)
	}else if(obj.type=='Object3D'){
		walkBone(obj.children[0],chain,constraints,0)
		
	}
})
/*
for (let i = 0; i < 10; i++) {
  const bone = new THREE.Bone();
  bone.position.y = i === 0 ? 0 : 0.5;

  if (bones[i - 1]) { bones[i - 1].add(bone); }
  bones.push(bone);

  // The last IKJoint must be added with a `target` as an end effector.
  const target = i === 9 ? movingTarget : null;
  chain.add(new IK.IKJoint(bone, { constraints }), { target });
}*/

// Add the chain to the IK system
ik.add(chain);
//target.add(ik.getRootBone());


// Create a helper and add to the scene so we can visualize
// the bones
const helper = new IK.IKHelper(ik);
Render.addModel(helper);
window.ikhelper=helper;
iks.push(ik)

}

function walkBone(bone,chain,constraints,iterator){
	if(bone && bone.type=='Bone'){
		let nextBone;
		let target
		console.log('chickn bone '+bone.name)
		if(bone.children && bone.children.length>0){
			if(bone.children.length>1 && bone.name=='spine005')
				nextBone=bone.children[1]
			else 
				nextBone=bone.children[0]
		}else{
			target=Render.getCursor()//movingTarget
		}
		if(iterator>1){
			if(iterator==2)
				bone.position.z-=0.1
			chain.add(new IK.IKJoint(bone, { constraints }), { target });
		}
		if(nextBone)
			walkBone(nextBone,chain,constraints,iterator+1)
	}
}

function animate(){
	if(iks && iks.length>0 && pivot){

		//pivot.position.set(Control.x(),Control.y(),Control.z())
		iks.forEach(ik=>{
			ik.solve();
		})

	}
}

export {init,animate}