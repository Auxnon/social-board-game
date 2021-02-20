/** @about
Properly deals with requests to load models more efficiently with load status etc
Also heavy with experimentation
**/

import * as Render from "./Render.js";
import * as Helper from "./Helper.js";
import * as THREE from "./lib/three.module.js";
import { SkeletonUtils } from "./lib/SkeletonUtils.js";
import * as PlayerManager from "./PlayerManager.js";


//import * as InstancedObjectManager from "./InstancedObjectManager.js";


var modelCounter = 0;
var animators = [];
var windies = [];
var instanceColors = [];

var treeModel;
var manModel;
var womanModel;
var swordModel;
var helmModel;

var UNIFORMS = {};
var personShader;
var personAnimations = {};

var MODELS = {};
var MODELALTS = [];

function init() {
    //defaultLoad('man');
    defaultLoad('pot');
    defaultLoad('rock');
    defaultLoad('goblin', 'glb');
    defaultLoad('werewolf', 'glb');
    defaultLoad('vampire', 'glb');
    defaultLoad('zombie', 'glb');

    //defaultLoad('chicken', 'glb');
    defaultLoad('die4', undefined, [1, 1, 1]);
    defaultLoad('die6', undefined, [1, 1, 1]);
    defaultLoad('die8', undefined, [1, 1, 1]);
    defaultLoad('die10', undefined, [1, 1, 1]);
    defaultLoad('die20', undefined, [1, 1, 1]);



    /*
        load('assets/person.gltf',m=>{
            m.position.z+=55;
            //m.scale.set(10,10,10);
            m.visible=false;
            //m.material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0, roughness: 1.0}); // 
            //playerModel=m;
        },0xffffff);

        load('assets/tree1.gltf',m=>{
            m.position.z+=55;
            //m.scale.set(10,10,10);
           treeModel=m;
           treeModel.castShadow = true; //default is false
            treeModel.receiveShadow = true; //default
            //playerModel=m;
            
            _documentModel("tree",m);
           
        });

        defaultLoad('plant');
        defaultLoad('log');
        defaultLoad('shroom1');
        defaultLoad('shroom2');
        defaultLoad('plank');
        defaultLoad('pot');
        defaultLoad('rock');
        defaultLoad('pinkTree');

        load('assets/grass.gltf',m=>{
            m.material.side=THREE.DoubleSide;

            readColors(m,[1,1,1],Helper.hexToRGBFloat('#DAEA55'))
            readColors(m,[0,0,0],Helper.hexToRGBFloat('#66B136'))
            _documentModel("grass",m);
        });

        load('assets/sword.gltf',m=>{
             swordModel=m;
            _documentModel("sword",m);
        });

        load('assets/helm.gltf',m=>{
            helmModel=m;
            helmModel.material.side=THREE.DoubleSide;
            _documentModel("helm",helmModel);

        });*/

    personShader = makeShader();
    personShader.needsUpdate = true;
    personShader.skinning = true;
    load('assets/models/man.gltf', (m, animations) => {
        //m.position.x+=100;
        m = m.children[0]
        manModel = m;
        manModel.castShadow = true;
        manModel.receiveShadow = true;
        m.scale.set(2, 2, 2);

        if (animations) {
            animations.forEach(anim => {
                if (anim.name)
                    personAnimations[anim.name] = anim;
            });
        }


        readColors(m, [1, 0.2541521191596985, 0.022173885256052017], [0, 0, 1])

        let val = { value: new THREE.Vector3(0, 0, 1) };




        MODELS['man'] = manModel;


        personShader.onBeforeCompile = shader => {
            //shader.fragmentShader = 'uniform vec3 myVector;\n' + shader.fragmentShader;
            shader.uniforms.shirt = man.children[1].material.uniforms.shirt;
            shader.vertexShader = 'uniform vec3 shirt;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <color_vertex>',
                `
                #ifdef USE_COLOR
                    if(color.xyz == vec3(0,0,1)){
                        vColor.xyz = vec3(1,1,0);
                    }else{
                        vColor.xyz = color.xyz;
                    }
                #endif`);
        } //shirt.xyz



        /* 

         let manny=getModel(null,8,0,-8,'#C000BE',false,false);
         let danny=getModel(null,9,0,-8,'#FF9C0E',true,false);
         let sammy=getModel(null,10,0,-8,'#4191FF',false,true);
         let lenny=getModel(null,11,0,-8,'#C00032',true,true);
         let jenny=getModel(null,12,0,-8,'#210FA7',false,true);
         let jimmy=getModel(null,13,0,-8,'#09C000',true,true);
       
         
         Render.addModel(manny);
         Render.addModel(danny);
          Render.addModel(sammy);
         Render.addModel(lenny);
          Render.addModel(jenny);
         Render.addModel(jimmy);


         load('assets/woman.gltf',m=>{
             womanModel=m;
             womanModel.castShadow = true;
             womanModel.receiveShadow = true;
             readColors(m,[1,0.13286831974983215,0],[0,0,1])
            // readColors(m,[1,0.2541521191596985,0.022173885256052017],[0,0,1])
             //let val={value: new THREE.Vector3(0,0,1)};



             //new THREE.MeshStandardMaterial({  vertexColors: THREE.VertexColors, metalness: 0, roughness: 1.0});

             let lady=getModel(womanModel,-3,0,-3,'#C000BE',false,false,"StrikeThrust");
             Render.addModel(lady);

         });*/
    });

    load('assets/models/gran.gltf', (m, animations) => {
        m = m.children[0]
        m.castShadow = true;
        m.receiveShadow = true;
        m.scale.set(2, 2, 2);

        /*if(animations){
            animations.forEach(anim=>{
                if(anim.name)
                    personAnimations[anim.name]=anim;
            });
        }*/
        readColors(m, [0.42869052290916443, 0.262250691652298, 0.4677838087081909], [0, 0, 1])
        let val = { value: new THREE.Vector3(0, 0, 1) };
        MODELS['gran'] = m;
    });

    load('assets/models/chicken.glb', m => {
        m = m.children[0]
        m.name='chicken'
        m.scale.set(2, 2, 2);

        m.children.forEach(o => {
            console.log('hit chicken' + o.type)
            if (o.type == 'SkinnedMesh') {
                o.material = personShader.clone();
                //o.material.skinning = true;
                //o.material.needsUpdate = true;
                //o.castShadow = true;
                //o.receiveShadow = true;
            }
        })

        //m.material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0, roughness: 1.0}); // 
        MODELS['chicken'] = m;

    });

    load('assets/models/hedgehog.glb', m => {
        m = m.children[0];//.children
        m.name='hedgehog'
        m.scale.set(2, 2, 2);
        m.children.forEach(o => {
            if (o.type == 'SkinnedMesh') {
                o.material = personShader.clone();
            }
        })
        MODELS['hedgehog'] = m;
    });
    load('assets/models/testMan.glb', m => {
        m = m.children[0];//.children
        m.name='testman'
        m.scale.set(2, 2, 2);
        m.children.forEach(o => {
            if (o.type == 'SkinnedMesh') {
                o.material = personShader.clone();
            }
        })
        MODELS['testman'] = m;
    });

    load('assets/models/testhead.glb', m => {
        m = m.children[0];//.children
        m.name='testhead'
        m.scale.set(2, 2, 2);
        MODELS['testhead'] = m;
    },true);

}

function load(model, callback,texture) {
    modelCounter++;
    Render.loadModel(model, (m, anim) => {
        modelCounter--;
        callback(m, anim);
    },texture);
}

function defaultLoad(s, type, override) {
    if (!type)
        type = 'gltf'
    load('assets/models/' + s + '.' + type, m => {
        if (m.type == 'Scene') {
            m.children.every(obj => {
                if (obj.type == 'Mesh') {
                    m = obj;
                    return false;
                }
                return true;
            })
        }
        m.scale.set(2, 2, 2);
        m.castShadow = true; //default is false
        m.receiveShadow = true; //default
        //m.material.shadowSide=THREE.FrontSide;
        //m.material.side= THREE.DoubleSide;
        //if(override)
        //readColors(m,override, [0, 0, 1])
        //else
        //readColors(m)


        _documentModel(s, m);

        //Render.addModel(m);
    });
}

/**make a string reference of our model for easy loading**/
function _documentModel(s, m) {
    //strip out numbers so we can combine numbered models into a single array for random picking
    let s2 = s.replace(/[0-9]/g, '');
    if (s2 != s) {
        if (MODELS[s2]) {
            if (!Array.isArray(MODELS[s2])) {
                let temp = MODELS[s2];
                MODELS[s2] = [temp];
            }
            MODELS[s2].push(m)
        } else {
            MODELS[s2] = m;
        }
    }
    MODELS[s] = m;
}

function getPending() {
    return modelCounter;
}

function findBone(model, name) {
    if (name && model.children && model.children.length > 0) {
        return walkBone(model, name);
    }
}

function walkBone(root, name) {
    for (let i = 0; i < root.children.length; i++) {
        //console.log(root.children[i].name)
        if (root.children[i].name == name) {
            return root.children[i];
        } else if (root.children[i].type = "Bone" && root.children[i].children && root.children[i].children.length > 0) {
            let result = walkBone(root.children[i], name);
            if (result)
                return result;
        }
    }
}

function readColors(model, swapIn, swapOut) {

    if (model.geometry) {
        _subReadColors(model, model.geometry, swapIn, swapOut);
    } else if (model.children && model.children.length > 0) {
        for (let n = 0; n < model.children.length; n++) {
            if (model.children[n].geometry) {
                _subReadColors(model, model.children[n].geometry, swapIn, swapOut);
            }
        }
    }
}

function _subReadColors(parent, geom, swapIn, swapOut) {
    if (!geom)
        return;

    let swapping = swapIn && swapOut;

    let array = geom.attributes.color.array
    let colorArray = [];
    let j;
    for (let i = 0; i < array.length; i++) {
        j = i % 4;
        if (j >= 3) {
            if (swapping) {
                if (array[i - 3] == swapIn[0] && array[i - 2] == swapIn[1] && array[i - 1] == swapIn[2]) {
                    array[i - 3] = swapOut[0];
                    array[i - 2] = swapOut[1];
                    array[i - 1] = swapOut[2];
                }
                //console.log('match?',Helper.rgbFloatToHex(swapIn[0],swapIn[1],swapIn[2]),Helper.rgbFloatToHex(array[i-3],array[i-2],array[i-1]))

            } else {
                let hex = Helper.rgbFloatToHex(array[i - 3], array[i - 2], array[i - 1]);
                colorArray[hex] = array[i - 3] + ',' + array[i - 2] + ',' + array[i - 1];
            }

        }
    }
    if (!swapping) {
        let content = Object.keys(colorArray);
        content.forEach(color => {
            console.log('%s %s %c %s %c %s', parent.name, geom.name, 'background: ' + color + '; color: #000', color, 'background: white;', colorArray[color]);
        })
    }
}

var windTest;
var windV;

function animate(delta) {

    if (animators.length > 0) {
        animators.forEach(anim => {
            anim.update(5); //DEV set constant for XR     
        });
    }
    /*
        //VERY COSTLY, FIND A BETTER SOLUTION
        if(windies.length>0){
            if(!windTest){
                windTest=new THREE.Vector3(0,0,0);
                windV=new THREE.Vector3(0,0,0);
            }
            windV.x+=rnd();
            windV.y+=rnd();
            windV.z+=rnd();
            if(Math.abs(windV.x)>1){
                windV.x*=-0.9;
            }
            if(Math.abs(windV.y)>1){
                windV.y*=-0.9;
            }
            if(Math.abs(windV.z)>1){
                windV.z*=-0.9;
            }

            windTest.add(windV);
            windTest.clampLength(0,1.0);


            windies.forEach(windy=>{
                windy.material.uniforms.wind.value=windTest;
            })
        }*/
}

function rnd() {
    return (Math.random() - 0.5) * 0.001;
}

function getModel(model, x, y, z, color, sword, helm, anim) {

    if (!model)
        model = SkeletonUtils.clone(manModel);
    else
        model = SkeletonUtils.clone(model);

    model.position.x = x;
    model.position.y = y;
    model.position.z = z;
    model.rotation.y = Math.PI * (0.5 * Math.random() + 0.75);

    let colors = Helper.hexToRGBFloat(color);

    model.userData.shirt = { value: new THREE.Vector3(colors[0], colors[1], colors[2]) };
    model.userData.wind = { value: new THREE.Vector3(0, 1, 0) };

    model.children.forEach(obj => {
        if (obj && obj.type == "SkinnedMesh") {
            obj.castShadow = true;
            obj.receiveShadow = true;
            if (obj.name == "Woman" || obj.name == "Man") { //|| obj.name=="Scarf"){ //DEV
                obj.material = personShader.clone();
                obj.material.uniforms.shirt = model.userData.shirt;
                //obj.material.uniforms.wind= model.userData.wind;
            }
            if (obj.name == "Scarf") { //DEV
                //windies.push(obj);
            }
        }
    })





    /*model.children[1].material.onBeforeCompile = shader=> {
        //shader.fragmentShader = 'uniform vec3 myVector;\n' + shader.fragmentShader;
        shader.uniforms.shirt=model.userData.shirtVal;
        shader.vertexShader='uniform vec3 shirt;\n'+shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <color_vertex>',
            `
            #ifdef USE_COLOR
                if(color.xyz == vec3(1,0,0)){
                    vColor.xyz = shirt.xyz;
                }else{
                    vColor.xyz = color.xyz;
                }
            #endif`);
    }*/



    if (sword) {
        let bone = findBone(model, "attachHoldR");
        if (bone) {
            bone.add(swordModel.clone());
        }
    }

    if (helm) {
        let bone2 = findBone(model, "attachHat");
        if (bone2) {
            // let mm=Render.cubit(.1,.8,.1, 0,.4,0,0xff0000,-1)
            bone2.add(helmModel.clone());
        }
    }

    if (!anim)
        anim = "Walk"

    let mixer = new THREE.AnimationMixer(model);
    let action = mixer.clipAction(personAnimations[anim]);
    action.timeScale = 0.002;
    action.play();
    animators.push(mixer);
    instanceColors.push(colors);
    model.action = action;

    return model;
}

function attach(root, hookString, itemString) {
    let item = make(itemString);
    let bone = findBone(root, hookString);
    if (bone && item) {
        item.scale.set(1, 1, 1);
        item.position.set(0, 0, 0);
        item.castShadow = true;

        bone.add(item);
    }
}

/**important model asset fetch and clone function, used often**/
function make(s, player) {
    let m = MODELS[s];
    if (m) {
        if (Array.isArray(m)) {
            m = m[Math.floor(Math.random() * m.length)]
        } else if (player && player.color) {
            if ((s == 'man' || s == 'gran' || s == 'chicken' ||  s == 'hedgehog' ||  s == 'testman')) {
                if (player && player.id) {
                    let user = PlayerManager.getUser(player.id)
                    if (!user.shader) {
                        user.shader = personShader.clone();
                        user.shader.needsUpdate = true;
                        let colors = Helper.hexToRGBFloat(player.color);
                        user.shader.uniforms.shirt = { value: new THREE.Vector3(colors[0], colors[1], colors[2]) };
                    }

                    let out = SkeletonUtils.clone(m);

                    out.children.forEach(obj => {
                        if (obj && obj.type == "SkinnedMesh") {
                            obj.castShadow = true;
                            obj.receiveShadow = true;
                            obj.material = user.shader
                            obj.material.needsUpdate = true;
                        }
                    })
                    return out;
                } else {



                    m = SkeletonUtils.clone(m);
                    let colors = Helper.hexToRGBFloat(player.color);

                    m.userData.shirt = { value: new THREE.Vector3(colors[0], colors[1], colors[2]) };
                    m.userData.wind = { value: new THREE.Vector3(0, 1, 0) };

                    m.children.forEach(obj => {
                        if (obj && obj.type == "SkinnedMesh") {
                            obj.castShadow = true;
                            obj.receiveShadow = true;
                            if (obj.name == "Gran" || obj.name == "Man" || obj.name == "GranHead") { //|| obj.name=="Scarf"){ //DEV
                                console.log('skinned ', obj.name)
                                obj.material = personShader.clone();
                                obj.material.skinning = true;
                                obj.material.needsUpdate = true;
                                obj.material.uniforms.shirt = m.userData.shirt;
                                //obj.material.uniforms.wind= model.userData.wind;
                            }
                            if (obj.name == "Scarf") { //DEV
                                //windies.push(obj);
                            }
                        }
                    })
                    return m;
                }
            }

        }
        return m.clone();
    } else {

    }

    return Render.defaultModel.clone();
}

/** simple asset checker, dev purposes**/
function get(s) {
    return MODELS[s]
}
/**Fancy color mapper shader used for people models to add custom colors per instance with the same asset**/
function makeShader() {
    // 
    //THREE.ShaderChunk.meshphysical_frag = "#define STANDARD\n#ifdef PHYSICAL\n\t#define REFLECTIVITY\n\t#define CLEARCOAT\n\t#define TRANSPARENCY\n#endif\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifdef TRANSPARENCY\n\tuniform float transparency;\n#endif\n#ifdef REFLECTIVITY\n\tuniform float reflectivity;\n#endif\n#ifdef CLEARCOAT\n\tuniform float clearcoat;\n\tuniform float clearcoatRoughness;\n#endif\n#ifdef USE_SHEEN\n\tuniform vec3 sheen;\n#endif\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n\t#ifdef USE_TANGENT\n\t\tvarying vec3 vTangent;\n\t\tvarying vec3 vBitangent;\n\t#endif\n#endif\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <bsdfs>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <lights_pars_begin>\n#include <lights_physical_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <clearcoat_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <roughnessmap_fragment>\n\t#include <metalnessmap_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\t#include <clearcoat_normal_fragment_begin>\n\t#include <clearcoat_normal_fragment_maps>\n\t#include <emissivemap_fragment>\n\t#include <lights_physical_fragment>\n\t#include <lights_fragment_begin>\n\t#include <lights_fragment_maps>\n\t#include <lights_fragment_end>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\t#ifdef TRANSPARENCY\n\t\tdiffuseColor.a *= saturate( 1. - transparency + linearToRelativeLuminance( reflectedLight.directSpecular + reflectedLight.indirectSpecular ) );\n\t#endif\n\tgl_FragColor = vec4( 1,1,0, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}";

    /*
        `
    #ifdef USE_ALPHAMAP
        diffuseColor.a *= texture2D( alphaMap, vUv ).g;
    #endif

    #ifdef BIGGO
        gl_FragColor=vec4(1.0,0,0,1.0);
    #endif
    `;*/
    // #include <clearcoat_pars_fragment>
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
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
}`




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
}`

    var uniforms = THREE.UniformsUtils.merge(
        [THREE.ShaderLib.phong.uniforms,
            {
                shirt: { value: new THREE.Vector3(0, 1, 0) },
                wind: { value: new THREE.Vector3(0, 0, 0) }
            }
        ]
    );

    uniforms.ambientLightColor.value = null;
    /* var uniforms={ambientLightColor: { value: null },
    lightProbe: { value: null },
    directionalLights: { value: null },
    spotLights: { value: null },
    rectAreaLights: { value: null },
    pointLights: { value: null },
    hemisphereLights: { value: null },
    directionalShadowMap: { value: null },
    directionalShadowMatrix: { value: null },
    spotShadowMap: { value: null },
    spotShadowMatrix: { value: null },
    pointShadowMap: { value: null },
    pointShadowMatrix: { value: null },
}*/


    /*{
           diffuse: {type: 'c', value: new THREE.Color(0x0000ff)}
         }*/

    /*let mat=new THREE.ShaderMaterial( {
         uniforms: uniforms,
         derivatives: false,
         lights: true,
         //vertexShader: vertexShader(),
         //fragmentShader: fragmentShader()
         vertexShader: THREE.ShaderChunk.cube_vert,
         fragmentShader: THREE.ShaderChunk.cube_frag
     });
    mat.skinning=true;*/

    //let mat=new THREE.MeshStandardMaterial({  vertexColors: THREE.VertexColors, metalness: 0, roughness: 1.0});
    //mat.defines.BIGGO=true;

    let mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        derivatives: false,
        lights: true,
        vertexColors: true,
        vertexShader: meshphysical_vert,
        fragmentShader: meshphysical_frag
        //vertexShader: THREE.ShaderChunk.cube_vert,
        //fragmentShader: THREE.ShaderChunk.cube_frag
    });

    return mat;
}

function vertexShader() {
    return `
    #include <common>
    varying vec3 vUv; 

    void main() {
      vUv = position; 

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `
}

function fragmentShader() {
    /* return `
      #include <common>
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec3 vUv;

      void main() {
        gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
      }
  `*/

    /*
      return `
    uniform float opacity;
    #if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
        varying vec3 vViewPosition;
    #endif
    #ifndef FLAT_SHADED
        varying vec3 vNormal;
        #ifdef USE_TANGENT
            varying vec3 vTangent;
            varying vec3 vBitangent;
        #endif
    #endif
    #include <packing>
    #include <uv_pars_fragment>
    #include <bumpmap_pars_fragment>
    #include <normalmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <clipping_planes_pars_fragment>
    void main() {
        #include <clipping_planes_fragment>
        #include <logdepthbuf_fragment>
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
    }
      `*/



}


export {
    init,
    getPending,
    animate,
    getModel,
    get,
    make,
    attach,
    findBone,
    treeModel,
    manModel

    //dev only
    ,
    defaultLoad,
    readColors
}