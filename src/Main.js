import * as THREE from "./lib/three.module.js";
import * as Render from "./Render.js";
import * as HexManager from "./HexManager.js";
import * as Control from "./Control.js";
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


    makeRoom(200,220,80,10)

    HexManager.init();
    Control.init();




}init();

var bodies;
var meshes;
var particles;
var bullets;
var world;
var playerBody;
var controls
var orientation=0;

var gooProperty;
var wallProperty;


function initCannon(){
			let N =1;
			bodies=[];
			meshes=[];
            particles=[];
            bullets=[];
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
                playerBody.angularDamping=1
                //bodies.push(boxBody);
            }



            // Create a plane
            /*let groundShape = new CANNON.Plane();
            let c=40
            let h=150
            let points=[
            new CANNON.Vec3(-c,-c,0),new CANNON.Vec3(-c,c,0),new CANNON.Vec3(c,c,0),new CANNON.Vec3(c,-c,0),
            new CANNON.Vec3(-c,-c,h),new CANNON.Vec3(-c,c,h),new CANNON.Vec3(c,c,h),new CANNON.Vec3(c,-c,h)
            ]
            let faces=[[4,7,6,5]]//[[3,2,1,0],[4,5,0,1],[6,7,3,2],[0,3,7,4],[2,1,5,6],[4,7,6],[6,5,4]]//,  ,   [2,3,6,7]] //
            let box = new CANNON.ConvexPolyhedron(points,faces);
            */
            /*let groundBody = new CANNON.Body({ mass: 0 });
            groundBody.addShape(box);
            groundBody.position.set(0,0,25)
           // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
            world.addBody(groundBody);*/

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
            		case 37: case 65: controls.left=true;orientation=1;break;//left
            		case 39: case 68: controls.right=true;orientation=3;break;//right
            		case 38: case 87:  controls.up=true;orientation=0;break;//up
            		case 40: case 83: controls.down=true;orientation=2;break;//down
            		case 32: make(); break;
                    case 66: for(let ii=0;ii<12;ii++){make();} break;
                    case 71: makeMan();break;
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
            gooProperty = new CANNON.Material({name: "gooProperty",friction: 10.0,restitution:-1.0});
            gooProperty.name="gooProperty"
            //gooProperty.friction=1

            wallProperty = new CANNON.Material({name: "wallProperty",friction: 0.1,restitution:1});
            wallProperty.name="wallProperty"
            //debugger
             /*var gooWallPhysics = new CANNON.ContactMaterial(gooProperty,
                                                                     wallProperty,
                                                                     1, // friction coefficient
                                                                     0  // restitution
                                                                     );*/
             // We must add the contact materials to the world
             //world.addContactMaterial(gooWallPhysics);


            
        }
        let count=0;

function make(){
    let fireSpeed=160;

    let boxBody;
    if(bullets.length>30){
        boxBody=bullets.shift();
        bullets.push(boxBody)
        //boxBody.arrayIndex=
        boxBody.collisionResponse=true;
        boxBody.wakeUp();


    }else{


	let size={x:4,y:4,z:4}
	let boxShape = new CANNON.Box(new CANNON.Vec3(size.x/2,size.y/2,size.z/2));
	boxBody = new CANNON.Body({ mass: 2 });
    boxBody.addShape(boxShape);
    bodies.push(boxBody);

    boxBody.bullet=true;

    bullets.push(boxBody)


    let cube=Render.cubic(size.x,size.y,size.z,0,0,0,Render.yellow);
    meshes.push(cube)

    Render.addModel(cube)
    world.addBody(boxBody);


}


    let v=new THREE.Vector3(0,0,0)
    let speed=new THREE.Vector3(0,0,0)

    if(orientation==1){
        v.x-=15;speed.x-=fireSpeed;
        v.add({x:0,y:rand(2),z:rand(2)})
    }
    if(orientation==3){
        v.x+=15;speed.x+=fireSpeed;
        v.add({x:0,y:rand(2),z:rand(2)})
    }

    if(orientation==0){
        v.y+=15;speed.y+=fireSpeed;
        v.add({x:rand(2),y:0,z:rand(2)})


    }
    if(orientation==2){
        v.y-=15;speed.y-=fireSpeed;
        v.add({x:rand(2),y:0,z:rand(2)})

    }


    //v.applyQuaternion(Render.player.quaternion)
   	v.add(Render.player.position)
   	boxBody.position.copy(v)
   	boxBody.quaternion.copy(Render.player.quaternion)

   	//speed.applyQuaternion(Render.player.quaternion)
   	boxBody.velocity.copy(speed)

   	let opposite=new THREE.Vector3(-0.1*speed.x,-0.1*speed.y,-0.1*speed.z)
   	//opposite.applyQuaternion(Render.player.quaternion)
   	opposite.add(playerBody.velocity);

   	playerBody.velocity.copy(opposite)
    

    //boxBody.angularDamping=0.8 //really high
    count++;

}
function makeBlood(p,v) {
let boxBody;
    if(count>100){
        boxBody=particles.shift();
        particles.push(boxBody)
        boxBody.collisionResponse=true;
    }else{

    let size={x:4,y:4,z:4}
    let boxShape = new CANNON.Box(new CANNON.Vec3(size.x/2,size.y/2,size.z/2));
    boxBody = new CANNON.Body({ mass: 0.01 ,material: gooProperty});
    boxBody.addShape(boxShape);
    bodies.push(boxBody);

    particles.push(boxBody)

    //let cube=Render.cubic(size.x,size.y,size.z,0,0,0,Render.blood);
    let sphere=new THREE.SphereGeometry(3.5,5,3)
    let orb = new THREE.Mesh( sphere, Render.blood );
    meshes.push(orb)

    Render.addModel(orb)
    world.addBody(boxBody);
    }
    boxBody.position.copy(p.position)
    if(v)
        boxBody.velocity.copy(v)

    boxBody.addEventListener("collide",ev=>{
        if(ev.body.material){
            if(ev.body.material.name=='wallProperty'){
           boxBody.collisionResponse=false;
           boxBody.sleep();
         }
        }
    })

}


function makeMan() {
    let size={x:10,y:10,z:20}
    let boxShape = new CANNON.Box(new CANNON.Vec3(size.x/2,size.y/2,size.z/2));
    let boxBody = new CANNON.Body({ mass: 8 });
    boxBody.addShape(boxShape);
    bodies.push(boxBody);
    boxBody.angularDamping=1


    boxBody.addEventListener("collide",ev=>{
        if(ev.body.bullet){
           if(ev.body.velocity.length()>50){
            boxBody.angularDamping=0.01
            console.log('sht')
            makeBlood(boxBody,ev.body.velocity)
           }
        }
    })


    let cube=Render.cubic(size.x,size.y,size.z);
    meshes.push(cube)

    Render.addModel(cube)
    world.addBody(boxBody);

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
                    bodies[i].collisionResponse=false;
                    bodies[i].sleep();
                }

            }


            if(controls.left){
            	if(playerBody.velocity.x>-40)
            			playerBody.velocity.x-=4
                playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), Math.PI/2);

            }else if(controls.right){
            	if(playerBody.velocity.x<40)
            			playerBody.velocity.x+=4
                playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), 3*Math.PI/2);

            }else if(controls.up){
            	if(playerBody.velocity.y<40)
            			playerBody.velocity.y+=4
                playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), 0);

            }else if(controls.down){
            	if(playerBody.velocity.y>-40)
            			playerBody.velocity.y-=4
                playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), Math.PI);

            }
            Render.player.position.copy(playerBody.position);
            Render.player.quaternion.copy(playerBody.quaternion);
            //console.log(Render.player.position)
        }

function makeRoom(w,d,h,t){
    let body = new CANNON.Body({ mass: 0 ,material: wallProperty});

    let xWall = new CANNON.Box(new CANNON.Vec3(t/2,d,h));
    let yWall = new CANNON.Box(new CANNON.Vec3(w,t/2,h));
    let zWall = new CANNON.Box(new CANNON.Vec3(w,d,t/2));



    body.addShape(xWall, new CANNON.Vec3( -w, 0,h/2));
    body.addShape(xWall, new CANNON.Vec3( w, 0,h/2));

    body.addShape(yWall, new CANNON.Vec3( 0, -d,h/2));
    body.addShape(yWall, new CANNON.Vec3( 0, d,h/2));

    body.addShape(zWall, new CANNON.Vec3( 0, 0,h));
    body.addShape(zWall, new CANNON.Vec3( 0, 0,0));
    world.addBody(body);

    let xm=Render.cubic(t,d*2,h,-w,0,h/2,Render.wood);
    let xm2=xm.clone()
    xm2.position.x=w;

    Render.addModel(xm)
    Render.addModel(xm2)

    let ym=Render.cubic(w*2,t,h,0,d,h/2,Render.wood);
    Render.addModel(ym)

    let zm=Render.cubic(w*2,d*2,t,0,0,0,Render.ground);
    Render.addModel(zm)

}
function rand(x){
    return (Math.random()*2 -1)*x
}

export { updatePhysics}