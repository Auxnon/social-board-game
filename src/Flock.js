import * as Render from "./Render.js";

function init(){
	for(let i=0;i<60;i++)
		bird(0,0,2)
}

let birbs=[];
function bird(x,y,z){
	let birb=Render.cubicColored(1,1,1,x,y,z,0xff00ff);



	birb.hook={x,y,z,r:Math.random()*TAU,size:Math.random()*4 +1,wider:Math.random()*4,h:Math.random()*TAU}
	birbs.push(birb);
	Render.addModel(birb)
}


function think(){
	birbs.forEach(b=>{
		let inn=((4-b.hook.wider) +2)*b.hook.size
		let outt=(b.hook.wider +2)*b.hook.size
		let sn=Math.sin(b.hook.r*10)
		let cs=Math.cos(b.hook.r*10)
		b.position.y=inn*cs +outt*sn +b.hook.y
		b.position.x=inn*cs - outt*sn +b.hook.x
		b.position.z=b.hook.h


		b.hook.r+=0.002
		b.hook.wider+=0.005
		b.hook.h+=0.0001

		if(b.hook.r>TAU)
			b.hook.r=0
		if(b.hook.h>TAU)
			b.hook.h=0


		if(b.hook.wider>4)
			b.hook.wider=0;

	})
}

export {init,think}


