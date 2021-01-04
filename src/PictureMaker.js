import * as THREE from "./lib/three.module.js";

import * as Render from "./Render.js";
import * as AssetManager from "./AssetManager.js";

var scene;
var camera;
var testToggle=true;
var cached=[];

var chunkCanvas
var chunkCtx


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
    ///
    chunkCanvas=document.createElement('Canvas')
    chunkCanvas.width=''+32*1.73*3
    chunkCanvas.height=''+32*3
    chunkCanvas.style.zIndex=99
    chunkCanvas.style.border='red solid 3px'
    chunkCanvas.style.position='absolute'
    chunkCanvas.style.top='0px'
    document.querySelector('#main').appendChild(chunkCanvas)
    chunkCtx = chunkCanvas.getContext('2d')
}

function make(m,size,offset){
    if(size)
        m.scale.set(size,size,size)
    else
        m.scale.set(110,110,110)

    if(offset)
        m.position.set(0,0,offset)
    else
        m.position.set(0,0,-30)

    scene.add(m)
	let val=Render.bufferPrint(scene,camera)
    //document.querySelector('#main').appendChild(pic);

    scene.remove(m)
    return val;
}
function generate(m,size,offset){
    let pic= document.createElement('img');
    pic.className='hexPortrait'
    pic.setAttribute('src', make(m,size,offset));
    return pic;
    //document.querySelector('#main').appendChild(pic);
}
function test(){
	if(testToggle)
		Render.toggleScene(scene,camera);
	else
		Render.toggleScene();
	testToggle=!testToggle;
}

function get(m,size,offset){
    let result=cached[m]
    if(result){
        return result
    }else{
        let model=AssetManager.make(m)
        result=make(model,size,offset)
        cached[m]=result
        return result
    }
}

var chunkCanvas
function processHexChunk(chunk){
    //let skew = 4  * Math.sqrt(3);
    let skew= Math.sqrt(3)
    //m.position.set((-HALF_GRID) + x * skew * 2 + y * skew, y * SCALE * 1.5, -SCALE * .2) //z -SCALE*.2

    chunkCtx.clearRect(0,0,+32*1.73*3,32*3);
    let data=chunk.grid
    for(let i=0;i<data.length;i++){
        for(let j=0;j<data.length;j++){
            let val=data[i][j]
            let color='black'
            switch(val){
                case 0: color='#3449CF';break; //water
                case 1: color='#2E4209';break; //grass   #2E4209 6CA90B
                case 3: color='#4C3200';break; //mountain
                case 4: color='#4F5822';break; //tree
                case 5: color='#594C40';break; //house
                case 6: color='#515157';break; //wall
            }

            chunkCtx.beginPath();
            chunkCtx.rect(Math.floor(j*skew+i*3*37.5/32), (data.length-j -1)*3, 5, 3);
            chunkCtx.fillStyle = color;
            chunkCtx.fill();
        }

    }
    let texture =new THREE.CanvasTexture( chunkCanvas)
    let material = new THREE.MeshBasicMaterial({ map : texture,transparent:true });
    let size=8*32*skew
    let plane = new THREE.Mesh(new THREE.PlaneGeometry(644.3229004156224, 372), material);
    console.log('actual ',chunk.actualX,chunk.actualY) //
    plane.position.set(chunk.actualX+644.3229004156224*2.5 +48,chunk.actualY+372/2,chunk.x%2==1?0.1:0) //644.3229004156224/2
    return plane
    //Render.addModel(plane)
}

export {init,make,get,generate,test,processHexChunk}