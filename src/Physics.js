import * as Main from "./Main.js";
import * as Control from "./Control.js";
import * as Render from "./Render.js";
import * as CANNON from "./lib/cannon.min.js";

var gooProperty;
var wallProperty;

var bodies;
var meshes;
var particles;
var bullets;
var world;
var playerBody;
var orientation = 0;

const dt = 1 / 100; //1/20

function init() {
    let N = 1;
    bodies = [];
    meshes = [];
    particles = [];
    bullets = [];
   
    // Setup our world
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    //world.gravity.set(0,0,-10);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create boxes
    let mass = 4,
        radius = 1.3;
    let boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 2));
    for(let i = 0; i < N; i++) {
        let boxBody = new CANNON.Body({ mass: mass });
        boxBody.addShape(boxShape);
        boxBody.position.set(0, 0, 60);
        world.addBody(boxBody);
        //boxBody.angularDamping=0.8 //really high
        playerBody = boxBody
        window.playerBody = playerBody
        //playerBody.angularDamping=1
        //bodies.push(boxBody);
    }


    /*
            // Create a plane
            let groundShape = new CANNON.Plane();
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

    //debugger
    /*var gooWallPhysics = new CANNON.ContactMaterial(gooProperty,
                                                            wallProperty,
                                                            1, // friction coefficient
                                                            0  // restitution
                                                            );*/
    // We must add the contact materials to the world
    //world.addContactMaterial(gooWallPhysics);


    gooProperty = new CANNON.Material({ name: "gooProperty", friction: 10.0, restitution: -1.0 });
    gooProperty.name = "gooProperty"
    //gooProperty.friction=1

    wallProperty = new CANNON.Material({ name: "wallProperty", friction: 0.1, restitution: 1 });
    wallProperty.name = "wallProperty"


     makeFloor();

}

var count = 0;

function makeBullet() {
    let fireSpeed = 12;

    let boxBody;
    if(bullets.length > 30) {
        boxBody = bullets.shift();
        bullets.push(boxBody)
        //boxBody.arrayIndex=
        boxBody.collisionResponse = true;
        boxBody.wakeUp();


    } else {


        let size = { x: .4, y: .4, z: .4 }
        let boxShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        boxBody = new CANNON.Body({ mass: 2 });
        boxBody.addShape(boxShape);
        bodies.push(boxBody);

        boxBody.bullet = true;

        bullets.push(boxBody)


        let cube = Render.cubic(size.x, size.y, size.z, 0, 0, 0, Render.yellow);
        meshes.push(cube)

        Render.addModel(cube)
        world.addBody(boxBody);


    }


    let v = new THREE.Vector3(0, 0, 0)
    let speed = new THREE.Vector3(0, 0, 0)


    let xx = -Math.sin(orientation)
    let yy = Math.cos(orientation)

    v.x = xx * 1.5
    v.y = yy * 1.5
    speed.x = fireSpeed * xx;
    speed.y = fireSpeed * yy;


    v.add({ x: rand(.2), y: rand(.2), z: rand(.2) })


    //v.applyQuaternion(Render.player.quaternion)
    v.add(Render.player.position)
    boxBody.position.copy(v)
    boxBody.quaternion.copy(Render.player.quaternion)

    //speed.applyQuaternion(Render.player.quaternion)
    boxBody.velocity.copy(speed)

    let opposite = new THREE.Vector3(-0.05 * speed.x, -0.05 * speed.y, -0.05 * speed.z)
    //opposite.applyQuaternion(Render.player.quaternion)
    opposite.add(playerBody.velocity);

    playerBody.velocity.copy(opposite)


    //boxBody.angularDamping=0.8 //really high
    count++;

}

function makeBlood(p, v) {
    let boxBody;
    if(count > 100) {
        boxBody = particles.shift();
        particles.push(boxBody)
        boxBody.collisionResponse = true;
    } else {

        let size = { x: .4, y: .4, z: .4 }
        let boxShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        boxBody = new CANNON.Body({ mass: 0.01, material: gooProperty });
        boxBody.addShape(boxShape);
        bodies.push(boxBody);

        particles.push(boxBody)

        //let cube=Render.cubic(size.x,size.y,size.z,0,0,0,Render.blood);
        let sphere = new THREE.SphereGeometry(.35, 5, 3)
        let orb = new THREE.Mesh(sphere, Render.blood);
        meshes.push(orb)

        Render.addModel(orb)
        world.addBody(boxBody);
    }
    boxBody.position.copy(p.position)
    if(v)
        boxBody.velocity.copy(v)

    boxBody.addEventListener("collide", ev => {
        if(ev.body.material) {
            if(ev.body.material.name == 'wallProperty') {
                boxBody.collisionResponse = false;
                boxBody.sleep();
            }
        }
    })

}


function makeMan() {
    let size = { x: 1, y: 1, z: 2 }
    let boxShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    let boxBody = new CANNON.Body({ mass: 8 });
    boxBody.addShape(boxShape);
    bodies.push(boxBody);
    boxBody.angularDamping = 1
    boxBody.position.set(Control.x(), Control.y(), 20)


    boxBody.addEventListener("collide", ev => {
        if(ev.body.bullet) {
            if(ev.body.velocity.length() > 5) {
                boxBody.angularDamping = 0.01
                console.log('sht')
                makeBlood(boxBody, ev.body.velocity)
            }
        }
    })


    let cube = Render.cubic(size.x, size.y, size.z);
    meshes.push(cube)

    Render.addModel(cube)
    world.addBody(boxBody);
}

function makeFloor() {
    let groundShape = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    world.addBody(groundBody);
}

function applyQuaternion(v, q) { //ripped from threejs because i didnt feel like converting between cannojs types


    const x = v.x,
        y = v.y,
        z = v.z;
    const qx = q.x,
        qy = q.y,
        qz = q.z,
        qw = q.w;

    // calculate quat * vector

    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat

    v.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    v.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    v.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return v;
}

function updatePhysics() {
    /*bodies[0].position.set(point.x,point.y,point.z)
    bodies[0].velocity.set(0,0,0)
    bodies[0].angularDamping=1
    bodies[0].inertia.set(0,0,0)*/

    world.step(dt);



    for(var i = 0; i !== bodies.length; i++) {
    	if(bodies[i].id!=undefined){
    		let m=meshArray[bodies[i].id]
    		m.position.copy(bodies[i].position);
        	m.quaternion.copy(bodies[i].quaternion);
    	}
    	
       
        if(bodies[i].position.z < -100) {
            bodies[i].position.set(Math.random() * 80 - 40, Math.random() * 80 - 40, 100)

            bodies[i].velocity.set(0, 0, 0)
            bodies[i].collisionResponse = false;
            bodies[i].sleep();
        }

    }

    let r = Control.getAngle();
    let vd = playerBody.velocity.length()
    if(Main.controls.left) {
        //if(playerBody.velocity.x>-40)
        //playerBody.velocity.x-=4
        if(vd < 2) {
            playerBody.velocity.x -= Math.cos(r) * 2
            playerBody.velocity.y -= Math.sin(r) * 2
        }
        orientation = r + Math.PI / 2
        playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), orientation);

    } else if(Main.controls.right) {
        //if(playerBody.velocity.x<40)
        if(vd < 2) {
            playerBody.velocity.x += Math.cos(r) * 2
            playerBody.velocity.y += Math.sin(r) * 2
        }
        orientation = r - Math.PI / 2;
        playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), orientation);

    } else if(Main.controls.up) {
        //if(playerBody.velocity.y<40)
        if(vd < 2) {
            playerBody.velocity.x -= Math.sin(r) * 2
            playerBody.velocity.y += Math.cos(r) * 2
        }
        orientation = r
        playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), orientation);

    } else if(Main.controls.down) {
        //if(playerBody.velocity.y>-40)
        if(vd < 2) {
            playerBody.velocity.x += Math.sin(r) * 2
            playerBody.velocity.y -= Math.cos(r) * 2
        }
        orientation = r + Math.PI
        playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), orientation);

    }
    Render.player.position.copy(playerBody.position);
    Render.player.quaternion.copy(playerBody.quaternion);
    //console.log(Render.player.position)
}


function setPlayer(position, quaternion, velocity) {
    if(position && quaternion && velocity) {
        playerBody.position.copy(position);
        playerBody.quaternion.copy(quaternion);
        playerBody.velocity.copy(velocity);
    }
}




///ONLINE

var physIDs=[];
var physArray=[]
var meshArray=[]

function makePhys(id,size, mass, pos) {
    let body = new CANNON.Body({ mass: mass });
    let boxShape = new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z));

    body.addShape(boxShape);
    body.position.set(pos.x, pos.y, pos.z);
    
    body.id = id;
    physIDs.push(id)
    physArray[id] = body;
    bodies.push(body)
    world.addBody(body);

    let mesh=Render.cubic(size,size,size,pos.x,pos.y,pos.z)
    Render.addModel(mesh)
    meshArray[id]=mesh
}



function syncOnline(data){
	data.forEach(stuff=>{
		let p=physArray[stuff[0]];
		p.position.copy(stuff[1])
		p.quaternion.copy(stuff[2])
		p.velocity.copy(stuff[3])
	})
}


function clearPhys(){
	meshArray.forEach(m=>{
		Render.removeModel(m);
	})
	meshArray=[];
	bodies.forEach(p=>{
		world.remove(p);
	})
	bodies=[]
	physIDs=[]
	physArray=[];
}

export { init,updatePhysics, setPlayer,makePhys,clearPhys,syncOnline }