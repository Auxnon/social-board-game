import * as THREE from "./lib/three.module.js";
import * as Main from "./Main.js";
import * as Physics from "./Physics.js";

import * as Control from "./Control.js";
import * as Environment from "./Environment";
import { GLTFLoader } from "./lib/GLTFLoader.js";
import * as Experimental from "./Experimental.js";
import * as Flock from "./Flock.js";

import { EffectComposer } from "./lib/EffectComposer.js";
import { ShaderPass } from "./lib/ShaderPass.js";
import { SSAOPass } from "./lib/SSAOPass.js";
import { CannonDebugRenderer } from "./lib/CannonDebugRenderer.js";
// import type { Mesh } from "@types/three";

/** @typedef {import("@types/three").Mesh} Mesh */

//import CannonDebugRenderer

//import * as Control from "./Control.js?v=16";
//import * as World from "./World.js?v=16";
//import {OrbitControls} from "./lib/OrbitControls.js";
//import * as Texture from "./Texture.js?v=16";
//import * as Stats from "./lib/stats.js";
//import * as AssetManager from "./AssetManager.js?v=16";
//import * as Experiment from "./Experiment.js?v=16";

var camera, renderer;
var scene;
var group;

var activeCamera, activeScene;

var docWidth, docHeight;
var anchors = [];

var loader;
var mixer;

var SHADOW_SIZE = 2048;
var SIZE_DIVIDER = 8;

var alphaCanvas;

var activeCanvas;

var composer;

var specterMaterial;
var defaultMat;

var player;
var wood;
var ground;
var blood;
var yellow;

var raycaster;
var pointer;
var hexSelector;
var pointerMat;
var pointerMatOn;

var physDebugger;
var defaultModel;

var skyScene;
var skyCamera;

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.z = 200; //400
  camera.position.y = -200; //-800
  camera.up = new THREE.Vector3(0, 0, 1);

  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();
  activeScene = scene;

  alphaCanvas = document.querySelector(".canvasHolder");

  let skyGeo = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
  var sky = new THREE.Mesh(
    skyGeo,
    Environment.skyMatGenerate(docWidth, docHeight)
  );
  skyScene = new THREE.Scene();
  skyScene.add(sky);
  skyCamera = new THREE.Camera();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); //
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; //THREE.LinearToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;

  renderer.setClearColor(0xff7f32, 1); //0xb0e9fd,1);//0xb0e9fd,1)
  renderer.autoClear = false;

  alphaCanvas.appendChild(renderer.domElement);

  loader = new GLTFLoader();

  initCustomMaterial();

  activeCanvas = alphaCanvas;

  activeScene = scene;
  activeCamera = camera;

  resize();

  composer = new EffectComposer(renderer);
  //var luminosityPass = new ShaderPass(LuminosityShader);
  //composer.addPass(luminosityPass);
  let ssaoPass = new SSAOPass(scene, camera, 300, 200);
  ssaoPass.kernelRadius = 6;
  ssaoPass.minDistance = 0.00015;
  ssaoPass.maxDistance = 0.001;
  composer.addPass(ssaoPass);
  window.ssao = ssaoPass;

  let material = new THREE.MeshBasicMaterial({ color: 0x75d5ce });
  //new THREE.MeshStandardMaterial({ color: 0x20E89F, metalness: 0, roughness: 1.0 });

  wood = new THREE.MeshStandardMaterial({
    color: 0x20e89f,
    metalness: 0,
    roughness: 1.0,
  });
  ground = new THREE.MeshStandardMaterial({
    color: 0x5471a5,
    metalness: 0,
    roughness: 1.0,
  });
  let guyMat = new THREE.MeshStandardMaterial({
    color: 0xeaf722,
    metalness: 0,
    roughness: 1.0,
  });
  defaultMat = new THREE.MeshStandardMaterial({
    color: 0xcf2ade,
    metalness: 0,
    roughness: 1.0,
  });
  blood = new THREE.MeshStandardMaterial({
    color: 0xb60b0b,
    metalness: 0,
    roughness: 1.0,
  });
  yellow = new THREE.MeshStandardMaterial({
    color: 0xeaf722,
    metalness: 0,
    roughness: 1.0,
  });

  //material = new THREE.MeshBasicMaterial( {color: new THREE.Color("white")} );
  /*geometry = new THREE.BoxBufferGeometry( 100, 100, 100 );
    cube = new THREE.Mesh( geometry, material );
    cube.position.z=50;
    scene.add( cube );*/
  group = new THREE.Group();

  /*
        group.add(cubic(10,100,50,-50,0,50,wood));
        group.add(cubic(10,100,50,50,0,50,wood));
        group.add(cubic(100,10,50,0,50,50,wood));
        group.add(cubic(100,100,10,0,0,20,ground));*/

  /*player = new THREE.Group();
    let whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.FrontSide });

    let blackMat = new THREE.MeshBasicMaterial({ color: 0x321818, side: THREE.FrontSide });


    let p1 = cubic(1, 1, 2, 0, 0, 0, guyMat);
    let p2 = cubic(1, .2, 1, 0, .5, .5, whiteMat)
    let p3 = cubic(.3, .2, .3, 0, .6, .5, blackMat)

    player.add(p1)
    player.add(p2)
    player.add(p3)
    group.add(player)*/

  /*let referenceCube = cubic(.5, .5, 1.5, 0.75, 0, 20, new THREE.MeshBasicMaterial({ color: 0xD62B5F }))
    group.add(referenceCube)*/

  scene.add(group);
  pointerInit();
  Environment.init();
  Control.setRenderer(renderer, alphaCanvas, camera, false);

  let l = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  let r = new THREE.MeshBasicMaterial({ color: 0xff8800 });
  let f = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  let b = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  let u = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  let d = new THREE.MeshBasicMaterial({ color: 0x8800ff });
  let cub = new THREE.BoxBufferGeometry(1, 1, 1);
  defaultModel = new THREE.Mesh(cub, [l, r, f, b, u, d]);

  setTimeout(function () {
    animate();
  }, 1);

  return alphaCanvas;
}

export function pick() {}

function pointerInit() {
  let pointerGeom = new THREE.CircleGeometry(1, 8);
  //pointerGeom.rotateX(-Math.PI/2.0);
  pointerMat = new THREE.MeshBasicMaterial({ color: 0x4ae13a });
  pointerMatOn = new THREE.MeshBasicMaterial({ color: 0xebee00 });
  pointer = new THREE.Mesh(pointerGeom, pointerMat);
  pointer.position.z = 0.05;
  scene.add(pointer);
  raycaster = new THREE.Raycaster();
}

function getAlphaCanvas() {
  return alphaCanvas;
}

function togglePhysicsDebugger(bool) {
  if (bool && !physDebugger)
    physDebugger = new CannonDebugRenderer(scene, Physics.world); //Physics.createPhysicsDebugger(scene)
}

/**
 *
 * @param {*} modelIn
 * @param {*} callback
 * @param {{
 * texture:boolean,
 * color:number,
 * zup:boolean
 * }} options
 */
function loadModel(modelIn, callback, options = {}) {
  loader.load(
    "./" + modelIn, //villager22.gltf',
    (gltf) => {
      // called when the resource is loaded
      //gltf.scene.scale.set(10,10,10);
      /** @type {Mesh} */
      let model; //=gltf.scene.children[0];
      gltf.scene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          //if(child.name=="Cube"){

          model = child;
          if (options.zup) model.geometry.rotateX(Math.PI / 2);

          if (!options.texture) {
            if (options.color)
              child.material = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0,
                roughness: 1.0,
              });
            //
            else
              child.material = new THREE.MeshStandardMaterial({
                vertexColors: THREE.VertexColors,
                metalness: 0,
                roughness: 1.0,
              }); //

            child.material.needsUpdate = true;
            //child.material.skinning=true;
          } else {
            child.material.transparent = true;
          }
          //child.material.morphTargets=true;

          //child.material.map.needsUpdate = true;
          // }else{

          //}
        }
      });
      //gltf.scene.children[0].children[1].scale.set(20,20,20);
      //gltf.scene.children.pop();
      //let mixer = new THREE.AnimationMixer( gltf.scene );
      //model=gltf.scene.children[0]
      let m2 = gltf.scene.children[0];
      if (model) {
        var animations = gltf.animations;
        if (animations && animations.length) {
          mixer = new THREE.AnimationMixer(model);
          for (var i = 0; i < animations.length; i++) {
            var animation = animations[i];
            // There's .3333 seconds junk at the tail of the Monster animation that
            // keeps it from looping cleanly. Clip it at 3 seconds

            //if ( sceneInfo.animationTime ) {
            //    animation.duration = sceneInfo.animationTime;

            // }
            let action = mixer.clipAction(animation);
            //action.setEffectiveTimeScale(200);
            //action.timeScale=0.002;
            action.timeScale = 0.002;
            //if ( state.playAnimation )
            action.play();
          }
        }
        //mainScene.add( gltf.scene.children[0] );
      }
      callback(gltf.scene);
    },
    (xhr) => {
      // called while loading is progressing
      console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
      // called when loading has errors
      console.error("An error happened", error);
    }
  );
}

function resize() {
  //Math.max(window.screen.width, window.innerWidth)
  //Math.max(window.screen.height, window.innerHeight)
  if (window.screen.width > window.innerWidth) {
    docWidth = window.innerWidth;
    docHeight = window.innerHeight;
  } else {
    docWidth = window.screen.width;
    docHeight = window.screen.height;
  }

  //docWidth =  window.innerWidth //Math.max(window.screen.width, window.innerWidth)
  //docHeight = window.innerHeight //Math.max(window.screen.height, window.innerHeight)//window.innerHeight;
  camera.aspect = docWidth / docHeight;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(1); //window.devicePixelRatio / SIZE_DIVIDER);
  renderer.setSize(docWidth, docHeight);
}

var dir = 1;

function animate(time) {
  Physics.updatePhysics();
  //group.rotation.z+=0.002*dir;
  if (group.rotation.z > Math.PI / 16) dir = -1;
  else if (group.rotation.z < -Math.PI / 16) dir = 1;

  applyCursor();
  Environment.animate();

  if (physDebugger) physDebugger.update();
  renderer.clear();
  renderer.render(skyScene, skyCamera);
  renderer.render(activeScene, activeCamera);
  //composer.render();
  if (anchors.length > 0) {
    anchors.forEach((a, i) => {
      updateAnchor(a, i);
    });
  }
  // Experimental.animate();
  //   Flock.think();
  requestAnimationFrame(animate);
}

function dumpImage(img) {
  let dom = document.querySelector("#afterImage");
  if (dom) dom.setAttribute("src", img);
}

function bufferPrint(sc, cam) {
  //renderer.setPixelRatio(0.2)
  //_grabImage=true;

  //renderer.setPixelRatio(0.5)

  renderer.setSize(128, 128);
  renderer.setClearColor(0xffffff, 0);

  if (sc && cam) {
    renderer.render(sc, cam);
  } else renderer.render(getScene(), camera);
  //dumpImage(renderer.domElement.toDataURL());
  //renderer.setPixelRatio(0.5)
  let m = renderer.domElement.toDataURL();
  renderer.setSize(docWidth, docHeight);
  return m;
}

function addAnchor(host, bubble) {
  let anchor = {
    host: host,
    bubble: bubble,
    x: 0,
    y: 0,
    offset: 0,
  };
  anchors.forEach((a) => {
    if (a.host == host) {
      a.offset -= 40;
    }
  });
  anchors.push(anchor);
  console.log(anchors.length + " anchors");
  updateAnchor(anchor, anchors.length - 1);
  return anchor;
}

function updateAnchor(anchor, index) {
  if (!anchor.bubble) {
    anchors.splice(index, 1);
    return false;
  }
  if (anchor.host) {
    let vector = projectVector(anchor.host);
    anchor.bubble.style.left = -16 + vector.x + "px";
    anchor.bubble.style.top = 40 + anchor.offset + vector.y + "px";
    anchor.x = vector.x;
    anchor.y = vector.y;
  }
}

function roundEdge(x) {
  x = x % Math.PI;
  if (x < 0) x += Math.PI * 2;

  if (x > Math.PI / 4) {
    if (x > (5 * Math.PI) / 4) {
      if (x < (7 * Math.PI) / 4) {
        return (Math.PI * 3) / 2;
      }
    } else {
      if (x > (3 * Math.PI) / 4) {
        return Math.PI;
      } else {
        return Math.PI / 2;
      }
    }
  }
  return 0;
}

function syncModel(index, obj) {
  let m = modelsIndexed[index];
  m.position.x = obj.x;
  m.position.y = obj.y;
  m.position.z = obj.z;
}

function createModel(index) {
  let model = new THREE.Mesh(cubeGeometry, cubeMaterial);
  modelsIndexed[index] = model;
  return model;
}

function addModel(model) {
  group.add(model);
}

function addModel2(model) {
  scene.add(model);
}

function removeModel(model) {
  group.remove(model);
}

function cubic(i, j, k, x, y, z, c) {
  let geometry = new THREE.BoxBufferGeometry(i, j, k);
  if (!c) c = defaultMat;

  let cube = new THREE.Mesh(geometry, c);
  cube.castShadow = true;

  cube.position.x = x ? x : 0;
  cube.position.y = y ? y : 0;
  cube.position.z = z ? z : 0;
  return cube;
}

function cubicColored(i, j, k, x, y, z, c) {
  if (!c) c = defaultMat;
  else c = new THREE.MeshBasicMaterial({ color: c });

  return cubic(i, j, k, x, y, z, c);
}

function cylinder(i, j, k, x, y, z, c) {
  let geometry = new THREE.CylinderGeometry(i, j, k, 6);
  if (!c) c = defaultMat;
  else c = new THREE.MeshBasicMaterial({ color: c });

  geometry.rotateX(Math.PI / 2);
  geometry.rotateZ(Math.PI / 2);

  let cyl = new THREE.Mesh(geometry, c);
  cyl.castShadow = true;
  cyl.position.x = x ? x : 0;
  cyl.position.y = y ? y : 0;
  cyl.position.z = z ? z : 0;
  return cyl;
}

function plane(i, j, c) {
  const geometry = new THREE.PlaneBufferGeometry(i, j);
  const material = new THREE.MeshBasicMaterial({
    color: c ? c : 0xffff00,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  return plane;
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = Math.random() > 0.5 ? 0x66b136 : 0x76610e;
  return parseInt(color);
}

function applyCursor() {
  /*if(Control.down()) {
        pointer.material = pointerMatOn;
    } else
        pointer.material = pointerMat;*/

  var vector = new THREE.Vector3();
  vector.set(
    (Control.screenX() / window.innerWidth) * 2 - 1,
    -(Control.screenY() / window.innerHeight) * 2 + 1,
    0.5
  );
  vector.unproject(camera);
  var dir = vector.sub(camera.position).normalize();
  var distance = -camera.position.z / dir.z;
  var pos = camera.position.clone().add(dir.multiplyScalar(distance));
  /*
    let intersects = raycaster.intersectObjects( scene.children,true );


     console.log('sect',intersects.length)
    if(intersects.length>0){
        if(intersects[0].point.z>=pos.z){
            pos.set(intersects[0].point.x,intersects[0].point.y,intersects[0].point.z)
            console.log('sect')
        }
    }
*/

  pointer.position.x = pos.x;
  pointer.position.y = pos.y;
  pointer.position.z = pos.z + 0.5;
  // console.log(pointer.position)
  Control.setVector(pointer.position);
}

function projectVector(object) {
  var width = docWidth,
    height = docHeight;
  var widthHalf = width / 2,
    heightHalf = height / 2;

  let vector = object.position.clone();
  vector.z += 4;
  //vector.applyMatrix4(object.matrixWorld);
  vector.project(camera);

  //var projector = new THREE.Projector();
  //projector.projectVector( vector.setFromMatrixPosition( object.matrixWorld ), camera );

  vector.x = vector.x * widthHalf + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;
  return vector;
}

var specterMaterial;

function initCustomMaterial() {
  var meshphysical_frag = `
    #define STANDARD
#ifdef PHYSICAL
    #define REFLECTIVITY
    #define CLEARCOAT
    #define TRANSPARENCY
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef TRANSPARENCY
    uniform float transparency;
#endif
#ifdef REFLECTIVITY
    uniform float reflectivity;
#endif
#ifdef CLEARCOAT
    uniform float clearcoat;
    uniform float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
    uniform vec3 sheen;
#endif
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
    varying vec3 vNormal;
    #ifdef USE_TANGENT
        varying vec3 vTangent;
        varying vec3 vBitangent;
    #endif
#endif
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>

#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
    #include <clipping_planes_fragment>
    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;
    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <roughnessmap_fragment>
    #include <metalnessmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <clearcoat_normal_fragment_begin>
    #include <clearcoat_normal_fragment_maps>
    #include <emissivemap_fragment>
    #include <lights_physical_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>
    #include <aomap_fragment>
    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
    #ifdef TRANSPARENCY
        diffuseColor.a *= saturate( 1. - transparency + linearToRelativeLuminance( reflectedLight.directSpecular + reflectedLight.indirectSpecular ) );
    #endif
    gl_FragColor = vec4( outgoingLight,1.-(((0.2125 * outgoingLight.r) + (0.7154 * outgoingLight.g) + (0.0721 * outgoingLight.b)) ) );
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
}`;

  //gl_FragColor = vec4( outgoingLight, diffuseColor.a );

  /*
    #ifdef USE_COLOR
                if(vColor==vec3(0,0,1))
                    diffuseColor.rgb *= vec3(1,0,0);
                else
                    diffuseColor.rgb *= vColor;
        #endif*/

  //    #include <color_vertex>

  var meshphysical_vert = `#define STANDARD
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
    varying vec3 vNormal;
    #ifdef USE_TANGENT
        varying vec3 vTangent;
        varying vec3 vBitangent;
    #endif
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform vec3 shirt;
uniform vec3 wind;

void main() {
    #include <uv_vertex>
    #include <uv2_vertex>
    #ifdef USE_COLOR
        if(color==vec3(0,0,1))
            vColor.xyz = shirt;
        else
            vColor.xyz = color.xyz;
        
    #endif
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
#ifndef FLAT_SHADED
    vNormal = normalize( transformedNormal );
    #ifdef USE_TANGENT
        vTangent = normalize( transformedTangent );
        vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
    #endif
#endif
    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>

    
        if(color==vec3(1,0,0)){
            float val=max(0.0, 1.0976 - transformed.z);
            transformed.xyz+=val*wind;
            transformed.y*=1.0+sin((wind.z+transformed.z)*4.0)/2.0;

        }
    

    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    vViewPosition = - mvPosition.xyz;
    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
}`;

  var uniforms = THREE.UniformsUtils.merge([
    THREE.ShaderLib.standard.uniforms,
    //{shirt: {value:new THREE.Vector3(0,1,0)},
    //wind: {value:new THREE.Vector3(0,0,0)}}
  ]);

  /*specterMaterial =  new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmentShader(),
    vertexShader: vertexShader(),
  })**/

  specterMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    derivatives: false,
    lights: true,
    vertexColors: true,
    vertexShader: meshphysical_vert,
    fragmentShader: meshphysical_frag,
    roughness: 0.0,
    metalness: 1.0,
    //vertexShader: THREE.ShaderChunk.cube_vert,
    //fragmentShader: THREE.ShaderChunk.cube_frag
  });
}

function toggleScene(sc, cam) {
  if (cam && sc) {
    activeCamera = cam;
    activeScene = sc;
  } else {
    activeScene = scene;
    activeCamera = camera;
  }
}

function getCursor() {
  return pointer;
}

/////SCENE///////

var emptyScene;
var scenes;

function sceneInit() {
  emptyScene = new THREE.Scene();
  scenes = [];

  let cubeGeometry = new THREE.BoxBufferGeometry(20, 20, 20);
  let cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff8833 }); //map: texture

  /*
      var geometry = new THREE.SphereGeometry( 5, 32, 32 );
      var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
      var sphere = new THREE.Mesh( geometry, material );

      sphere.position.set(0,0,-30);
      cubes.push(sphere);
      scenes[2].add(sphere);
      var geo = new THREE.OctahedronGeometry( 30, 1 );
      var mat = new THREE.MeshBasicMaterial( {color: 0xC92DD1} ); 
      var octa= new THREE.Mesh( geo, mat );
      octa.position.set(0,0,20);
      cubes.push(octa);
      scenes[3].add(octa);*/
}

export function flipScene(i) {
  activeScene = i;
}
var activeScene = 0;
var activeModule;
/*
function getScene() {
    let index = activeScene;
    let scene = scenes[index];
    if(scene == undefined) {
        scene = emptyScene
        scenes[index] = 'pend';

        //wow this is a conufsing mess but it's functional!
        let importerFunction = SCENE_IMPORT[index];
        if(importerFunction) {
            Main.pendApp(index)
            importerFunction(module => {
                scenes[index] = [module.init(index,()=>{Main.clearPendApp(index)},Main.apps[index]), module]
                
            });
        } else {
            scenes[index] = [emptyScene, undefined]
        }

    
    } else if(scene == 'pend') {
        scene = emptyScene;
    } else {
        activeModule = scene[1]; //define the module that's currently active so we can run it's animate function in sceneAnimate()
        scene = scene[0] //please forgive me, trust me it works
    }

    return scene;
}*/

///////////////

function setClearColor(a, b) {
  renderer.setClearColor(a, b);
}

function makeGroup() {
  return new THREE.Group();
}

export {
  init,
  addModel,
  removeModel,
  setClearColor,
  toggleScene,
  defaultModel,
  makeGroup,
  addModel2,
  cubic,
  cubicColored,
  cylinder,
  plane,
  wood,
  ground,
  blood,
  yellow,
  getAlphaCanvas,
  bufferPrint,
  loadModel,
  addAnchor,
  resize,
  player,
  togglePhysicsDebugger,
  getCursor,
};
