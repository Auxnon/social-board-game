import * as Render from "./Render.js";
import * as THREE from "./lib/three.module.js";

var hex=[]
var landBits=[]
var grid=[];

function init(){

Render.loadModel('./assets/models/Hex.glb',m=>{
	console.log('got children '+m.children.length)
	let basicMat = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, metalness: 0, roughness: 1.0}); // 

	for(let i=0;i<m.children.length;i++){
		//m.children[i]
		let mm=m.children[i]
		//m.children[i].scale.set(200,200,200)
		//mm.rotation.x=Math.PI/2
		mm.position.set(0,0,60)
		mm.scale.set(20,20,20)
    //mm.material= new THREE.MeshBasicMaterial( {color: 0x20E89F, side: THREE.FrontSide} );

		mm.material=basicMat
		//Render.addModel(mm)
		hex[mm.name]=mm;


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
	modelClear()
	for(let i=0;i<grid.length;i++){
		for(let j=0;j<grid.length;j++){
			let n=grid[i][j];
			if(n>1){ //hex coordinate system follows, hang tight it's a bumpy ride!
				let l=grid[i-1][j]>1  // pure hex x left right
				let r=grid[i+1][j]>1


				//land('P1',i,j,1)
			
				//upper hex edges, left and right
				let tl=grid[i-1][j+1]>1
				let tr=grid[i][j+1]>1 
				//land('T1',i,j,1)

				//lower hex edges, left and right, notice the farther then normal postive check due to our skewed hex design
				let bl=(j>0 && grid[i+1][j-1]>1)
				let br=(j>0 && i<4 && grid[i+2][j-1]>1)  

				//let total=l?1:0 + r?1:0 + tl?1:0 + tr?1:0 + bl?1:0 + br?1:0;
				let start=-1;
				let index=0;
				let circle=[tl,tr,r,br,bl,l]
				let branches=[];
				circle.forEach((b,i)=>{
					
					if(b){
						branches.push(i)
						if(start==-1)
							start=i;

						index=i;
					}

				})

				let letter='P'
				let type=''
				if(branches.length>0){
					distances=[];
					
					var last=branches[0]
					for(let i=1;i<branches.length;i++){
						distances.push((branches[i]-last)-1)
						last=branches[i]
					}

					let r=start==-1?0:start;
					
					switch(branches.length){
						case 3:letter='T'; //3 paths

						if(distances[0]==0){
							if(distances[1]==0){
								type=1;r+=5;
							}else if(distances[1]==3){
								type=1;r+=2;
							}else if(distances[1]==1){
								type=3;r+=4;
							}else if(distances[1]==2){
								type=2;r+=3;
							}
						}else if(distances[0]==1){
							if(distances[1]==0){
								type=2;//r+=0;
							}else if(distances[1]==1){
								type=4;//r+=0;
							}else if(distances[1]==2){
								type=3;r+=4;
							}
						}else if(distances[0]==2){
							if(distances[1]==0){
								type=3;r+=1;
							}else if(distances[1]==1){
								type=2;r+=3;
							}
						}else{
							type=1;r+=3;
						}
						r=r%6;
	
						break;

						case 4:letter='Q'; //4 path

						if(distances[0]==0){
							if(distances[1]==0){
								if(distances[2]==0){
									type=1;//r+=0
								}else if(distances[2]==2){
									type=3;r+=2;
								}else if(distances[2]==3){
									type=1; r+=1;
								}
							}else if(distances[1]==0){

						}



						break;
						case 5:letter='F';break;
						case 6:letter='H';break;
						default: 
							let f=index-start;
							if(f>2)
								f=(3-(f-3))
							type+=f;
					}
					land(letter+type,i,j,r)
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
				land('O1',i,j)
			}
		}

	}
}

function land(st,x,y,r) {
	let radius=1;
	let skew=20*radius*Math.sqrt(3)/2;

	//dummy.position.set(offsetx+i*9,0,offsetz+j*skew*2 +i*skew);
	let m=hex["Grass_"+st].clone();
	m.position.set(-120+x*skew*2 +y*skew,-120+y*30,40)
	if(r)
	m.rotation.z=r*Math.PI/3
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
	modelClear()
	for(let i=0;i<6;i++){
		grid[i]=[];
		for(let j=0;j<6;j++){
			grid[i][j]=1
		}
	}
}


export {init}