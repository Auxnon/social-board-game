import * as THREE from "./lib/three.module.js";
import * as Render from "./Render.js";
import * as CANNON from "./lib/cannon.min.js";

var dt = 1 / 20;

function init(){
	initCannon();
	let canvas=Render.init();
	document.querySelector('#main').appendChild(canvas)


	window.addEventListener('click',function(ev){
		 //for(let i=0; i<100; i++){
	            make()
	       // }
	})





}init();

var bodies;
var meshes;
var world;
var playerBody;
var controls


function initCannon(){
			let N =1;
			bodies=[];
			meshes=[];
			controls={};
            // Setup our world
            world = new CANNON.World();
            world.quatNormalizeSkip = 0;
            world.quatNormalizeFast = false;

            world.gravity.set(0,0,-10);
            world.broadphase = new CANNON.NaiveBroadphase();

            // Create boxes
            let mass = 4, radius = 1.3;
            let boxShape = new CANNON.Box(new CANNON.Vec3(5,5,10));
            for(let i=0; i<N; i++){
                let boxBody = new CANNON.Body({ mass: mass });
                boxBody.addShape(boxShape);
                boxBody.position.set(0,0,60);
                world.addBody(boxBody);
                //boxBody.angularDamping=0.8 //really high
                playerBody=boxBody
                window.playerBody=playerBody
                //bodies.push(boxBody);
            }



            // Create a plane
            let groundShape = new CANNON.Plane();
            let c=40
            let points=[
            new CANNON.Vec3(-c,-c,0),new CANNON.Vec3(-c,c,0),new CANNON.Vec3(c,c,0),new CANNON.Vec3(c,-c,0),
            new CANNON.Vec3(-c,-c,80),new CANNON.Vec3(-c,c,80),new CANNON.Vec3(c,c,80),new CANNON.Vec3(c,-c,80)
            ]
            let faces=[[3,2,1,0],[4,5,1,0]]//,  ,  [2,3,6,7]] //
            let box = new CANNON.ConvexPolyhedron(points,faces);


            let groundBody = new CANNON.Body({ mass: 0 });
            groundBody.addShape(box);
            groundBody.position.set(0,0,25)
           // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
            world.addBody(groundBody);

            // Joint body
            /*let shape = new CANNON.Sphere(0.1);
            let jointBody = new CANNON.Body({ mass: 0 });
            jointBody.addShape(shape);
            jointBody.collisionFilterGroup = 0;
            jointBody.collisionFilterMask = 0;
            world.addBody(jointBody)*/




            window.addEventListener('keydown',ev=>{
            	console.log(ev.keyCode)
            	switch(ev.keyCode){
            		case 37: case 65: controls.left=true;break;//left
            		case 39: case 68: controls.right=true;break;//right
            		case 38: case 87:  controls.up=true;break;//up
            		case 40: case 83: controls.down=true;break;//down
            		case 32: make();break;
            	}

            	

            })
             window.addEventListener('keyup',ev=>{
             		switch(ev.keyCode){
            		case 37: case 65: controls.left=false;break;//left
            		case 39: case 68: controls.right=false;break;//right
            		case 38: case 87:  controls.up=false;break;//up
            		case 40: case 83: controls.down=false;break;//down
            	}
             })


            
        }

function make(){
	let size={x:10,y:10,z:10}
	let boxShape = new CANNON.Box(new CANNON.Vec3(size.x/2,size.y/2,size.z/2));
	let boxBody = new CANNON.Body({ mass: 2 });
    boxBody.addShape(boxShape);


    let v=new THREE.Vector3(0,0,15)
    v.applyQuaternion(Render.player.quaternion)
   	v.add(Render.player.position)
   	boxBody.position.copy(v)
   	boxBody.quaternion.copy(Render.player.quaternion)

   	let speed=new THREE.Vector3(0,0,40)
   	speed.applyQuaternion(Render.player.quaternion)
   	boxBody.velocity.copy(speed)

   	let opposite=new THREE.Vector3(0,0,-20)
   	opposite.applyQuaternion(Render.player.quaternion)
   	opposite.add(playerBody.velocity);
   	playerBody.velocity.copy(opposite)
    
    world.addBody(boxBody);

    //boxBody.angularDamping=0.8 //really high
    bodies.push(boxBody);
    let cube=Render.cubic(size.x,size.y,size.z);
    meshes.push(cube)

    Render.addModel(cube)

}
function applyQuaternion(v,q){ //ripped from threejs because i didnt feel like converting between cannojs types


		const x = v.x, y = v.y, z = v.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix = qw * x + qy * z - qz * y;
		const iy = qw * y + qz * x - qx * z;
		const iz = qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		v.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		v.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		v.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return v;
}

        function updatePhysics(){
            /*bodies[0].position.set(point.x,point.y,point.z)
            bodies[0].velocity.set(0,0,0)
            bodies[0].angularDamping=1
            bodies[0].inertia.set(0,0,0)*/

            world.step(dt);

            

            for(var i=0; i !== meshes.length; i++){
                meshes[i].position.copy(bodies[i].position);
                meshes[i].quaternion.copy(bodies[i].quaternion);
                if(bodies[i].position.z<-100){
                	bodies[i].position.set(Math.random()*80 -40,Math.random()*80 -40,100)

                	bodies[i].velocity.set(0,0,0)
                }

            }


            if(controls.left){
            	if(playerBody.velocity.x>-10)
            			playerBody.velocity.x-=1
            }else if(controls.right){
            	if(playerBody.velocity.x<10)
            			playerBody.velocity.x+=1
            }else if(controls.up){
            	if(playerBody.velocity.y<10)
            			playerBody.velocity.y+=1
            }else if(controls.down){
            	if(playerBody.velocity.y>-10)
            			playerBody.velocity.y-=1
            }
            Render.player.position.copy(playerBody.position);
            Render.player.quaternion.copy(playerBody.quaternion);
            //console.log(Render.player.position)
        }

export { updatePhysics}