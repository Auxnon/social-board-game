import * as UI from "./UI.js";
import * as Render from "./Render.js";
import * as HexManager from "./HexManager.js";
//import * as AssetManager from "./AssetManager.js";
import * as Environment from "./Environment.js";
import * as Online from "./Online.js";
import * as Physics from "./Physics.js";
import * as BarUI from "./BarUI.js";
import * as Helper from "./Helper.js";
import * as PlayerManager from "./PlayerManager.js";
import * as MakerMenu from "./MakerMenu.js";
import * as AssetManager from "./AssetManager.js";
import * as Equipment from "./Equipment.js";



//import * as World from "./World.js";
import {
    OrbitControls
} from "./lib/OrbitControls.js";
import * as THREE from "./lib/three.module.js";


var vrEnabled;

var touchCountDebounce = undefined;
var singleTouch = false;

var controllers
var orbital;
var mdown = false;
var mx = 0;
var my = 0;
var px = 0,
    py = 0,
    pz = 0;
var menuLocked = false;

var velArray = [];
var velocity = { x: 0, y: 0, z: 0 };
var posObject={x:0,y:0,z:0}


var state;
var heldPhys = 0;
var lastRot = 0;


function init() {
    window.posObject=posObject
    //window.addEventListener('click',animationControl)
    let target = document.querySelector('.canvasHolder');
    window.addEventListener('pointermove', pointermove);
    //target.addEventListener('mousedown', mousedown);
    //target.addEventListener('mouseup', mouseup);

    //target.addEventListener('touchstart', touchstart);
    //target.addEventListener('touchend', touchend);
    target.addEventListener('pointerdown', pointerdown);
    window.addEventListener('pointerup', pointerup);

    window.addEventListener('contextmenu', contextmenu);
    window.addEventListener('keyup', keyup);
    //initSettings();
}
var zoomLevelToggle = false

function setRenderer(renderer, renderDom, camera, VR) {
    defineOrbital(renderDom, camera)
    if(VR) {
        defineVRControl(renderer)
    }
}

function defineOrbital(renderDom, camera) {
    orbital = new OrbitControls(camera, renderDom);
    orbital.callbackCounts = (count) => {
        //HexManager.hexPick(px,py)


        if(count == 1) {
            touchCountDebounce = setTimeout(function() {
                singleTouch = true;
            }, 100)

        } else if(touchCountDebounce) {
            clearTimeout(touchCountDebounce);

        }
    }


    orbital.mouseButtons = {
        LEFT: undefined,
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.PAN //THREE.MOUSE.DOLLY
    }


    orbital.maxPolarAngle = 1.3;
    orbital.isControl()
    primaryTouchPan();

    orbital.addEventListener('change', function(ev) {
        var zoom = orbital.target.distanceTo(orbital.object.position);
        //console.log(zoom)
        //zoom 30 scale 0
        //zoom 100 scale 1
        //zoom 180 scale 2
        //
        if(zoom < 30) {
            if(zoomLevelToggle != 0)
                Environment.changeShadowScale(0);
            zoomLevelToggle = 0
        } else if(zoom < 100) {
            if(zoomLevelToggle != 1)
                Environment.changeShadowScale(1);
            zoomLevelToggle = 1
        } else if(zoom < 180) {
            if(zoomLevelToggle != 2)
                Environment.changeShadowScale(2);
            zoomLevelToggle = 2
        } else {
            if(zoomLevelToggle != 3)
                Environment.changeShadowScale(3);
            zoomLevelToggle = 3
        }
        /*
                if(zoom > 75) {
                    if(zoomLevelToggle != 2) {
                        zoomLevelToggle = 2;
                        //Environment.changeShadowScale(1); //DEV
                    }
                } else {
                    if(zoomLevelToggle != 1) {
                        zoomLevelToggle = 1;
                        //Environment.changeShadowScale(0);
                    }
                }*/
        Environment.setShadowPos(orbital.target)
        HexManager.setHexFocus(orbital.target)
        //console.log('changed camera '+orbital.object.position.y)
    })

    orbital.addEventListener('end', function(ev) {
        if(touchCountDebounce) {
            clearTimeout(touchCountDebounce)
        }
        singleTouch = false;
    });


}

function secondaryTouchPan() {
    console.log('p2')

    orbital.touches = {
        ONE: 69, //PAN 
        TWO: THREE.TOUCH.DOLLY_PAN //DOLLY_ROTATE
        //THREE: THREE.TOUCH.DOLLY_PAN
    }
}

function primaryTouchPan() {
    console.log('p1')
    orbital.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_ROTATE
    }
}


function defineVRControl(renderer) {
    /*
        controllers=[];
        window.controllers=controllers
        for (let i = 0; i < 2; ++i) {
          const controller = renderer.xr.getController(i);
         

          let model=AssetManager.make("shroom")
          model.scale.set(0.5,0.5,0.5)
     
          controller.add(model);
          Render.addToCameraGroup(controller);
         controllers.push({controller: controller, model: model});
        }*/


}
var buttonBobs = [] //DEV
var vrSession

function enterVR() {
    /*if(controllers && controllers.length){
        vrSession =Render.getRenderer().xr.getSession();
        if(vrSession){
            /*for (let i = 0; i < 2; ++i) {
                controllers[i].source=session.inputSources[i]
            }*/
    /*for(let j=0;j<7;j++){
        let bob=Render.cubit(0.1,0.1,0.1, 2+j*0.2, 0.2, 1)
        buttonBobs.push(bob)
        Render.addModel(bob)
    }*/
    /*}
    }
    orbital.enabled=false;
    vrEnabled=true;*/
}

/*
function mousedown(ev) {
    if(ev.which !== 1) { //2 mid and 3 right
        return false;
    }
    mdown = true;

    return true;
}

function mouseup(ev) {
    if(ev.which === 2) {
        return false;
    }
    if(mdown) {
        if(!bubbleMenu) { //&& !orbital.isControl()){
            if(callback)
                callback();
        }
    }
    mdown = false;
    endPointer(ev);
}

function touchstart(ev) {
    mdown = true;
    mx = ev.touches[0].clientX;
    my = ev.touches[0].clientY;
    //startCircle(mx, my);
    return true;
}

function touchend(ev) {
    if(mdown) {
        if(!bubbleMenu && !orbital.isControl()) {
            if(callback)
                callback();
        }
    }
    mdown = false;
    //endCircle();
    endPointer(ev);
}
*/
function pointerdown(ev){
    if(ev.button==0){
        mdown=true
    }
    mx=ev.clientX
    my=ev.clientY
}
function pointerup(ev){
    mdown = false;
    endPointer(ev);
}
function pointermove(ev) {
    mx = ev.clientX;
    my = ev.clientY;
}

function endPointer() {
    if(state == 'landscapeCard')
        HexManager.refreshCount()
    else if(state =='equipmentCard')
        Equipment.pointerUp(mx,my)

    //closeBubbleMenu();
}

function getCursor() {
    return {
        on: mdown,
        x: mx,
        y: my
    }
}

function screenX() {
    return mx;
}

function screenY() {
    return my;
}

function x() {
    return px;
}

function y() {
    return py;
}

function z() {
    return pz;
}

function pos() {
    

    return posObject;
}

function down() {
    return mdown && !orbital.isControl();
}

function setVector(pos) {
    let vel = { x: (pos.x - px), y: (pos.y - py), z: (pos.z - pz) };
    velArray.push(vel);
    if(velArray.length > 6)
        velArray.shift();

    px = pos.x;
    py = pos.y;
    pz = pos.z;

    posObject=pos;
    switch (state) {
        case "landscapeCard":
            if(!mdown)
                HexManager.hexCheck(px, py)

            if(singleTouch || mdown)
                HexManager.hexPick(px, py)

            break;
        case "makerCard":

            if(singleTouch || mdown) {
                let selected = MakerMenu.getSelection();
                if(selected) {
                    if(selected=='trash'){
                        let closest=Physics.findWithin(1,pos)
                        if(closest!=undefined)
                            Online.physDel(closest)
                    }else{
                        singleTouch = false;
                        mdown = false;
                        calcRot();
                        let name = selected.charAt(0).toUpperCase() + selected.slice(1)
                        if(selected.startsWith('die')){
                            Online.physMake({ x: 1.2,y: 1.2, z: 1.2 }, 1, { x: px, y: py, z: pz + 0.1 }, Physics.calcQuaterion(lastRot), 3, { name: name, player: PlayerManager.getOwnPlayer(), model: selected });
                        }else
                            Online.physMake({ x: 1.5, y: 1.5, z: 3 }, 2, { x: px, y: py, z: pz + 0.1 }, Physics.calcQuaterion(lastRot), 1, { name: name, player: PlayerManager.getOwnPlayer(), model: selected });
                        
                        //let m = AssetManager.make(selected)
                        //m.position.set(px, py, pz)
                        //Render.addModel(m)
                    }
                }
            }
            break;
        default:
            if(singleTouch || mdown) {
                calcRot();
                heldPhys = Physics.physCarry(pos, lastRot)
                if(heldPhys == 1) {
                    //orbital.dispatchEvent(  { type: 'change' } );
                    orbital.reset();
                    //orbital.state=-1;
                    secondaryTouchPan();
                }
            } else if(heldPhys > -1) {
                Physics.physDrop(pos, calcVelocity());
                cancelCarry()
            }
    }

}

function calcVelocity() {
    let vel = { x: 0, y: 0, z: 0 }
    velArray.forEach(v => {
        vel.x += v.x;
        vel.y += v.y;
        vel.z += v.z;
    })
    //vel.x/=velArray.length;
    //vel.y/=velArray.length;
    //vel.z/=velArray.length;
    return vel;
}

function calcRot() {
    let vel = calcVelocity();
    let arc = Math.sqrt(vel.x * vel.x + vel.y * vel.y)
    if(arc > 0.2)
        lastRot = Math.PI / 2 + Math.atan2(vel.y, vel.x);
}
/*var callback

function onClick(f) {
    callback = f;
}

var radialCallbacks = [];
var radialIndex = -1;

function initRadial(array) {
    let circle = document.createElement('div');
    circle.classList.add('bubbleSelector');
    circle.style.visibility = 'hidden';
    touchOn = false;
    let mainDom = document.querySelector('#main')
    mainDom.appendChild(circle)
    if(array && array.length > 0) {
        array.forEach((e, i) => {
            let bubb = document.createElement('div');
            bubb.classList.add('bubble');
            bubb.style.backgroundColor = i % 2 == 0 ? '#FFED9C' : '#CCFF9C';
            bubb.style.visibility = 'hidden';
            bubb.setAttribute('value', e[0]);
            radialCallbacks.push(e[1]);
            mainDom.appendChild(bubb);
        })


    }
    let overtext = document.createElement('div');
    overtext.classList.add('overtext');
    overtext.style.visibility = 'hidden';
    mainDom.appendChild(overtext);
}*/
var touchOn = false;
/*
function endCircle() {
    if(touchOn) {
        let sb = document.querySelector('.bubbleSelector');
        sb.style.visibility = 'hidden'
        touchOn = false;
    }
}*/

var bubbleMenu;
var tempToggleCamera

function contextmenu(ev) {
    ev.preventDefault();

    /*if(orbital.enabled){
        orbital.enabled=false;
    }else{
        orbital.enabled=true;
    }*/


    return false;
}

function animate() {
    if(vrEnabled) {
        if(controllers && controllers.length) {
            //quest gives 7 arrays, contains pressed bool, touched bool, and value float //DEV
            //controllers[0].source
            if(vrSession) {
                let source = vrSession.inputSources[0]
                for(let i = 0; i < vrSession.inputSources.length; i++) {
                    let buttons = vrSession.inputSources[0].gamepad.buttons
                    if(i == vrSession.inputSources.length - 1) { //pick the last one
                        //mdown=buttons[i].pressed
                        if(buttons[i].pressed) {

                        }
                    } else {
                        mdown = buttons[i].pressed
                    }

                }

            }
        }
    } else {
        if(orbital && !orbital.enabled) {
            let playerModel = World.getOwnPlayer().model
            let xx = orbital.object.position.x - playerModel.position.x
            let yy = orbital.object.position.y - playerModel.position.y
            let rr = Math.sqrt(xx * xx + yy * yy)
            orbital.object.position.x -= yy / rr
            orbital.object.position.y += xx / rr
            orbital.object.lookAt(World.getOwnPlayer().model.position)
        }
    }





    //console.log(controllers[0].source.gamepad.buttons)
    //mdown=

}

function getAngle() {
    return orbital.object.rotation.z;

}
/*
function closeBubbleMenu() {
    if(bubbleMenu) {
        bubbleMenu = undefined;
        let bubbles = document.querySelectorAll('.bubble');
        bubbles.forEach(e => {
            e.style.visibility = 'hidden'
        })
        let ot = document.querySelector('.overtext');
        if(ot)
            ot.style.visibility = 'hidden'

        if(radialIndex >= 0)
            radialCallbacks[radialIndex](px, py, 0);
        lockMenu(false);
    }
}

function openBubbleMenu() {
    let bubbles = document.querySelectorAll('.bubble');
    if(bubbles && bubbles.length) {
        let radial = 2 * Math.PI / bubbles.length;
        bubbleMenu = {
            x: mx,
            y: my
        };
        //bubbles.removeClass('hideBubble');
        bubbles.forEach((e, i) => {

            let xx = mx + Math.sin(radial * i) * 50;
            let yy = my - Math.cos(radial * i) * 50;

            e.style.left = xx + 'px';
            e.style.top = yy + 'px';
            e.style.visibility = 'visible';

        });
        lockMenu(true);
    }
}

function bubbleCheck(x, y) {
    if(bubbleMenu) {
        moveBubbleSelector(x, y)
    } else {
        mx = x;
        my = y;
    }
}

function moveBubbleSelector(x, y) {
    let xx = x;
    let yy = y;
    // let sb=document.querySelector('.bubbleSelector')
    // sb.style.left=xx+'px';
    // sb.style.top=yy+'px';
    let dx = x - bubbleMenu.x;
    let dy = y - bubbleMenu.y;
    let dr = Math.sqrt(dx * dx + dy * dy);
    let R = angle(dx, dy);


    let bubbles = document.querySelectorAll('.bubble')
    let radial = 2 * Math.PI / bubbles.length;
    let tt = R / radial + radial / 2;
    let index = Math.floor(tt);
    if(index >= bubbles.length) index = 0;

    if(dr > 100) {
        index = -1;
    }
    let text = ""
    bubbles.forEach((e, i) => {
        if(i == index) {
            e.style.border = 'solid blue 6px';
            text = e.getAttribute('value');
        } else {
            e.style.border = '';
        }
    });
    let ang = 180 * R / Math.PI
    let ot = document.querySelector('.overtext');
    if(index > -1) {
        ot.style.visibility = 'visible';
        ot.style.left = x + 'px';
        ot.style.top = y + 'px';
        ot.innerHTML = text;
        if(dx > 25) {
            ot.style.transform = 'translate(28px,-50%)';
        } else if(dx < -25) {
            ot.style.transform = 'translate(calc(-28px - 100%),-50%)';
        } else {
            ot.style.transform = 'translate(-50%,calc(-28px - 100%))';
        }
    } else {
        ot.style.visibility = 'hidden';
    }
    radialIndex = index;

    //let text=bubbles.eq(index).attr('value');
    //console.log(text);


}*/


function angle(dx, dy) {
    let theta = Math.atan2(dx, -dy); // range (-PI, PI]
    //theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    if(theta < 0) theta = Math.PI * 2 + theta; // range [0, 360)
    return theta;
}
var tempy = 0;

function keyup(ev) {
    if(isMenuLocked()) {
        return false;
    } else {
        console.log(ev.which)
        switch (ev.which) {
            case 13:
                BarUI.openApp(2);
                break;
            case 27:
                BarUI.closeApp();
                break;
            case 49:
                Environment.changeShadowScale(0);
                break;
            case 50:
                Environment.changeShadowScale(1);
                break;
            case 51:
                Environment.changeShadowScale(2);
                break;
            case 52:
                Environment.changeShadowScale(3);
                break;
            case 53:
                Environment.changeShadowScale(4);
                break;
            case 84:
                //Online.makePhys({ x: 2, y: 2, z: 3 }, 2, { x: px, y: py, z: 30 }, Physics.calcQuaterion(Math.PI / 2), 0, PlayerManager.getOwnPlayer().color, 'rock');
                break; //Physics.makePhys(tempy,{x:2,y:2,z:3},2,{x:px,y:py,z:30},0);tempy++;break;
            case 89:
                //Online.makePhys({ x: 1.5, y: 1.5, z: 3 }, 2, { x: px, y: py, z: 30 }, Physics.calcQuaterion(Math.PI / 2), 1, PlayerManager.getOwnPlayer().color, 'man');
                break; //Physics.makePhys(tempy,{x:2,y:2,z:3},2,{x:px,y:py,z:30},1);tempy++;break; //Physics.makePhys(tempy,{x:.5,y:.5,z:.5},2,{x:0,y:0,z:30},1);
            case 192:
                { //DEV
                    window.pickTarget = Render.pick();
                    if(window.pickTarget)
                        console.log("picked a " + window.pickTarget.type)
                }
                break;

        }
    }

}

function isMenuLocked() {
    return menuLocked;
}

function lockMenu(b) {
    menuLocked = b;

    let doms = document.querySelectorAll('.menuHidable');
    if(doms.length) {
        doms.forEach(d => {
            d.style.visibility = b ? 'hidden' : 'visible';
        })
    }

}

var settingsObject = {};
/*
function initSettings() {
    let mainDom = document.querySelector('#main')

    let settingsButton = document.createElement('div');
    settingsButton.classList.add('settingsButton', 'menuHidable');
    mainDom.appendChild(settingsButton);

    let settingsBlock = document.createElement('div');
    settingsBlock.classList.add('settingsBlock');

    let settings = document.createElement('div');
    settings.classList.add('settingsPane');
    settingsBlock.appendChild(settings);
    mainDom.appendChild(settingsBlock);
    settingsBlock.style.visibility = 'hidden';


    function addButton(text, callback, reference, possibleValues) {
        let row = document.createElement('div')
        let button = document.createElement('div');
        button.classList.add('switch');
        let defaultState;
        if(reference) {
            defaultState = settingsObject[reference];
        }

        if(possibleValues) { //not boolean
            if(defaultState != possibleValues[0]) {
                if(defaultState != possibleValues[possibleValues.length - 1]) {
                    button.classList.add('switchHalf');
                } else {
                    button.classList.add('switchOn');
                }
            }
            button.setAttribute("value", defaultState);
            let index = 0;
            for(let ii = 0; ii < possibleValues.length; ii++) {
                if(possibleValues[ii] == defaultState) {
                    index = ii;
                }
            }
            button.setAttribute("index", index);
            button.addEventListener('click', function(ev) {
                ev.stopPropagation();
                let i = button.getAttribute("index");
                i++;
                if(i >= possibleValues.length) {
                    i = 0;
                }
                if(i == 0) {
                    button.classList.remove('switchOn');
                } else if(i == possibleValues.length - 1) {
                    button.classList.remove('switchHalf');
                    button.classList.add('switchOn');
                } else {
                    button.classList.add('switchHalf');
                }
                let val = possibleValues[i];
                button.setAttribute("value", val);
                button.setAttribute("index", i);
                callback(val);
                updateSettings(reference, val)

   
            });
        } else { //boolean
            if(defaultState)
                button.classList.add('switchOn');

            button.addEventListener('click', function(ev) {
                ev.stopPropagation();
                if(!button.classList.contains('switchOn')) {
                    button.classList.add('switchOn')
                    callback(true);
                    updateSettings(reference, true)
                } else {
                    button.classList.remove('switchOn')
                    callback(false);
                    updateSettings(reference, false)
                }
            })
        }




        row.appendChild(button);

        let label = document.createElement('span');
        label.innerHTML = text;
        row.appendChild(label);
        settings.appendChild(row);
        callback(defaultState)
    }
    let storedSettings = localStorage.getItem("settings");
    if(storedSettings === null) {
        settingsObject = {
            maxResolution: "1",
            maxShadow: true,
            other: true
        }
    } else {
        settingsObject = JSON.parse(storedSettings);
    }

    addButton('max resolution (turn off if it lags)', Render.setResolution, "maxResolution", ["4", "2", "1"]);
    addButton('max shadow resolution (turn off if it lags)', Environment.setShadows, "maxShadow");
    addButton('shadows (turn off if it lags)', function(bool) {}, "other");
    addButton('force update', function(bool) {
        if(bool) window.location.reload(true)
    });
    addButton('Toggle light helper', Environment.setLightHelper, "lightHelper");



    settingsButton.addEventListener('click', function(ev) {
        if(!isMenuLocked()) {
            lockMenu(true);
            settingsBlock.style.visibility = 'visible';
        }
        addConfetti(settingsButton.offsetLeft + 30, settingsButton.offsetTop + 30, 315);

    })

    settingsBlock.addEventListener('click', function(ev) {
        if(ev.target == settingsBlock) {
            settingsBlock.style.visibility = 'hidden';
            lockMenu(false);
        }
    })

}

function updateSettings(reference, val) {
    if(reference) {
        settingsObject[reference] = val;
        localStorage.setItem('settings', JSON.stringify(settingsObject));
    }
}
*/

function isVR() {
    return vrEnabled
}

function getVRPointer() {
    return controllers[controllers.length - 1].controller;
}

function moveLock() {

}

function setState(st) {
    state = st;
    switch (st) {
        case 'makerCard':
            secondaryTouchPan();
            break;
        case 'landscapeCard':
            HexManager.toggleSelector(true)
            secondaryTouchPan();
            break;

        default:
            primaryTouchPan()
    }

    if(st != 'landscapeCard')
        HexManager.toggleSelector(false)
}

function getState() {
    return state;
}

function cancelCarry() {
    heldPhys = -1;
    mdown = false;
    singleTouch = false;
    primaryTouchPan();
    Physics.cancelCarry();

}


export {
    init,
    x,
    y,
    z,
    pos,
    down,
    animate,
    setVector,
    screenX,
    screenY,
    defineOrbital,
    isMenuLocked,
    lockMenu,
    getAngle,
    setRenderer,
    enterVR,
    isVR,
    getVRPointer,
    secondaryTouchPan,
    primaryTouchPan,
    cancelCarry,
    setState,
    getState,
}