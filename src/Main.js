import * as Render from "./Render.js";
import * as CANNON from "./lib/cannon.min.js";

var dt = 1 / 20;

function init(){
	initCannon();
	let canvas=Render.init();
	document.querySelector('#main').appendChild(canvas)


	window.addEventListener('click',function(ev){
		make();
	})





}init();

var bodies;
var meshes;
var world;
var playerPhysic;


function initCannon(){
			let N =1;
			bodies=[];
			meshes=[];
            // Setup our world
            world = new CANNON.World();
            world.quatNormalizeSkip = 0;
            world.quatNormalizeFast = false;

            world.gravity.set(0,0,-10);
            world.broadphase = new CANNON.NaiveBroadphase();

            // Create boxes
            let mass = 5, radius = 1.3;
            let boxShape = new CANNON.Box(new CANNON.Vec3(5,5,10));
            for(let i=0; i<N; i++){
                let boxBody = new CANNON.Body({ mass: mass });
                boxBody.addShape(boxShape);
                boxBody.position.set(0,0,100);
                world.addBody(boxBody);
                //boxBody.angularDamping=0.8 //really high
                playerPhysic=boxBody
                //bodies.push(boxBody);
            }

            // Create a plane
            let groundShape = new CANNON.Plane();
            let groundBody = new CANNON.Body({ mass: 0 });
            groundBody.addShape(groundShape);
            groundBody.position.set(0,0,25)
           // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
            world.addBody(groundBody);

            // Joint body
            let shape = new CANNON.Sphere(0.1);
            let jointBody = new CANNON.Body({ mass: 0 });
            jointBody.addShape(shape);
            jointBody.collisionFilterGroup = 0;
            jointBody.collisionFilterMask = 0;
            world.addBody(jointBody)
        }

function make(){
	let size={x:10,y:10,z:10}
	let boxShape = new CANNON.Box(new CANNON.Vec3(size.x/2,size.y/2,size.z/2));
	let boxBody = new CANNON.Body({ mass: 5 });
    boxBody.addShape(boxShape);
    boxBody.position.set(Math.random()*50,Math.random()*50,40)
    world.addBody(boxBody);
    //boxBody.angularDamping=0.8 //really high
    bodies.push(boxBody);
    let cube=Render.cubic(size.x,size.y,size.z);
    meshes.push(cube)

    Render.addModel(cube)

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
            }

            Render.player.position.copy(playerPhysic.position);
            Render.player.quaternion.copy(playerPhysic.quaternion);
            //console.log(Render.player.position)
        }

export { updatePhysics}