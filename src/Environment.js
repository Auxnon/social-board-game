import * as THREE from "./lib/three.module.js";
import * as Render from "./Render.js";
var wind;

var debugLightHelper;
var sunLight;
var sunLight2;
var sunLight2;

var sunTarget;
var sunCenter;
var ambientLight;


var SHADOW_SIZE=2048;//2048*16;

let pi2=Math.PI*2;

let tempHeight=1;
let tempD=-0.001; //-0.004
let shadowMaxHeight;

function init(){
 
	wind=new THREE.Vector3(1,0,0);
	sunCenter=new THREE.Vector3(0,0,0);

	ambientLight = new THREE.AmbientLight( 0x8F8F8F ); // soft white light  0x404040
	Render.addModel2( ambientLight );

	//var directionalLight = new THREE.PointLight( 0xffffff, 1,100 );
	sunLight = new THREE.DirectionalLight( 0xE05757, 0.5 ); //DirectionalLight
	sunLight.position.set(0,250,0);
	sunLight.castShadow = true;
	Render.addModel2( sunLight );
	sunTarget=new THREE.Object3D();
	sunTarget.position.set(20,0,20);
	Render.addModel2( sunTarget );
	sunLight.target=sunTarget;


	sunLight.shadow.mapSize.width = SHADOW_SIZE;  // default
	sunLight.shadow.mapSize.height = SHADOW_SIZE; // default
	sunLight.shadow.camera.near = 1;    // default
	    // default
	
	changeShadowScale(0);

	sunLight.shadow.radius = 2.2;//2.2;
	sunLight.shadow.bias = -.0005;

	sunLight2=sunLight.clone();
	sunLight2.shadow.mapSize.width = 256;//256;  // default
	sunLight2.shadow.mapSize.height = 256;//256; // default
	sunLight2.shadow.radius = 0;

	sunLight2.visible=false;

	Render.addModel2(sunLight2);

	

	window.sunLight=sunLight;
	setLightHelper(true)

}

function changeShadowScale(factor){
	let d1;
	switch(factor){
		case 4:{ //yuge
			d1 = 600;
			sunLight.shadow.camera.far = 1200;
			sunLight.shadow.mapSize.width = SHADOW_SIZE;
			sunLight.shadow.mapSize.height= SHADOW_SIZE;
			shadowMaxHeight=200/2
			sunLight.position.z=600
		} break;
		case 3:{
			d1 = 300;
			sunLight.shadow.camera.far = 600; 
			sunLight.shadow.mapSize.width = SHADOW_SIZE;
			sunLight.shadow.mapSize.height= SHADOW_SIZE;
			shadowMaxHeight=100
			sunLight.position.z=300
		}break;
		case 2:{
			d1 = 120;
			sunLight.shadow.camera.far = 240; 
			sunLight.shadow.mapSize.width = SHADOW_SIZE;
			sunLight.shadow.mapSize.height= SHADOW_SIZE;
			shadowMaxHeight=40
			sunLight.position.z=120

		}break;
		case 1:{
			d1 = 75;
			sunLight.shadow.camera.far = 150;
			sunLight.shadow.mapSize.width = SHADOW_SIZE;
			sunLight.shadow.mapSize.height= SHADOW_SIZE;
			shadowMaxHeight=25
			sunLight.position.z=75
		}break;
		default:{
			d1 = 30;
			sunLight.shadow.camera.far = 60;
			sunLight.shadow.mapSize.width = SHADOW_SIZE;
			sunLight.shadow.mapSize.height= SHADOW_SIZE;
			shadowMaxHeight=10
			sunLight.position.z=30
		}
	}

	sunLight.shadow.camera.left = -d1;
	sunLight.shadow.camera.right = d1;
	sunLight.shadow.camera.top = d1;
	sunLight.shadow.camera.bottom = -d1;
	if(sunLight.shadow.map){
		sunLight.shadow.map.dispose()
		sunLight.shadow.map = null
	}

	if(debugLightHelper){
		setTimeout(function(){
			debugLightHelper.update();
		},100)
		
	}
}

function cycle(){

}

function getWind(){
	return wind;
}

function animate(){
	tempHeight+=tempD;
    if(tempHeight<0){
        tempHeight=0;
        tempD=-tempD;
    }else if(tempHeight>1){
        tempHeight=1;
        tempD=-tempD;
    }
    if(tempHeight){
        sunLight.color.setHex(0xffffff);
        ambientLight.color.setHex(0x606060);
        Render.setClearColor(0xb0e9fd,1);
    }/*else if(tempHeight>50){
        sunLight.color.setHex(0xFAD227);
        ambientLight.color.setHex(0x5E5371);
        Render.setClearColor(0xF0FDB0,1);
    }else{
        sunLight.color.setHex(0xFF6600);
        ambientLight.color.setHex(0x3F2A62);
        Render.setClearColor(0xF86722,1);
    }*/

    //sunLight.position.z=200+tempHeight*4;
    
    let v=shadowMaxHeight*tempHeight
    sunTarget.position.y=sunCenter.y-v;
    sunLight.position.y=sunCenter.y+v;
}


function setShadows(bool){
    if(!bool){
        //SHADOW_SIZE=2048;
         sunLight.visible = false;
         sunLight2.visible = true;
    }
    else{
        //SHADOW_SIZE=512;
        sunLight.visible = true;
         sunLight2.visible = false;    
     }
   // sunLight.shadow.mapSize.width = SHADOW_SIZE;  // default
    //sunLight.shadow.mapSize.height = SHADOW_SIZE; // default
}
function setShadowPos(pos){
	sunCenter.set(pos.x,pos.y,pos.z)
	sunLight.position.x=pos.x;
	sunTarget.position.x=pos.x;
}

function setLightHelper(bool){
    if(!bool){
         if(debugLightHelper){
         	debugLightHelper.visible=false;
         }
    }
    else{
    	if(!debugLightHelper){
    		debugLightHelper = new THREE.CameraHelper( sunLight.shadow.camera );
			Render.addModel( debugLightHelper ); 
    	}else{
    		debugLightHelper.visible=true;
    	}
        
     }
}

export {init,getWind,animate,changeShadowScale,setShadows,setShadowPos,setLightHelper}