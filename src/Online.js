
//import io from "socket.io-client"
import * as io from 'socket.io-client';
import * as Main from "./Main.js";
import * as Physics from "./Physics.js";
import * as UI from "./UI.js";
import * as Login from "./Login.js";
import * as Chat from "./Chat.js";


var socket;

var physReady=false;

function initSocket() {
	window.m=m;
	console.error('trying auth...');
	socket= io('/dand-dev').connect('', {
	    reconnection: true,
	    reconnectionAttempts: 10
	});

	socket.on('connect', function(){
		Login.hide();
		console.log('connected')
		socket.emit('physInit')
	});

  socket.on('event', function(data){});
  socket.on('disconnect', function(data){
  	console.log('disconnected ',data)
  	if(data.includes('disconnect')){
  		Login.show();
  		socket.io.opts.reconnection=false;
  	}else{
  		socket.connect('',{
	    	reconnection: true,
	    	reconnectionAttempts: 10
		});
  	}
  });

  socket.on('message', function(username,m){
  	Chat.hook(username,m)
  	console.log(username,': ',m);
  });



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
}
function makePhys(size,mass,pos){
	socket.emit('physMake',size,mass,pos);
}
function resetPhys(){
	socket.emit('physReset');
}



/*
function init(){
	document.querySelector('#test').disabled=true;
	document.querySelector('#test').addEventListener('click',sendMessage)
	document.querySelector('#button').addEventListener('click',onclick)
}init()*/


function login(username,pass){
	/*let username=document.querySelector('#username').value
	let pass=document.querySelector('#password').value*/
	fetch('/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({username:username,password:pass})
  }).then(function(response) {
  	if(!response.ok){
  		
  		UI.systemMessage(response.status+":"+response.statusText,'warn')
  		
  		return undefined;
  	}else
    	return response.json();
  }).then(function(data) {
  	if(data){
  		UI.systemMessage(JSON.stringify(data),'success')
    	initSocket();
	}
  }).catch(e=>{
  	console.error('ERROR'+e);
  });
}


function message(string){
	socket.emit('message',string);
}

function m(st){
	if(!st)
		st='test'
	socket.emit('message',st);
}

export {login,makePhys,resetPhys,message}

