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


var SHADOW_SIZE = 2048; //2048*16;

let pi2 = Math.PI * 2;

let tempHeight = 1;
let tempD = -0.001; //-0.004
let shadowMaxHeight;

let lightMode=0;

let skyMat;

function init() {

    wind = new THREE.Vector3(1, 0, 0);
    sunCenter = new THREE.Vector3(0, 0, 0);

    ambientLight = new THREE.AmbientLight(0x8F8F8F); // soft white light  0x404040
    Render.addModel2(ambientLight);

    //var directionalLight = new THREE.PointLight( 0xffffff, 1,100 );
    sunLight = new THREE.DirectionalLight(0xE05757, 0.5); //DirectionalLight
    sunLight.position.set(0, 250, 0);
    sunLight.castShadow = true;
    Render.addModel2(sunLight);
    sunTarget = new THREE.Object3D();
    sunTarget.position.set(20, 0, 20);
    Render.addModel2(sunTarget);
    sunLight.target = sunTarget;


    sunLight.shadow.mapSize.width = SHADOW_SIZE; // default
    sunLight.shadow.mapSize.height = SHADOW_SIZE; // default
    sunLight.shadow.camera.near = 1; // default
    // default

    changeShadowScale(0);

    sunLight.shadow.radius = 2.2; //2.2;
    sunLight.shadow.bias = -.0005;

    sunLight2 = sunLight.clone();
    sunLight2.shadow.mapSize.width = 256; //256;  // default
    sunLight2.shadow.mapSize.height = 256; //256; // default
    sunLight2.shadow.radius = 0;

    sunLight2.visible = false;

    Render.addModel2(sunLight2);



    window.sunLight = sunLight;
    //setLightHelper(true)

}

function changeShadowScale(factor) {
    let d1;
    switch (factor) {
        case 4:
            { //yuge
                d1 = 600;
                sunLight.shadow.camera.far = 1200;
                sunLight.shadow.mapSize.width = SHADOW_SIZE;
                sunLight.shadow.mapSize.height = SHADOW_SIZE;
                shadowMaxHeight = 200 / 2
                sunLight.position.z = 600
                Render.getCursor().scale.set(2,2,2)
            }
            break;
        case 3:
            {
                d1 = 300;
                sunLight.shadow.camera.far = 600;
                sunLight.shadow.mapSize.width = SHADOW_SIZE;
                sunLight.shadow.mapSize.height = SHADOW_SIZE;
                shadowMaxHeight = 100
                sunLight.position.z = 300
                Render.getCursor().scale.set(6,6,6)
            }
            break;
        case 2:
            {
                d1 = 120;
                sunLight.shadow.camera.far = 240;
                sunLight.shadow.mapSize.width = SHADOW_SIZE;
                sunLight.shadow.mapSize.height = SHADOW_SIZE;
                shadowMaxHeight = 40
                sunLight.position.z = 120
                Render.getCursor().scale.set(2,2,2)

            }
            break;
        case 1:
            {
                d1 = 75;
                sunLight.shadow.camera.far = 150;
                sunLight.shadow.mapSize.width = SHADOW_SIZE;
                sunLight.shadow.mapSize.height = SHADOW_SIZE;
                shadowMaxHeight = 25
                sunLight.position.z = 75
                Render.getCursor().scale.set(.75,.75,.75)
            }
            break;
        default:
            {
                d1 = 30;
                sunLight.shadow.camera.far = 60;
                sunLight.shadow.mapSize.width = SHADOW_SIZE;
                sunLight.shadow.mapSize.height = SHADOW_SIZE;
                shadowMaxHeight = 10
                sunLight.position.z = 30
                Render.getCursor().scale.set(.25,.25,.25)
            }
    }

    sunLight.shadow.camera.left = -d1;
    sunLight.shadow.camera.right = d1;
    sunLight.shadow.camera.top = d1;
    sunLight.shadow.camera.bottom = -d1;
    if(sunLight.shadow.map) {
        sunLight.shadow.map.dispose()
        sunLight.shadow.map = null
    }

    if(debugLightHelper) {
        setTimeout(function() {
            debugLightHelper.update();
        }, 100)

    }
}

function cycle() {

}

function getWind() {
    return wind;
}

function animate() {
    tempHeight += tempD;
    if(tempHeight < 0) {
        tempHeight = 0;
        tempD = -tempD;
    } else if(tempHeight > 1) {
        tempHeight = 1;
        tempD = -tempD;
    }

    if(lightMode==0){
         if(tempHeight) {
            sunLight.color.setHex(0xffffff);
            ambientLight.color.setHex(0x606060);
            Render.setClearColor(0xb0e9fd, 1);
        }
        /*else if(tempHeight>50){
            sunLight.color.setHex(0xFAD227);
            ambientLight.color.setHex(0x5E5371);
            Render.setClearColor(0xF0FDB0,1);
        }else{
            sunLight.color.setHex(0xFF6600);
            ambientLight.color.setHex(0x3F2A62);
            Render.setClearColor(0xF86722,1);
        }*/
    }
   

    //sunLight.position.z=200+tempHeight*4;

    let v = shadowMaxHeight * tempHeight
    sunTarget.position.y = sunCenter.y - v;
    sunLight.position.y = sunCenter.y + v;
    skyMat.uniforms.resolution.value.x+=0.1
    if(skyMat.uniforms.resolution.value.x>1)
        skyMat.uniforms.resolution.value.x=0
}


function setShadows(bool) {
    if(!bool) {
        //SHADOW_SIZE=2048;
        sunLight.visible = false;
        sunLight2.visible = true;
    } else {
        //SHADOW_SIZE=512;
        sunLight.visible = true;
        sunLight2.visible = false;
    }
    // sunLight.shadow.mapSize.width = SHADOW_SIZE;  // default
    //sunLight.shadow.mapSize.height = SHADOW_SIZE; // default
}

function setShadowPos(pos) {
    sunCenter.set(pos.x, pos.y, pos.z)
    sunLight.position.x = pos.x;
    sunTarget.position.x = pos.x;
}

function setLightHelper(bool) {
    if(!bool) {
        if(debugLightHelper) {
            debugLightHelper.visible = false;
        }
    } else {
        if(!debugLightHelper) {
            debugLightHelper = new THREE.CameraHelper(sunLight.shadow.camera);
            Render.addModel(debugLightHelper);
        } else {
            debugLightHelper.visible = true;
        }

    }
}
function setLight(i){
    lightMode=i;
    if(lightMode==1){
        sunLight.color.setHex(0xFFD3FF);
        ambientLight.color.setHex(0xD8A2FF);
        Render.setClearColor(0xB20075, 1);
    }
}
function getLight(){

}

function skyMatGenerate(w,h){
    let elevation = 0.2;//Rotation around Y axis in range [0, 2*PI]
    let azimuth = 0.4;
    let fogFade = 0.005;
    
    skyMat = new THREE.ShaderMaterial({
    uniforms: {
        sunDirection: {type: 'vec3', value: new THREE.Vector3(Math.sin(azimuth), Math.sin(elevation), -Math.cos(azimuth))},
        resolution: {type: 'vec2', value: new THREE.Vector2(0.2, h)},
        fogFade: {type: 'float', value: fogFade},
        fov: {type: 'float', value: 45}
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 1., 1.);  
        }
    `,
    fragmentShader: `

        varying vec2 vUv;
        uniform vec2 resolution;
        uniform vec3 sunDirection;
        uniform float fogFade;
        uniform float fov;

        const float HalfPI = 1.5707963267948966, // 1.570796326794896619231,
            PI = 3.141592653589793, // 3.141592653589793238463,
            TAU = 6.283185307179586; // 6.283185307179586476925     

        void main() {
            vec3 uColorA = vec3(sin(vUv.x*4.0)*cos(vUv.y*4.0),1,1);
            vec3 uColorB = vec3(0.803, 0.945, 0.976);
            gl_FragColor = vec4(
                mix( uColorA, uColorB, vec3(vUv.y)),
                1.
              );
        }`
    });
    return skyMat
}

export { init, getWind, animate, changeShadowScale, setShadows, setShadowPos, setLightHelper,setLight,getLight,skyMatGenerate }