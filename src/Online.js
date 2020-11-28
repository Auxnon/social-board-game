
//import io from "socket.io-client"
import * as io from 'socket.io-client';
import * as Main from "./Main.js";
import * as Physics from "./Physics.js";

var socket;

var physReady=false;

function init() {
	socket = io('/dand-dev');
	//socket.emit('init','hi')

	socket.on('physUpdate', function(data){
		//Physics.setPlayer()
		if(physReady){
			Physics.syncOnline(data)
			console.log('phys synced')
		}else
			console.log('!!!phys IGNORED')
		
	})
	socket.on('physInit', function(data){
		Physics.clearPhys();
		data.forEach(item=>{
			Physics.makePhys(item[0],item[1],item[2],{x:0,y:0,z:0})
		})
		physReady=true;
	})


	socket.on('physMake', function(id,size,mass,pos){
		Physics.makePhys(id,size,mass,pos)
		console.log('made')
	})

socket.on('connect',()=>{
    console.log('created a connection');
    //alert('Hello friend, server has reconnected, refreshing your instance!')
   // window.location.reload(false);
   socket.emit('physInit')
   });

	console.log('online code ran')
}
function makePhys(size,mass,pos){
	socket.emit('physMake',size,mass,pos);
}
function resetPhys(){
	socket.emit('physReset');
}

export {init,makePhys,resetPhys}