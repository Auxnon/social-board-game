 //import io from "socket.io-client"
 import * as io from './lib/socket.io.js';
 import * as Main from "./Main.js";
 import * as Physics from "./Physics.js";
 import * as UI from "./UI.js";
 import * as Login from "./Login.js";
 import * as Chat from "./Chat.js";
 import * as PlayerManager from "./PlayerManager.js";
 import * as HexManager from "./HexManager.js";
 import * as Control from "./Control.js";
 import * as Character from "./Character.js";
 import * as BarUI from "./BarUI.js";


 var socket;

 var physReady = false;
 var pendingLogin;

 function initSocket() {
    try{
     window.sysMessage=sysMessage;
     window.forceSave=forceSave;

     BarUI.show();

     console.log('trying auth...');
     pendingLogin = UI.systemMessage('attempting communications...', 'net', true)
     socket = io('/dand-dev')
     /*.connect('', { //,{transports: ['websocket'],secure: true}
         reconnection: true,
         reconnectionAttempts: 10
     });*/
     //socket = io(':443/dand-dev')

     /*&'makeavoy.com',{
         transports: ['websocket','xhr-polling']
     });*/
     //.connect('/dand-dev',{ secure: true, transports: [ "flashsocket","polling","websocket" ] });
     //https://makeavoy.com/dand-dev
     //'/dand-dev',{transports: ['websocket']}
     //socket = io('/dand-dev',{transports: ['websocket'],secure: true});


     socket.on('connect', function() {
         Login.hide();
         console.log('connected')
         socket.emit('physInit')
         if(pendingLogin)
         	pendingLogin.remove();
         pendingLogin = undefined;
     });

     socket.on('event', function(data) {});
     socket.on('disconnect', function(data) {
         console.log('disconnected ', data)
         if(data.includes('disconnect')) {
             Login.show();
             //socket.io.opts.reconnection = false;
         } else {
             pendingLogin = UI.systemMessage('lost connection, attempting reconnection...', 'net', true)
             /*socket.connect('', {
                 reconnection: true,
                 reconnectionAttempts: 10
             });*/
         }
     });

     socket.on('message', function(userId, m) {
         Chat.hook(userId, m)
     });
     socket.on('join', function(username) {
         Chat.makeDivider(username + ' has joined!')
     });

     socket.on('terrain', function(id, chunk, data) {
         //Chat.makeDivider(username+' has joined!')
         HexManager.updateTerrain(chunk, data)
     });



     //socket.emit('init','hi')

     socket.on('physSend', function(obj, floating) {
         Physics.remoteAdjustPhys(obj, floating)
     });
     socket.on('physUpdate', function(data) {
         //Physics.setPlayer()
         if(physReady) {
             Physics.syncOnline(data)
             console.log('phys synced')
         } else
             console.log('!!!phys IGNORED')
     })
     socket.on('physInit', function(inits, data) {
         Physics.physClear();
         inits.forEach((item, i) => {
             Physics.physMake(item[0], item[1], item[2], { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0, w: 0 }, item[3], item[4])
         })
         Physics.syncOnline(data)
         physReady = true;
     })


     socket.on('physMake', function(id, size, mass, pos, quat, type, meta) {
         Physics.physMake(id, size, mass, pos, quat, type, meta)
         console.log('made')
     })
     socket.on('physDel', function(id) {
         Physics.physDel(id)
         console.log('deleted')
     })
     socket.on('updateSheet', function(id, obj) {
         Character.updateSheet(id, obj)
         console.log('deleted')
     })
     socket.on('sysMessage', function(m,type) {
         console.log('sysMessage ',m,type)
         UI.systemMessage(m,type)
     })

     lastChats();
     getGrid();
     getSheets();
     Control.init();
 }catch(err){
    UI.systemMessage("Stage2 Auth: "+err,'error');
    console.log('test')
 }
 }


 /*
 function init(){
     document.querySelector('#test').disabled=true;
     document.querySelector('#test').addEventListener('click',sendMessage)
     document.querySelector('#button').addEventListener('click',onclick)
 }init()*/


 function login(username, pass) {
     /*let username=document.querySelector('#username').value
     let pass=document.querySelector('#password').value*/
     fetch('/login', {
         method: 'post',
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify({ username: username, password: pass })
     }).then(function(response) {
         if(!response.ok) {

             UI.systemMessage(response.status + ":" + response.statusText, 'warn')

             return undefined;
         } else
             return response.json();
     }).then(function(data) {
         if(data) {
             //UI.systemMessage(data.message, 'success')
             PlayerManager.setOwnPlayer(data.id)
             initSocket();
         }
     }).catch(e => {
         UI.systemMessage(e, 'error')
         console.error('ERROR ', e);
     });
 }

 function lastChats() {
     fetch('/lastChats', {
         method: 'post',
         headers: {
             'Content-Type': 'application/json'
         },
         //body: JSON.stringify({ username: username, password: pass })
     }).then(function(response) {
         if(!response.ok) {
             return undefined;
         } else
             return response.json();
     }).then(function(data) {
         if(data) {
             Chat.lastChats(data.array)
         }
     }).catch(e => {
         UI.systemMessage(e, 'error')
         console.error('ERROR ', e);
     });
 }

 function getGrid() {
     fetch('/grid', {
         method: 'post',
         headers: {
             'Content-Type': 'application/json'
         },
         //body: JSON.stringify({ username: username, password: pass })
     }).then(function(response) {
         if(!response.ok) {
             return undefined;
         } else
             return response.json();
     }).then(function(data) {
         if(data) {
             if(data.grid.length > 0)
                 HexManager.updateTerrain(0, data.grid)
         }
     }).catch(e => {
         UI.systemMessage(e, 'error')
         console.error('ERROR ', e);
     });
 }


 function getSheets() {
     fetch('/getSheets', {
         method: 'post',
         headers: {
             'Content-Type': 'application/json'
         },
         //body: JSON.stringify({ username: username, password: pass })
     }).then(function(response) {
         if(!response.ok) {
             return undefined;
         } else
             return response.json();
     }).then(function(data) {
         if(data) {
             Character.applyUsers(data.array)
         }
     }).catch(e => {
         UI.systemMessage(e, 'error')
         console.error('ERROR ', e);
     });
 }


 function physMake(size, mass, pos, quat, type, meta) {
     socket.emit('physMake', size, mass, pos, quat, type, meta);
 }

 function physReset() {
     socket.emit('physReset');
 }

 function message(string) {
     socket.emit('message', string);
 }

 function m(st) {
     if(!st)
         st = 'test'
     socket.emit('message', st);
 }

 function terrain(chunk, data) {
     socket.emit('terrain', PlayerManager.getOwnPlayer().id, chunk, data);
 }

 function physSend(obj, floating) {
     //physData.push([id, body.position, body.quaternion, body.velocity, body.angularVelocity])

     socket.emit('physSend', { id: obj.id, position: obj.position, velocity: obj.velocity, quaternion: obj.quaternion, angularVelocity: obj.angularVelocity }, floating);
 }

 function physDel(id) {
     socket.emit('physDel', id);
 }

 function updateSheet(id, obj) {
     socket.emit('updateSheet', id, obj);
 }

 function sysMessage(m,type){
    socket.emit('sysMessage', m,type);
 }

function forceSave(){
    socket.emit('forceSave');
}
 export { login, physMake, physReset, message, terrain, physSend, physDel, updateSheet }