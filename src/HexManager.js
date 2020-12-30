import * as Render from "./Render.js";
import * as Helper from "./Helper.js";
import * as PictureMaker from "./PictureMaker.js";
import * as Online from "./Online.js";

import * as THREE from "./lib/three.module.js";

//grass #6CA90B
//grass2/tree leaf #A1C73A
//grass3 #53963F
//path #BEB55D
//mountain/dirt #907B67
///riverside #999065  river edged grass use grass3
//river #659799
// tree #B68A61
//tree2 #8C735B

/* house
wall #B9AE8C
roof #70665C
hinges #20140E
door #67483C
window #67483C
#703212*/

var chunks=[];



var hex = []
var landBits = []
var grid = [];
const SCALE = 8
const SIZE = 32
const HALF_GRID = 12 * SCALE / 2

var hexType = 2;

var hexSelector

var hexDebounce;
var gridLineModel;

function init() {



    Render.loadModel('./assets/models/Hex.glb', m => {
        console.log('got children ' + m.children.length)
        let basicMat = new THREE.MeshStandardMaterial({ vertexColors: THREE.VertexColors, metalness: 0, roughness: 1.0 }); // 
        //basicMat.shading = THREE.SmoothShading;
        for(let i = 0; i < m.children.length; i++) {
            //m.children[i]
            let mm = m.children[i]
            //mm.geometry.computeVertexNormals(true);
            //m.children[i].scale.set(200,200,200)
            //mm.rotation.x=Math.PI/2
            mm.position.set(0, 0, 60)
            mm.scale.set(SCALE, SCALE, SCALE)
            //mm.material= new THREE.MeshBasicMaterial( {color: 0x20E89F, side: THREE.FrontSide} );

            mm.material = basicMat
            mm.receiveShadow = true;
            if(mm.name.startsWith("Mount") || mm.name.startsWith("Tree") || mm.name.startsWith("House"))
                mm.castShadow = true;
            //Render.addModel(mm)
            hex[mm.name] = mm;

            let colors = [];
            if(mm.geometry) {


                let count = mm.geometry.attributes.color.array.length / 4
                for(let i = 0; i < count; i++) {
                    let n = i * 4;
                    let vr = mm.geometry.attributes.color.array[0 + n];
                    let vg = mm.geometry.attributes.color.array[1 + n];
                    let vb = mm.geometry.attributes.color.array[2 + n];
                    //let va=mm.geometry.attributes.color.array[3+n];
                    let val = Helper.rgbFloatToHex(vr, vg, vb)
                    colors[val] = val
                }

                //console.log(colors)
            }

            //console.log(vr,vg,vb,va)
            //let val=Helper.rgbFloatToHex(mm.geometry.attributes.color.array[0],mm.geometry.attributes.color.array[1],mm.geometry.attributes.color.array[2])
            //console.log(val)



        }

        function clik(d, i) {
            d.addEventListener('click', ev => {
                console.log('clicking hex')
                let target = ev.target;
                if(!target.classList.contains('hex')) {
                    target = target.parentElement
                }
                target.classList.remove('jelloAnim')
                void target.offsetWidth;
                target.classList.add('jelloAnim')
                setType(i)
            })
        }

        let doms = document.querySelectorAll('.hex')
        doms[0].appendChild(PictureMaker.generate(getModel('Grass_O1')));
        clik(doms[0], 1);
        doms[1].appendChild(PictureMaker.generate(getModel('Tree_N'), 75, -75));
        clik(doms[1], 4);
        doms[2].appendChild(PictureMaker.generate(getModel('Grass_P1')));
        clik(doms[2], 2);
        doms[3].appendChild(PictureMaker.generate(getModel('Mount_N'), 90));
        clik(doms[3], 3);
        doms[4].appendChild(PictureMaker.generate(getModel('Water_N')));
        clik(doms[4], 0);
        doms[5].appendChild(PictureMaker.generate(getModel('House_N')));
        clik(doms[5], 5);

        clearLand()

        processLand();





        //window.m=m;//.children[0]
    })
    pointerInit();
    hexLines();

}

function pointerInit() {
    let pointerMat = new THREE.MeshBasicMaterial({ color: 0x4AE13A });

    let g = new THREE.Group();
    let p = new THREE.PlaneBufferGeometry(.6, SCALE);
    let m = new THREE.Mesh(p, pointerMat)
    m.position.set(SCALE, 0, 0)
    g.add(m)
    for(let i = 0; i < 6; i++) {
        let n = m.clone();
        n.rotation.z = i * Math.PI / 3

        n.position.set(Math.cos(n.rotation.z) * SCALE, Math.sin(n.rotation.z) * SCALE, 0)
        g.add(n)
    }
    g.position.z += 6;
    Render.addModel(g)
    hexSelector = g;
    hexSelector.visible = false;
}

function hexLines() {
    let radius = 1;
    let skew = SCALE * radius * Math.sqrt(3) / 2;


    //dummy.position.set(offsetx+i*9,0,offsetz+j*skew*2 +i*skew);
    //let m=hex[prefix+st].clone();
    //m.position.set((-HALF_GRID)+x*skew*2 +y*skew,y*SCALE*1.5,-SCALE*.2)

    var geometry = new THREE.Geometry();
    let my = SCALE / 2;
    for(let x = 0; x < SIZE; x++) {
        for(let y = 0; y < SIZE; y++) {
            geometry.vertices.push(new THREE.Vector3((-HALF_GRID + skew) + x * skew * 2 + y * skew, -my + y * SCALE * 1.5, .8))
            geometry.vertices.push(new THREE.Vector3((-HALF_GRID + skew) + x * skew * 2 + y * skew, my + y * SCALE * 1.5, .8))
            geometry.vertices.push(new THREE.Vector3((-HALF_GRID + skew) + x * skew * 2 + y * skew, my + y * SCALE * 1.5, .8))
            geometry.vertices.push(new THREE.Vector3((-HALF_GRID) + x * skew * 2 + y * skew, SCALE + y * SCALE * 1.5, .8))
            geometry.vertices.push(new THREE.Vector3((-HALF_GRID) + x * skew * 2 + y * skew, SCALE + y * SCALE * 1.5, .8))
            geometry.vertices.push(new THREE.Vector3((-HALF_GRID - skew) + x * skew * 2 + y * skew, my + y * SCALE * 1.5, .8))
        }
    }
    /*geometry.vertices.push( new THREE.Vector3( -2, 0, 0 ) );
	geometry.vertices.push( new THREE.Vector3( 0, 2, 0 ) );
	geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
	geometry.vertices.push( new THREE.Vector3( 2, 0, 0 ) );*/

    var material = new THREE.LineBasicMaterial({ color: 0xffffff });
    gridLineModel = new THREE.LineSegments(geometry, material);
    //Render.addModel( line );
}

function setGrid(bool) {
    if(bool) {
        Render.addModel(gridLineModel);
    } else {
        Render.removeModel(gridLineModel);
    }
}

function place(x, y, t) {
    grid[x][y] = t
    processLand();
}

function processLand() {
    SEED = 6;
    modelClear()
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid.length; j++) {
            let n = grid[i][j];
            let rando = Math.floor(randomSeed(1, 4))
            let turner = Math.floor(randomSeed(1, 6))
            if(n != 1) { //hex coordinate system follows, hang tight it's a bumpy ride!
                //if(i==2 && j==2)
                //debugger
                let l, r, tl, tr;

                l = (i > 0) ? grid[i - 1][j] : 0
                // pure hex x left right
                r = (i < grid.length - 1) ? grid[i + 1][j] : 0


                //land('P1',i,j,1)

                //upper hex edges, left and right

                if(j < grid.length - 1) {

                    tl = (i > 0) ? grid[i - 1][j + 1] : 0
                    tr = grid[i][j + 1]
                } else {
                    tl = 0;
                    tr = 0;
                }

                //land('T1',i,j,1)

                //lower hex edges, left and right, notice the farther then normal postive check due to our skewed hex design

                let bl, br;
                if(j > 0) {
                    bl = grid[i][j - 1]
                    br = (i < grid.length - 1) ? grid[i + 1][j - 1] : 0
                } else {
                    bl = 0;
                    br = 0;
                }
                l = l == n;
                r = r == n;
                tr = tr == n;
                br = br == n;
                bl = bl == n;
                tl = tl == n;

                let st = (tl ? '1' : '0') + (l ? '1' : '0') + (bl ? '1' : '0') + (br ? '1' : '0') + (r ? '1' : '0') + (tr ? '1' : '0');


                //let total=l?1:0 + r?1:0 + tl?1:0 + tr?1:0 + bl?1:0 + br?1:0;
                let start = -1;
                let index = 0;
                let circle = [tl, tr, r, br, bl, l]
                let branches = [];
                let hole = 5;
                circle.forEach((b, i) => {
                    if(b) {
                        branches.push(i)
                        if(start == -1)
                            start = i;

                        index = i;
                    } else
                        hole = i
                })
                //console.log('grid %i %i %s branches %i',i,j,st,branches.length)

                let letter = 'N'
                let type = ''
                if(branches.length == 6) {
                    land(n, 'H' + type, i, j, Math.floor(turner));
                } else if(branches.length > 0) {
                    let distances = [];

                    var last = branches[0]
                    for(let i = 1; i < branches.length; i++) {
                        distances.push((branches[i] - last) - 1)
                        last = branches[i]
                    }
                    //console.log(distances)

                    let r = start == -1 ? 0 : start;

                    switch (branches.length) {
                        case 1:
                            letter = 'E'
                            r += 0;
                            break;

                        case 2:
                            letter = 'P';
                            if(distances[0] == 0) {
                                type = '3';
                                r += 0;
                            } else if(distances[0] == 1) {
                                type = '2';
                                r += 0;
                            } else if(distances[0] == 2) {
                                type = '1';
                                r += 0;
                            } else if(distances[0] == 3) {
                                type = '2';
                                r += 4;
                            } else {
                                type = '3';
                                r += 5;
                            }
                            break;

                        case 3:
                            letter = 'T'; //3 paths
                            if(distances[0] == 0) {
                                if(distances[1] == 0) {
                                    type = 1;
                                    r += 0;
                                } else if(distances[1] == 3) {
                                    type = 1;
                                    r += 5;
                                } else if(distances[1] == 1) {
                                    type = 3;
                                    r += 3;
                                } else if(distances[1] == 2) {
                                    type = 2;
                                    r += 4;
                                }
                            } else if(distances[0] == 1) {
                                if(distances[1] == 0) {
                                    type = 2; //r+=0;
                                } else if(distances[1] == 1) {
                                    type = 4; //r+=0;
                                } else if(distances[1] == 2) {
                                    type = 3;
                                    r += 2;
                                }
                            } else if(distances[0] == 2) {
                                if(distances[1] == 0) {
                                    type = 3;
                                    r += 0;
                                } else if(distances[1] == 1) {
                                    type = 2;
                                    r += 3;
                                }
                            } else {
                                type = 1;
                                r += 4;
                            }
                            r = r % 6;
                            break;

                        case 4:
                            letter = 'Q'; //4 path
                            if(distances[0] == 0) {
                                if(distances[1] == 0) {
                                    if(distances[2] == 0) {
                                        type = 1;
                                        r += 0
                                    } else if(distances[2] == 1) {
                                        type = 3;
                                        r += 2;
                                    } else if(distances[2] == 2) {
                                        type = 1;
                                        r += 5;
                                    }
                                } else if(distances[1] == 1) {
                                    if(distances[2] == 0) {
                                        type = 2;
                                        r += 4;
                                    } else if(distances[2] == 1) {
                                        type = 3;
                                        r += 1
                                    }
                                } else { //}( 2==2)
                                    type = 1;
                                    r += 4;
                                }
                            } else if(distances[0] == 1) {
                                if(distances[1] == 0) {
                                    if(distances[2] == 0) {
                                        type = 3;
                                        r += 4;

                                    } else {
                                        type = 2;
                                    }
                                } else { //1 1 0
                                    type = 3
                                }
                            } else {
                                type = 1;
                                r += 3;
                            }
                            r = r % 6;
                            break;

                        case 5:
                            letter = 'F';
                            r = hole + 1;
                            break;



                    }
                    land(n, letter + type, i, j, r)
                } else {
                    land(n, 'N', i, j, 0)
                }



                //rotation 0 tl
                //1 l
                //2 bl
                //3 br
                //4 r
                //5 tr
                /*
                				switch(total){
                					case 1: land('P2',i,j); break;
                					case 2: land('P1',i,j); break;
                					case 3: land('T1',i,j); break;
                					case 4: land('Q1',i,j); break;
                					case 5: land('F1',i,j); break;
                					case 6: land('H',i,j); break;
                					default: land('O1',i,j);
                				}*/

                //land('Q1',i,j,1)


                //no neighbors! 
                //land('P1',i,j,n-2)

            } else if(n == 1) {
                //SEED=i*j
                land(n, 'O' + rando, i, j, Math.floor(turner)) //,Math.floor(Math.random()*6))
            }
        }

    }
}

function land(n, st, x, y, r) {
    //n==1 grass, n==2 path, n==3 mount
    let radius = 1;
    let skew = SCALE * radius * Math.sqrt(3) / 2;
    let prefix = "Grass_";
    switch (n) {
        case 1:
            prefix = "Grass_";
            break; //more efficient as it's most common
        case 0:
            prefix = "Water_";
            break;
        case 3:
            prefix = "Mount_";
            break;
        case 4:
            prefix = "Tree_";
            break;
        case 5:
            prefix = "House_";
            break;
    }

    //dummy.position.set(offsetx+i*9,0,offsetz+j*skew*2 +i*skew);
    let picked = hex[prefix + st];
    if(picked) {
        let m = picked.clone();
        m.position.set((-HALF_GRID) + x * skew * 2 + y * skew, y * SCALE * 1.5, -SCALE * .2) //z -SCALE*.2
        if(r) { //sp always not 0
            r = 6 - r;
            m.rotation.z = r * Math.PI / 3
        }

        landBits.push(m)
        Render.addModel(m)
    } else {
        console.log('invalid model ' + prefix + st)
    }

}

function modelClear() {
    landBits.forEach(m => {
        Render.removeModel(m)
    })
    landBits = [];
}

function clearLand() {

    modelClear()
    for(let i = 0; i < SIZE; i++) {
        grid[i] = [];
        for(let j = 0; j < SIZE; j++) {
            grid[i][j] = 1
        }
    }
}

function hexCheck(x, y) {

    let radius = 1;
    let skew = SCALE * radius * Math.sqrt(3) / 2;
    //m.position.set(-120+x*skew*2 +y*skew,-120+y*30,40)
    let y2 = Math.floor((SCALE + y) / (SCALE * 1.5));
    let x2 = Math.floor(((x + HALF_GRID + SCALE) - y2 * skew) / (skew * 2))
    hexSelector.position.set(-HALF_GRID + x2 * skew * 2 + y2 * skew, y2 * SCALE * 1.5, .8)

    return [x2, y2]


}
let lastPick = { x: 0, y: 0 }
let hexChangeCount = 0;

function hexPick(x, y) {
    let [x2, y2] = hexCheck(x, y)

    //console.log('click',x,y,x2,y2)
    let bounds = grid.length;
    if(!(x2 == lastPick.x && y2 == lastPick.y) && x2 > -1 && y2 > -1 && x2 < bounds && y2 < bounds) {
        /*let v=grid[x2][y2];
		
        if(v==hexType)	
        	v=1
        else
        	v=hexType*/

        //if(hexChangeCount==0)

        if(hexChangeCount == 0 && grid[x2][y2] == hexType) {
            place(x2, y2, 1)
        } else {
            place(x2, y2, hexType)
        }
        hexChangeCount++;

        /*if((x2==lastPick.x && y2==lastPick.y)){

        }*/




        lastPick.x = x2;
        lastPick.y = y2;
        if(hexDebounce) {
            clearTimeout(hexDebounce)
            hexDebounce = null
        }
        hexDebounce = setTimeout(function() {
            Online.terrain(0, compress(grid))
        }, 2000)

    }
}

function refreshCount() {
    hexChangeCount = 0;
    lastPick.x = 0;
    lastPick.y = 0;
}







var SEED = 6;

// in order to work 'Math.seed' must NOT be undefined,
// so in any case, you HAVE to provide a Math.seed
function randomSeed(max, min) {
    max = max || 1;
    min = min || 0;

    SEED = (SEED * 9301 + 49297) % 233280;
    var rnd = SEED / 233280;

    return min + rnd * (max - min);
}


function toggleType() {
    if(hexType == 2)
        hexType = 3
    else if(hexType == 3)
        hexType = 4
    else if(hexType == 4)
        hexType = 0
    else if(hexType == 0)
        hexType = 1;
    else
        hexType = 2
}

function setType(i) {
    hexType = i;
    console.log('set hex ' + hexType)
}

function getModel(st) {
    return hex[st].clone();
}

function updateTerrain(chunk, data) {
    grid = decompress(data)

    processLand();
}

function toggleSelector(bool) {
    hexSelector.visible = bool;
}

function compress(array){
    let st=''
    for(let i=0;i<array.length;i++){
        for(let j=0;j<array.length;j++){
            st+=String.fromCharCode(array[i][j])
        }
    }
    //console.log('hex out ',st)
    return st;
}
function decompress(st){
    //Math.sqrt(st.length)
    let size=SIZE;
    let array=[];
    for(let i=0;i<size;i++){
        array[i]=[]
        for(let j=0;j<size;j++){
            array[i][j]=st.charCodeAt(i*size+j);////String.fromCharCode(array[i][j])
        }
    }
    return array;
}





export { init, hexCheck, hexPick, toggleType, setType, getModel, updateTerrain, setGrid, refreshCount, toggleSelector }