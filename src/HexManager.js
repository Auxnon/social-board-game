import * as Render from "./Render.js";
import * as Helper from "./Helper.js";
import * as THREE from "./lib/three.module.js";

//grass #6CA90B
//grass2 #A1C73A
//grass3 #53963F
//path #BEB55D
//mountain #907B67


var hex=[]
var landBits=[]
var grid=[];
const SCALE=80
const HALF_GRID=12*SCALE/2

var hexType=2;

function init(){

Render.loadModel('./assets/models/Hex.glb',m=>{
	console.log('got children '+m.children.length)
	let basicMat = new THREE.MeshStandardMaterial({ vertexColors: THREE.VertexColors, metalness: 0, roughness: 1.0}); // 
	//basicMat.shading = THREE.SmoothShading;
	for(let i=0;i<m.children.length;i++){
		//m.children[i]
		let mm=m.children[i]
		//mm.geometry.computeVertexNormals(true);
		//m.children[i].scale.set(200,200,200)
		//mm.rotation.x=Math.PI/2
		mm.position.set(0,0,60)
		mm.scale.set(SCALE,SCALE,SCALE)
    //mm.material= new THREE.MeshBasicMaterial( {color: 0x20E89F, side: THREE.FrontSide} );

		mm.material=basicMat
		mm.receiveShadow =true;
		if(mm.name.startsWith("Mount"))
			mm.castShadow =true;
		//Render.addModel(mm)
		hex[mm.name]=mm;

		let colors=[];
		let count=mm.geometry.attributes.color.array.length/4
		for(let i=0;i<count;i++){
			let n=i*4;
			let vr=mm.geometry.attributes.color.array[0+n];
			let vg=mm.geometry.attributes.color.array[1+n];
			let vb=mm.geometry.attributes.color.array[2+n];
			//let va=mm.geometry.attributes.color.array[3+n];
			let val=Helper.rgbFloatToHex(vr,vg,vb)
			colors[val]=val
		}
	/*	#6CA90B: "#2d6404"
#3f6607: "#3f6607"
#776d12: "#776d12"
#396506: "#396506"


#776d12: "#2d6404"*/
		console.log(colors)
		
		//console.log(vr,vg,vb,va)
		//let val=Helper.rgbFloatToHex(mm.geometry.attributes.color.array[0],mm.geometry.attributes.color.array[1],mm.geometry.attributes.color.array[2])
		//console.log(val)

	}
	clearLand()

		window.hex=hex;
		window.place=place
		window.land=land
		window.clearLand=clearLand
	 	

	
	//window.m=m;//.children[0]
})

}

function place(x,y,t){
	grid[x][y]=t
	processLand();
}

function processLand(){
	SEED=6;
	modelClear()
	for(let i=0;i<grid.length;i++){
		for(let j=0;j<grid.length;j++){
			let n=grid[i][j];
			let rando=Math.floor(randomSeed(1,4))
			let turner=Math.floor(randomSeed(1,6))
			if(n>1){ //hex coordinate system follows, hang tight it's a bumpy ride!
				//if(i==2 && j==2)
					//debugger
				let l,r,tl,tr;
				if(i>0)
				l=grid[i-1][j]==n  // pure hex x left right
				if(i<grid.length-1)
				r=grid[i+1][j]==n 


				//land('P1',i,j,1)
			
				//upper hex edges, left and right

				if(j<grid.length-1){

					if(i>0)
					tl=grid[i-1][j+1]==n 
					tr=grid[i][j+1]==n  
				}
				//land('T1',i,j,1)

				//lower hex edges, left and right, notice the farther then normal postive check due to our skewed hex design
				let bl=(j>0 && grid[i][j-1]==n)
				let br=(j>0 && i<grid.length-1 && grid[i+1][j-1]==n)

				let st=(tl?'1':'0') + (l?'1':'0') + (bl?'1':'0') + (br?'1':'0') + (r?'1':'0') + (tr?'1':'0');
				

				//let total=l?1:0 + r?1:0 + tl?1:0 + tr?1:0 + bl?1:0 + br?1:0;
				let start=-1;
				let index=0;
				let circle=[tl,tr,r,br,bl,l]
				let branches=[];
				let hole=5;
				circle.forEach((b,i)=>{
					if(b){
						branches.push(i)
						if(start==-1)
							start=i;

						index=i;
					}else
						hole=i
				})
				console.log('grid %i %i %s branches %i',i,j,st,branches.length)

				let letter='N'
				let type=''
				if(branches.length>0){
					let distances=[];
					
					var last=branches[0]
					for(let i=1;i<branches.length;i++){
						distances.push((branches[i]-last)-1)
						last=branches[i]
					}
					console.log(distances)

					let r=start==-1?0:start;
					
					switch(branches.length){
						case 1:  letter='E'
						r+=0;
						break;

						case 2:  letter='P'; 
						if(distances[0]==0){
							type='3';r+=0;
						}else if(distances[0]==1){
							type='2';r+=0;
						}else if(distances[0]==2){
							type='1';r+=0;
						}else if(distances[0]==3){
							type='2';r+=4;
						}else{
							type='3';r+=5;
						}
						break;

						case 3:letter='T'; //3 paths
						if(distances[0]==0){
							if(distances[1]==0){
								type=1;r+=0;
							}else if(distances[1]==3){
								type=1;r+=5;
							}else if(distances[1]==1){
								type=3;r+=3;
							}else if(distances[1]==2){
								type=2;r+=4;
							}
						}else if(distances[0]==1){
							if(distances[1]==0){
								type=2;//r+=0;
							}else if(distances[1]==1){
								type=4;//r+=0;
							}else if(distances[1]==2){
								type=3;r+=2;
							}
						}else if(distances[0]==2){
							if(distances[1]==0){
								type=3;r+=0;
							}else if(distances[1]==1){
								type=2;r+=3;
							}
						}else{
							type=1;r+=4;
						}
						r=r%6;
						break;

						case 4:letter='Q'; //4 path
						if(distances[0]==0){
							if(distances[1]==0){
								if(distances[2]==0){
									type=1;r+=0
								}else if(distances[2]==1){
									type=3;r+=2;
								}else if(distances[2]==2){
									type=1; r+=5;
								}
							}else if(distances[1]==1){
								if(distances[2]==0){
									type=2;r+=4;
								}else if(distances[2]==1){
									type=3;r+=1
								}
							}else {//}( 2==2)
								type=1;r+=4;
							}
						}else if(distances[0]==1){
							if(distances[1]==0){
								if(distances[2]==0){
									type=3; r+=4;

								}else{
									type=2;
								}
							}else{ //1 1 0
								type=3
							}
						}else{
							type=1;r+=3;
						}
						r=r%6;
						break;

						case 5:letter='F';
						r=hole+1;						
						break;

						case 6:letter='H';break;

					}
					land(n,letter+type,i,j,r)
				}else{
					land(n,'N',i,j,0)
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

			}else if(n==1){
				//SEED=i*j
				land(n,'O'+rando,i,j,Math.floor(turner))//,Math.floor(Math.random()*6))
			}
		}

	}
}

function land(n,st,x,y,r) {
	//n==1 grass, n==2 path, n==3 mount
	let radius=1;
	let skew=SCALE*radius*Math.sqrt(3)/2;
	let prefix="Grass_"
	if(n==3){
		prefix="Mount_"
	}

	//dummy.position.set(offsetx+i*9,0,offsetz+j*skew*2 +i*skew);
	let m=hex[prefix+st].clone();
	m.position.set((-HALF_GRID)+x*skew*2 +y*skew,y*SCALE*1.5,-SCALE*.2)
	if(r){ //sp always not 0
		r=6-r;
		m.rotation.z=r*Math.PI/3
	}
	
	landBits.push(m)
	Render.addModel(m)
}

function modelClear(){
	landBits.forEach(m=>{
		Render.removeModel(m)
	})
	landBits=[];
}
function clearLand(){
	let size=12
	modelClear()
	for(let i=0;i<size;i++){
		grid[i]=[];
		for(let j=0;j<size;j++){
			grid[i][j]=1
		}
	}
}

function hexCheck(x,y){
	let radius=1;
	let skew=SCALE*radius*Math.sqrt(3)/2;
	//m.position.set(-120+x*skew*2 +y*skew,-120+y*30,40)
	let y2=Math.floor((SCALE+y)/(SCALE*1.5));
	let x2=Math.floor(((x+HALF_GRID+SCALE)-y2*skew)/(skew*2))
	Render.setHexSelector(-HALF_GRID+x2*skew*2 +y2*skew,y2*SCALE*1.5,8)
	
	return [x2,y2]

	
}
function hexPick(x,y){
	let [x2,y2] = hexCheck(x,y)
	//console.log('click',x,y,x2,y2)
	if(x2>-1 && y2>-1){
		let v=grid[x2][y2];
		
		if(v==hexType)	
			v=1
		else
			v=hexType

		place(x2,y2,v)
	}
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


function toggleType(){
	if(hexType==2)
		hexType=3
	else if(hexType==3)
		hexType=0
	else
		hexType=2
}


export {init,hexCheck,hexPick,toggleType}