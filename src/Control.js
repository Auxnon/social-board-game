//import * as Chat from "./Chat.js";
import * as Render from "./Render.js";
import * as HexManager from "./HexManager.js";
//import * as AssetManager from "./AssetManager.js";
import * as Environment from "./Environment.js";
//import * as World from "./World.js";
import {OrbitControls} from "./lib/OrbitControls.js";
import * as THREE from "./lib/three.module.js";


var vrEnabled;

function init(){
	//window.addEventListener('click',animationControl)
	let target=document.querySelector('.canvasHolder');
	target.addEventListener('mousemove',mousemove);
	target.addEventListener('mousedown',mousedown);
	target.addEventListener('mouseup',mouseup);

	target.addEventListener('touchstart',touchstart);
	target.addEventListener('touchend',touchend);
	target.addEventListener('touchmove',touchmove);

	window.addEventListener('contextmenu',contextmenu);
	window.addEventListener('keyup',keyup);
	//initSettings();
}
var zoomLevelToggle=false

function setRenderer(renderer,renderDom,camera,VR){
	defineOrbital(renderDom,camera)
	if(VR){
		defineVRControl(renderer)
	}
}
function defineOrbital(renderDom,camera){
	orbital = new OrbitControls( camera, renderDom );


    orbital.mouseButtons = {
        LEFT: undefined,
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.PAN //THREE.MOUSE.DOLLY
    }

    orbital.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_ROTATE
    }
    orbital.maxPolarAngle=1.3;
    orbital.isControl()


	orbital.addEventListener('change',function(ev){
		var zoom = orbital.target.distanceTo(orbital.object.position);

		if(zoom>75){
			if(zoomLevelToggle!=2){
				zoomLevelToggle=2;
				Environment.changeShadowScale(1);
			}
		}else{
			if(zoomLevelToggle!=1){
				zoomLevelToggle=1;
				Environment.changeShadowScale(0);
			}
		}
		Environment.setShadowPos(orbital.target)
		//console.log('changed camera '+orbital.object.position.y)
	})

}

function defineVRControl(renderer){
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
var buttonBobs=[] //DEV
var vrSession
function enterVR(){
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
var controllers
var orbital;
var mdown=false;
var mx=0;
var my=0;
var px=0,py=0,pz=0;
var menuLocked=false;

function mousemove(ev){

	bubbleCheck(ev.clientX,ev.clientY)
}
function mousedown(ev){
	if(ev.which !== 1 ){ //2 mid and 3 right
		return false;
	}
	mdown=true;
	
	return true;
}
function mouseup(ev){
	if(ev.which === 2 ){
		return false;
	}
	if(mdown){
		if(!bubbleMenu ){//&& !orbital.isControl()){
			if(callback)
				callback();
		}
	}
	mdown=false;
	closeBubbleMenu();
}
function touchstart(ev){
	mdown=true;
	mx=ev.touches[0].clientX;
	my=ev.touches[0].clientY;
	startCircle(mx,my);
	return true;
}
function touchend(ev){
	if(mdown){
		if(!bubbleMenu && !orbital.isControl()){
			if(callback)
				callback();
		}
	}
	mdown=false;
	endCircle();
	closeBubbleMenu();
}
function touchmove(ev){
	let xx=ev.touches[0].clientX;
	let yy=ev.touches[0].clientY;
	startCircle(xx,yy);
	bubbleCheck(xx,yy);
}

function getCursor(){
	return {on:mdown,x:mx,y:my}
}
function screenX(){
	return mx;
}
function screenY(){
	return my;
}
function x(){
	return px;
}
function y(){
	return py;
}
function z(){
	return pz;
}
function pos(){
	return {x:px,y:py,z:pz};
}
function down(){
	return mdown && !orbital.isControl();
}

function setVector(pos){
	px=pos.x;
	py=pos.y;
	pz=pos.z;
	if(mdown)
		HexManager.hexPick(px,py)
	else
		HexManager.hexCheck(px,py)
}
var callback
function onClick(f){
	callback=f;
}

var radialCallbacks=[];
var radialIndex=-1;
function initRadial(array){
	let circle=document.createElement('div');
	circle.classList.add('bubbleSelector');
	circle.style.visibility='hidden';
	touchOn=false;
	let mainDom=document.querySelector('#main')
	mainDom.appendChild(circle)
	if(array && array.length>0){
		array.forEach((e,i)=>{
			let bubb=document.createElement('div');
			bubb.classList.add('bubble');
			bubb.style.backgroundColor=i%2==0?'#FFED9C':'#CCFF9C';
			bubb.style.visibility='hidden';
			bubb.setAttribute('value',e[0]);
			radialCallbacks.push(e[1]);
			mainDom.appendChild(bubb);
		})
			
		
	}
	let overtext=document.createElement('div');
	overtext.classList.add('overtext');
	overtext.style.visibility='hidden';
	mainDom.appendChild(overtext);
}
var touchOn=false;
function startCircle(xx,yy){
	/*let sb=document.querySelector('.bubbleSelector');
	if(!touchOn){
		sb.style.visibility='visible';
		touchOn=true;
	}
	sb.style.left=xx+'px';
	sb.style.top=yy+'px';*/
}
function endCircle(){
	if(touchOn){
		let sb=document.querySelector('.bubbleSelector');
		sb.style.visibility='hidden'
		touchOn=false;
	}
}

var bubbleMenu;
var tempToggleCamera
function contextmenu(ev){
	ev.preventDefault();

	/*if(orbital.enabled){
		orbital.enabled=false;
	}else{
		orbital.enabled=true;
	}*/


	return false;
}

function animate(){
	if(vrEnabled){
		if(controllers && controllers.length){
		//quest gives 7 arrays, contains pressed bool, touched bool, and value float //DEV
		//controllers[0].source
			if(vrSession){
				let source=vrSession.inputSources[0]
				for(let i=0;i<vrSession.inputSources.length;i++){
					let buttons=vrSession.inputSources[0].gamepad.buttons
					if(i==vrSession.inputSources.length-1){ //pick the last one
							//mdown=buttons[i].pressed
							if(buttons[i].pressed){

							}
					}else{
						mdown=buttons[i].pressed
					}

				}
				
			}
		}
	}else{
		if(orbital && !orbital.enabled){
			let playerModel=World.getOwnPlayer().model
			let xx=orbital.object.position.x-playerModel.position.x
			let yy=orbital.object.position.y-playerModel.position.y
			let rr=Math.sqrt(xx*xx +yy*yy)
			orbital.object.position.x-=yy/rr
			orbital.object.position.y+=xx/rr
			orbital.object.lookAt(World.getOwnPlayer().model.position)
		}
	}
	
		

		
		
		//console.log(controllers[0].source.gamepad.buttons)
			//mdown=
	
}
function getAngle(){
	return orbital.object.rotation.z;
	
}

function closeBubbleMenu(){
	if(bubbleMenu){
		bubbleMenu=undefined;
		let bubbles=document.querySelectorAll('.bubble');
		bubbles.forEach(e=>{
			e.style.visibility='hidden'
		})
		let ot=document.querySelector('.overtext');
		if(ot)
			ot.style.visibility='hidden'

		if(radialIndex>=0)
			radialCallbacks[radialIndex](px,py,0);
		lockMenu(false);
	}
}
function openBubbleMenu(){
	let bubbles=document.querySelectorAll('.bubble');
	if(bubbles && bubbles.length){
		let radial=2*Math.PI/bubbles.length;
		bubbleMenu={x:mx,y:my};
		//bubbles.removeClass('hideBubble');
		bubbles.forEach((e,i)=>{

			let xx=mx+Math.sin(radial*i)*50;
			let yy=my-Math.cos(radial*i)*50;
			
			e.style.left=xx+'px';
			e.style.top=yy+'px';
			e.style.visibility='visible';
			
		});
		lockMenu(true);
	}
}
function bubbleCheck(x,y){
	if(bubbleMenu){
		moveBubbleSelector(x,y)
	}else{
		mx=x;my=y;
	}
}
function moveBubbleSelector(x,y){
	let xx=x;
	let yy=y;
	// let sb=document.querySelector('.bubbleSelector')
	// sb.style.left=xx+'px';
	// sb.style.top=yy+'px';
	let dx=x-bubbleMenu.x;
	let dy=y-bubbleMenu.y;
	let dr=Math.sqrt(dx*dx + dy*dy);
	let R=angle(dx,dy);
	

	let bubbles=document.querySelectorAll('.bubble')
	let radial=2*Math.PI/bubbles.length;
	let tt=R/radial +radial/2;
	let index=Math.floor(tt);
	if(index>=bubbles.length)index=0;

	if(dr>100){
		index=-1;
	}
	let text=""
	bubbles.forEach((e,i)=>{
		if(i==index){
			e.style.border='solid blue 6px';
			text=e.getAttribute('value');
		}else{
			e.style.border='';
		}
	});
	let ang=180*R/Math.PI
	let ot=document.querySelector('.overtext');
	if(index>-1){
		ot.style.visibility='visible';
		ot.style.left=x+'px';
		ot.style.top=y+'px';
		ot.innerHTML=text;
		if(dx>25){
			ot.style.transform='translate(28px,-50%)';
		}else if(dx<-25){
			ot.style.transform='translate(calc(-28px - 100%),-50%)';
		}else{
			ot.style.transform='translate(-50%,calc(-28px - 100%))';
		}
	}else{
		ot.style.visibility='hidden';
	}
	radialIndex=index;

	//let text=bubbles.eq(index).attr('value');
	//console.log(text);
	/*if(text){
		$('.selectBubble').children().html(text);
	}*/
	
}

function menu1(){
	let bm=document.querySelector('.buttonMenu');
	if(bm.style.visibility=='hidden'){
		bm.style.visibility='visible'
		lockMenu(true);
	}else{
		bm.style.visibility='hidden'
		lockMenu(false);
	}
}
function angle(dx,dy) {
  let theta = Math.atan2(dx, -dy); // range (-PI, PI]
  //theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  if (theta < 0) theta = Math.PI*2 + theta; // range [0, 360)
  return theta;
}

function keyup(ev){
	if(isMenuLocked()){
		return false;
	}else{
		 if(ev.which==13){
			//Chat.openChat();
		}else if(ev.which==192){ //DEV
			window.pickTarget=Render.pick();
			if(window.pickTarget)
				console.log("picked a "+window.pickTarget.type)

		}
	}

}
function isMenuLocked(){
	return menuLocked;
}
function lockMenu(b){
	menuLocked=b;
	
		let doms=document.querySelectorAll('.menuHidable');
		if(doms.length){
			doms.forEach(d=>{
				d.style.visibility=b?'hidden':'visible';
			})
		}
	
}

var settingsObject={};
function initSettings(){
	let mainDom=document.querySelector('#main')

	let settingsButton=document.createElement('div');
	settingsButton.classList.add('settingsButton','menuHidable');
	mainDom.appendChild(settingsButton);

	let settingsBlock=document.createElement('div');
	settingsBlock.classList.add('settingsBlock');

	let settings=document.createElement('div');
	settings.classList.add('settingsPane');
	settingsBlock.appendChild(settings);
	mainDom.appendChild(settingsBlock);
	settingsBlock.style.visibility='hidden';


	function addButton(text,callback,reference,possibleValues){
		let row=document.createElement('div')
		let button=document.createElement('div');
		button.classList.add('switch');
		let defaultState;
		if(reference){
			defaultState=settingsObject[reference];
		}

		if(possibleValues){ //not boolean
			if(defaultState!=possibleValues[0]){
				if(defaultState!=possibleValues[possibleValues.length-1]){
					button.classList.add('switchHalf');
				}else{
					button.classList.add('switchOn');
				}
			}
			button.setAttribute("value",defaultState);
			let index=0;
			for(let ii=0;ii<possibleValues.length;ii++){
				if(possibleValues[ii]==defaultState){
					index=ii;
				}
			}
			button.setAttribute("index",index);
			button.addEventListener('click',function(ev){
				ev.stopPropagation();
				let i=button.getAttribute("index");
				i++;
				if(i>=possibleValues.length){
					i=0;
				}
				if(i==0){
					button.classList.remove('switchOn');
				}else if(i==possibleValues.length-1){
					button.classList.remove('switchHalf');
					button.classList.add('switchOn');
				}else{
					button.classList.add('switchHalf');
				}
				let val=possibleValues[i];
				button.setAttribute("value",val);
				button.setAttribute("index",i);
				callback(val);
				updateSettings(reference,val)

				/*
				if(!button.classList.contains('switchOn')){
					button.classList.add('switchOn')
					callback(true);
					updateSettings(reference,true)
				}else{
					button.classList.remove('switchOn')
					callback(false);
					updateSettings(reference,false)
				}*/
			});
		}else{ //boolean
			if(defaultState)
				button.classList.add('switchOn');

			button.addEventListener('click',function(ev){
				ev.stopPropagation();
				if(!button.classList.contains('switchOn')){
					button.classList.add('switchOn')
					callback(true);
					updateSettings(reference,true)
				}else{
					button.classList.remove('switchOn')
					callback(false);
					updateSettings(reference,false)
				}
			})
		}
		


		
		row.appendChild(button);

		let label=document.createElement('span');
		label.innerHTML=text;
		row.appendChild(label);
		settings.appendChild(row);
		callback(defaultState)
	}
	let storedSettings=localStorage.getItem("settings");
	if (storedSettings === null) {
  		settingsObject={
  			maxResolution:"1",
  			maxShadow:true,
  			other:true
  		}
	}else{
		settingsObject=JSON.parse(storedSettings);
	}

	addButton('max resolution (turn off if it lags)',Render.setResolution,"maxResolution",["4","2","1"]);
	addButton('max shadow resolution (turn off if it lags)',Environment.setShadows,"maxShadow");
	addButton('shadows (turn off if it lags)',function(bool){},"other");
	addButton('force update',function(bool){if(bool)window.location.reload(true)});
	addButton('Toggle light helper',Environment.setLightHelper,"lightHelper");


	
	settingsButton.addEventListener('click',function(ev){
		if(!isMenuLocked()){
			lockMenu(true);
			settingsBlock.style.visibility='visible';
		}
		addConfetti(settingsButton.offsetLeft+30,settingsButton.offsetTop+30,315);

	})

	settingsBlock.addEventListener('click',function(ev){
		if(ev.target==settingsBlock){
			settingsBlock.style.visibility='hidden';
			lockMenu(false);
		}
	})

}
function updateSettings(reference,val){
	if(reference){
		settingsObject[reference]=val;
		localStorage.setItem('settings',JSON.stringify(settingsObject));
	}
}

function addConfetti(x,y,angle){
	let mainDom=document.querySelector('#main')

	let con=document.createElement('div');
	con.classList.add('confetti');
	con.innerHTML='<svg viewbox="0 0 100 100" style="fill:none;stroke:lightgreen;stroke-linecap:round"><path d="M45 70L55 75M45 50L55 50M45 30L55 25" /></svg>';
	con.style.left=x+'px'
	con.style.top=y+'px',
	con.style.transform='translate(-50%,-50%) rotate('+(angle?angle:0)+'deg)';
	setTimeout(function(){
		con.remove();
	},500);
	mainDom.appendChild(con)
}

function isVR(){
	return vrEnabled
}
function getVRPointer(){
	return controllers[controllers.length-1].controller;
}

function moveLock(){

}


export {init,x,y,z,pos,down,animate,onClick,setVector,screenX,screenY,initRadial,menu1,defineOrbital,isMenuLocked,lockMenu,getAngle,
	addConfetti,setRenderer,enterVR,isVR,getVRPointer}