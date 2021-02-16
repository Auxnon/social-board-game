import * as THREE from "./lib/three.module.js";
import * as IK from './lib/three-ik.js';

import * as Render from "./Render.js";
import * as Control from "./Control.js";
import { SkeletonUtils } from "./lib/SkeletonUtils.js";

var pivot
var movingTarget



var testShader;
var helper;
var host
var splined = [];
var currentIterator = 0;

var IKHELP = true;

/*
thighL
shinL
footL

*/
/*ik {chains, feet}

*/

function applyLegs(root, left, right) {
    if (!root.ik) {
        host = root;
        let ik=new IK.IK();
        let fourLegged=left.length && Array.isArray(left[0])

        let xx=root.position.x?root.position.x:0;
        let yy=root.position.y?root.position.y:0;
        
        let foot1 = Render.cubic(.05, .05, .02, xx-0.01, yy, .5);
        let foot2 = Render.cubic(.05, .05, .02, xx+0.01, yy, .5);
        Render.addModel(foot1)
        Render.addModel(foot2)

        let foot3,foot4;
        if(fourLegged){
            foot3 = Render.cubic(.05, .05, .02, xx-0.01, yy+0.01, .5);
            foot4 = Render.cubic(.05, .05, .02, xx+0.01, yy+0.01, .5);
            Render.addModel(foot3)
            Render.addModel(foot4)
        }




        //to reduce tree search
        let constraints = [new IK.IKBallConstraint(90), new IK.IKBallConstraint(90)];
        let searchLeft1 = [];
        let searchRight1 = [];
        let searchLeft2,searchRight2;

        

        if(fourLegged){
            searchLeft2=[];
            searchRight2=[]
            left[0].forEach((item, i) => {
                searchLeft1.push([item, i])
            })
            right[0].forEach((item, i) => {
                searchRight1.push([item, i])
            })
            left[1].forEach((item, i) => {
                searchLeft2.push([item, i])
            })
            right[1].forEach((item, i) => {
                searchRight2.push([item, i])
            })

        }else{
            left.forEach((item, i) => {
            searchLeft1.push([item, i])
            })
            right.forEach((item, i) => {
                searchRight1.push([item, i])
            })
        }


        let leftOut1 = [];
        let rightOut1 = [];
        let leftOut2 = [];
        let rightOut2 = [];
        searchBones(root, leftOut1, searchLeft1)
        searchBones(root, rightOut1, searchRight1)
        if(fourLegged){
            searchBones(root, leftOut2, searchLeft2)
            searchBones(root, rightOut2, searchRight2)
        }


        let chain1 = new IK.IKChain();
        leftOut1.forEach((b, i) => {
            let target = null;
            b.position.z+=0.2*i
            if (i == leftOut1.length - 1)
                target = foot1
            console.log('chickn chained ' + b.name + ' target ' + (target ? true : false))
            chain1.add(new IK.IKJoint(b, { constraints }), { target });
        });

        let chain2 = new IK.IKChain();
        rightOut1.forEach((b, i) => {
            let target = null;
            b.position.z+=0.2*i
            if (i == rightOut1.length - 1)
                target = foot2
            console.log('chickn chained ' + b.name + ' target ' + (target ? true : false))
            chain2.add(new IK.IKJoint(b, { constraints }), { target });
        });

        ik.add(chain1);
        ik.add(chain2);

        if(fourLegged){
            let chain3 = new IK.IKChain();
            leftOut2.forEach((b, i) => {
                let target = null;
                b.position.z+=0.2*i

                if (i == leftOut2.length - 1)
                    target = foot3
                console.log('chickn chained ' + b.name + ' target ' + (target ? true : false))
                chain3.add(new IK.IKJoint(b, { constraints }), { target });
            });

            let chain4 = new IK.IKChain();
            rightOut2.forEach((b, i) => {
                let target = null;
               b.position.z+=0.2*i
                if (i == rightOut2.length - 1)
                    target = foot4
                console.log('chickn chained ' + b.name + ' target ' + (target ? true : false))
                chain4.add(new IK.IKJoint(b, { constraints }), { target });
            });

            ik.add(chain3);
            ik.add(chain4);
        }

        root.ik=ik;

        if(fourLegged)
            root.ik.feet= [foot1, foot2,foot3,foot4]
        else
            root.ik.feet= [foot1, foot2] 

        root.ik.footing= 0;

        if (IKHELP) {
            if (helper) {
                Render.removeModel(helper);
            }
            helper = new IK.IKHelper(ik);
            Render.addModel(helper);
        }


    }


}

function searchBones(bone, output, search) {
    if (search.length == 0)
        return;

    if (bone && bone.type == 'Bone') {
        for (let i = 0; i < search.length; i++) {
            if (search[i][0] == bone.name) {
                output[search[i][1]] = bone;
                search.splice(i, 1)
                break;
            }
        }
    }
    if (bone.children && bone.children.length > 0) {
        bone.children.forEach(b => {
            searchBones(b, output, search)
        })
    }


}


function init() {


    window.addEventListener('keyup', ev => {

        if (ev.which == '87') {


            if (window.lastMesh) {
                
                    
                let check
                if(window.lastMesh.type=='Group')
                    check=window.lastMesh.children[0];
                else
                    check=window.lastMesh
                

                let chicken= SkeletonUtils.clone(window.lastMesh);

                Render.addModel(chicken);
                //makeSpline(chicken)
                if(check.name=='hedgehog')
                    applyLegs(chicken, [[ 'upper_armL', 'forearmL'],[ 'thighL', 'shinL']], [[ 'upper_armR', 'forearmR'],[ 'thighR', 'shinR']]);
                else
                    applyLegs(chicken, [ 'thighL', 'shinL', 'footL'], [ 'thighR', 'shinR', 'footR']);


                splined.push(chicken);
                current = chicken;
                window.current=current
                //iks.push(ik)
            }
        } else if (ev.which == '65') {
            currentIterator++
            if (currentIterator >= splined.length)
                currentIterator = 0;
            current = splined[currentIterator]
            window.current=current

        }
    })
    window.addEventListener('click', navPoint)
}

function makeSpline(target) {
    host = target


    let chain = new IK.IKChain();
    let chain2 = new IK.IKChain();

    let constraints = [new IK.IKBallConstraint(90), new IK.IKBallConstraint(90)];


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

    target.children.forEach(obj => {
        if (obj.type == 'Bone') {
            walkBone(obj, chain, constraints, 0, false)
            walkBone(obj, chain2, constraints, 0, true)

        } else if (obj.type == 'Object3D') {
            walkBone(obj.children[0], chain, constraints, 0, false)
            walkBone(obj.children[0], chain2, constraints, 0, true)


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
    ik.add(chain2);
    //target.add(ik.getRootBone());


    // Create a helper and add to the scene so we can visualize
    // the bones



}

function walkBone(bone, chain, constraints, iterator, alt) {
    if (bone && bone.type == 'Bone') {
        let nextBone;
        let target;

        if (bone.children && bone.children.length > 0) {
            bone.position.y += .01 * iterator
            if (bone.children.length > 1 && bone.name == 'spine004') { //length >1 spine005 is neck
                if (alt)
                    nextBone = bone.children[4] //4
                else
                    nextBone = bone.children[3] //4
            } else
                nextBone = bone.children[0]
        } else {
            target = alt ? feet[1] : feet[0]; //Render.getCursor()//movingTarget
        }
        if (iterator > 1) {
            //if(iterator==2)
            //bone.position.z-=0.1
            let constraint = iterator == 5 ? constraints[0] : constraints[1]
            console.log('chickn chained ' + bone.name)
            chain.add(new IK.IKJoint(bone, { constraints }), { target });
        }
        if (nextBone)
            walkBone(nextBone, chain, constraints, iterator + 1, alt)
    }
}

function animate() {
    if (splined.length) {

        //pivot.position.set(Control.x(),Control.y(),Control.z())
        /*iks.forEach(ikk=>{
            ikk.solve();
        })*/
        splined.forEach(entity=>{
            entity.ik.solve();
        })
        


    }
    if (testShader) {
        testShader.uniforms.time.value += 0.05;
        if (testShader.uniforms.time.value > 100.0)
            testShader.uniforms.time.value = 0.0
    }
    feetAnimate();

}










//============

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
    precision mediump float;
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
varying vec2 vUv;
varying vec3 vertcolor;
varying vec3 vertpos;
uniform float time;
uniform sampler2D texture1;

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

    //vec2 uv  = texture2D(BaseImage, gl_TexCoord[0].st).rg;
    
    if(vertcolor==vec3(0,0,1)){
        outgoingLight=vec3(0.069, 0.213, 0.398);
        outgoingLight*=0.75+(vertpos.z+0.05)/0.1;
        float offset=mod(time/120.0,0.5);
        vec4 texel=texture2D(texture1, vUv/2.0+vec2(offset,0));
        vec4 texel2=texture2D(texture1, vUv/2.0+vec2(0,offset));
        outgoingLight.rgb+=(texel.r*texel2.r);
        diffuseColor.a-=(texel.r*texel2.r);
        //outgoingLight.x=sin(sqrt(pow((mod(time,3.1457)+vUv.x-0.5),2.0)+pow((vUv.y-0.5),2.0))*20.0);
        //outgoingLight.x=fwidth(sin((mod(time,6.2832)+vertpos.x)));
        float vv=fwidth(vertpos.z);
        outgoingLight+=vv*vv;
        //diffuseColor.a=0.0;
        //float lum=2.0*fwidth(dot(outgoingLight,vec3(0.8,0.6,0.4)));//vec3(0.2126, 0.7152, 0.0722));
    }
   // outgoingLight.y=outgoingLight.x;
    //outgoingLight.z=outgoingLight.x;


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

    var meshphysical_vert = `
    precision mediump float;
    #define STANDARD
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
uniform float time;


varying vec2 vUv;
varying vec3 vertcolor;
varying vec3 vertpos;



void main() {

    #include <uv_vertex>
    #include <uv2_vertex>
    #ifdef USE_COLOR
        //if(color==vec3(0,0,1))
            //vColor.xyz = shirt;
        //else
            vColor.xyz = color.xyz;

        vUv = uv;
        vertcolor=vColor;
        
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

        vertpos=(modelMatrix * vec4( position, 1.0 )).xyz;
        if(color==vec3(0.12890625, 0.30859375, 0.3125)){
            float val=max(0.0, 1.0976 - transformed.z);
            transformed.xyz+=val*wind;

            transformed.y*=1.0+sin((wind.z+transformed.z)*4.0)/2.0;

        } 

        

        if(transformed.z<0.15){
            vertpos.z=sin(time+vertpos.x)*0.05;

            transformed.z-=vertpos.z;
        }
        
        
    

    //#include <project_vertex>
    vec4 mvPosition = vec4( transformed, 1.0 );
    #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
    #endif
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;


    if(color.g==0.5711299305714503){//0.35640497444113833, 0.5711299305714503, 0.0042267490653849086)){
            //color=vec3(1,0,0);
            float val=gl_Position.x+time;
            //if(mod(val,6.28)>2.0){
                gl_Position.x*=1.0+sin(val)/20.0;
            //}
        }

    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    vViewPosition = - mvPosition.xyz;
    #include <worldpos_vertex>
    

    #include <shadowmap_vertex>
    #include <fog_vertex>
    
}`

    let texture = new THREE.TextureLoader().load("./assets/caustics.jpg")
    window.texture = texture
    var uniforms = THREE.UniformsUtils.merge(
        [ //THREE.ShaderLib.phong.uniforms,
            THREE.ShaderLib['standard'].uniforms,
            {
                shirt: { value: new THREE.Vector3(1, 0, 0) },
                wind: { value: new THREE.Vector3(0, 0, 0) },
                time: { value: 0.0 },
                texture1: { type: "t", value: texture }
                //texture1: { type: "t", value:  }

            }
        ]
    );

    uniforms.ambientLightColor.value = null;


    //document.body.appendChild(texture.image)



    let mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        //defines: {STANDARD:''},
        derivatives: true,
        lights: true,
        vertexColors: true,
        vertexShader: meshphysical_vert,
        fragmentShader: meshphysical_frag,
        // THREE.ImageUtils.loadTexture
        //vertexShader: THREE.ShaderChunk.cube_vert,
        //fragmentShader: THREE.ShaderChunk.cube_frag
    });
    mat.uniforms.texture1.value = texture;
    //mat= new THREE.MeshBasicMaterial({map:texture});

    testShader = mat

    return mat;
}










////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////


let current;

function navPoint(ev) {

    let mainPos = Control.pos();

    let count = splined.length;

    
    let c = count;
    let pos = [];
    let tau = Math.PI * 2;
    let r = tau / c;
    let size = c/8.0;
    let rings;//=[5]
    if(count<=5) //5
        rings=[[count,0]]
    else if(count>5 && count<=11) //12
        rings=[[3,0],[count-3,7/8.0]]
    else if(count>12 && count<=16) //17
        rings=[[5,0],[count-5,9/8.0]] 
    else
        rings=[[3,0],[5,7/8.0],[count-8,11/8.0]]

    rings.forEach(ring=>{
        let size=ring[0]/8.0
        size=Math.max(size,ring[1])
        let r = tau / ring[0];
         for (let i = 0; i < ring[0]; i++) {
            pos.push({ x: mainPos.x + size * 2 * Math.cos(i * r), y: mainPos.y + size * 2 * Math.sin(i * r) })
        }
    })
   

    splined.forEach((entity, i) => {
        if (entity.path && entity.path.points)
            clear(entity);
        entity.ik.footing = 0;
        let mover = entity
        if (!mover.path)
            mover.path = { points: [] };


        let n = { x: mover.position.x - pos[i].x, y: mover.position.y - pos[i].y }
        let r = Math.sqrt(n.x * n.x + n.y * n.y);
        let d = { x: n.x / r, y: n.y / r };
        let count = Math.floor(r)
        let alt = false

        for (let j = 0; j < count; j++) {
            alt = j % 2 == 0
            dot(mover, mover.position.x - j * 1 * d.x + (alt ? 1 : -1) * d.y * .2, mover.position.y - j * 1 * d.y + (alt ? -1 : 1) * d.x * .2);
            if(mover.ik.feet.length==4)
                dot(mover, mover.position.x - j * 1 * d.x + (alt ? 1 : -1) * d.y * .2, mover.position.y - j * 1 * d.y + (alt ? -1 : 1) * d.x * .2);
        }
        dot(mover, pos[i].x + (alt ? -1 : 1) * d.y * .2, pos[i].y + (alt ? 1 : -1) * d.x * .2);
        dot(mover, pos[i].x + (alt ? 1 : -1) * d.y * .2, pos[i].y + (alt ? -1 : 1) * d.x * .2);
        if(mover.ik.feet.length==4){
            dot(mover, pos[i].x + (alt ? -1 : 1) * d.y * .2, pos[i].y + (alt ? 1 : -1) * d.x * .2);
            dot(mover, pos[i].x + (alt ? 1 : -1) * d.y * .2, pos[i].y + (alt ? -1 : 1) * d.x * .2);

        }

        dot(mover, pos[i].x, pos[i].y, 0.5)
    })


}

function dot(host, x, y, s) {
    if (!s)
        s = .2;
    /*let model = Render.plane(s, s)
    model.position.set(x, y, 0.5)
   
    Render.addModel(model);
    host.path.points.push(model)*/
    host.path.points.push({position:{x:x,y:y}})
}

function clear(host) {
    if(host.path){
         host.path.points.forEach(model => {
        Render.removeModel(model)
        })
        host.path.points = [];
    }
}



function feetAnimate() {
    if (splined.length > 0) {
        splined.forEach(host => {
            if (host.path && host.path.points.length > 0) {

                let fourLegged=host.ik.feet.length==4

                let mover = host;


                let foot= host.ik.feet[host.ik.footing]


                let n = { x: foot.position.x - host.path.points[0].position.x, y: foot.position.y - host.path.points[0].position.y };
                let r = Math.sqrt(n.x * n.x + n.y * n.y);
                foot.position.x -= .2 * n.x / r;
                foot.position.y -= .2 * n.y / r;

                let sx,sy;
                if(fourLegged){
                    sx = (host.ik.feet[0].position.x + host.ik.feet[1].position.x +host.ik.feet[2].position.x + host.ik.feet[3].position.x)/4;
                    sy = (host.ik.feet[0].position.y + host.ik.feet[1].position.y +host.ik.feet[2].position.y + host.ik.feet[3].position.y)/4;
                }else{
                    sx = (host.ik.feet[0].position.x + host.ik.feet[1].position.x)/2;
                    sy = (host.ik.feet[0].position.y + host.ik.feet[1].position.y)/2;
                }
                 


                mover.position.x = (sx)
                mover.position.y = (sy)
                mover.position.z = 2.5;
                let tx = mover.position.x - host.path.points[host.path.points.length - 1].position.x
                let ty = mover.position.y - host.path.points[host.path.points.length - 1].position.y
                let tr = Math.sqrt(tx * tx + ty * ty)

                if (tr > 1)
                    mover.rotation.z = Math.atan2(ty, tx) - Math.PI / 2

                if (r <= .1) {
                    let m = host.path.points.shift()
                    Render.removeModel(m)
                    host.ik.footing++
                    if(host.ik.footing> (fourLegged?3:1))
                         host.ik.footing=0
                }
            }
        })
    }
}

export { init, animate, makeShader }