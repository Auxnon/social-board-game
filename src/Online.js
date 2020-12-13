
//import io from "socket.io-client"
import * as io from 'socket.io-client';
import * as Main from "./Main.js";
import * as Physics from "./Physics.js";
import * as UI from "./UI.js";

var socket;

var physReady=false;

function initSocket() {

	console.error('trying auth...');
	socket= io('/dand-dev').connect('', {
	    reconnection: true,
	    reconnectionAttempts: 10
	});

	socket.on('connect', function(){
		console.log('connected')
		socket.emit('physInit')
	});

  socket.on('event', function(data){});
  socket.on('disconnect', function(data){
  	console.log('disconnected ',data)
  	if(data.includes('disconnect')){
  		requestLogin();
  		socket.io.opts.reconnection=false;
  	}else{
  		socket.connect('',{
	    	reconnection: true,
	    	reconnectionAttempts: 10
		});
  	}
  });

  socket.on('message', function(username,m){
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


function sendMessage(){
	socket.emit('message','test')
}

function requestLogin(){
	console.log('Must relogin')
}


export {login,makePhys,resetPhys}

