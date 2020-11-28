 module.exports = function Game(app,express,server){
  app.use(express.static(__dirname + '/public'));
  
 
const io = require('socket.io')(server); //{serveClient: false}
const CANNON = require('./cannon.min')


app.use(express.static(__dirname + '/public'));
app.get('/*', function(req, res, next){ 
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  res.setHeader('Cache-Control','no-cache');//max-age=14400');
  res.header('Content-Security-Policy', "img-src 'self'");
  next(); 
});
/*
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});*/
var users=[];
var sockets=[];
var objects=[{x:60,y:0,z:60,type:'tree',layer:0,owner:0}];
var count=-1; 
var objCount=0; //below the current count for lazy indexing reasons

const version=[0,16,10];
console.log('_game version '+version[0]+'.'+version[1]+'.'+version[2]);
//createObject({x:20,y:20,z:0,type:'tree',layer:0,owner:0});


var world;
var boxBody;



io.on('connection', function(socket){
  console.log('user connection made');
  

  socket.on('init',function(major,minor,partial,data){
    if(data){
      //let versionMatch=(major>=version[0]) && (minor>=version[1]) && (partial>=version[2])
    	//createUser(socket,data,versionMatch);
      socket.broadcast.emit('move',move);
    }
  });
  socket.on('disconnect', function(){
    let id=sockets.indexOf(socket);
    if(id>=0){
      let player=users[id];
      console.log('user '+player.name+' disconnected');
      socket.broadcast.emit('disconnected',id);
      users[id].dead=true;
      sockets[id]=null;
    }
  });

  socket.on('move', function(move){
    console.log('move ready, player '+move.id);
    if(move.path){
      //console.log('path final x: ' + move.path[move.path.length-1].x);
      if(move.id){
        users[move.id].path=move.path;
        socket.broadcast.emit('move',move);
      }
    }
  });

  socket.on('enter', function(id,door){
    socket.broadcast.emit('enter',id,door);
  });
  socket.on('make',function(obj){
    obj.id=createObject(obj);
    io.sockets.emit('make',obj)
  });

  socket.on('chat', function(id,message){
    io.sockets.emit('chat',id,message);
  });

  socket.on('reboot',function(crypt){
    if(crypt=='dingo'){
      console.log('!!! DESTROY THE MAP!!!');
      users=[];
      objects=[];
      io.sockets.emit('reboot')
    }
  });


  //PHYS

  socket.on('physReset', function(){
    //io.sockets.emit('chat',id,message);
    boxBody.position.set(0,0,100)
    boxBody.velocity.set(0,0,0)
    physArray.forEach(o=>{
        o.position.set(0,0,100)
        o.velocity.set(0,0,0)
    })
  });

  socket.on('physMake', function(size,mass,pos){
    let id=addPhys(size,mass,pos);
    io.sockets.emit('physMake',id,size,mass,pos)
    console.log('made obj')
  });
  socket.on('physInit', function(){
    console.log('send phys init data')
    socket.emit('physInit',physInits)
  });



  
});

function createUser(channel,player,versionMatch){
	count++;
  player.model=undefined;
  player.path=undefined;
  player.id=count;
  player.layer=0;
	/*let obj={
		path:undefined,
		id:count,
		color:data.color,
    layer:0
		};*/
	channel.emit('init',versionMatch,count,users,objects);
	channel.broadcast.emit('join',player);
	users[count]=player;
  sockets[count]=channel;
		console.log('created user '+player.name+' and emitted to them');
	return count;
}

function createObject(obj){
  objCount++;
  objects[objCount]=obj
	return objCount;
}

var physIDs=[];
var physArray=[]
var physCounter=0;

var posArray=[];
var physData=[]
var physInits=[]

function addPhys(size,mass,pos){
  let body = new CANNON.Body({ mass: mass });
  let boxShape = new CANNON.Box(new CANNON.Vec3(size.x,size.y,size.z));

  body.addShape(boxShape);
  body.position.set(pos.x,pos.y,pos.z);
  let id=physCounter;
  body.id=id;
  physIDs.push(id)
  physArray[id]=body;
  world.addBody(body);
  physCounter++;


  physData.push([id,body.position,body.quaternion, body.velocity])
  physInits.push([id,size,mass])
  return id;
}
function initCannon(){
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  world.gravity.set(0,0,-10);
  world.broadphase = new CANNON.NaiveBroadphase();

  let groundShape = new CANNON.Plane();
  let groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  world.addBody(groundBody);


  let boxShape = new CANNON.Box(new CANNON.Vec3(1,1,2));
           
  boxBody = new CANNON.Body({ mass: 2 });
  boxBody.addShape(boxShape);
  boxBody.position.set(0,0,60);
  world.addBody(boxBody);
  setInterval(function(){
    updatePhysics()
    io.sockets.emit('physUpdate',physData);
  },10)

  setInterval(function(){
    //io.sockets.emit('physUpdate',boxBody.position,boxBody.quaternion, boxBody.velocity);
    //console.log('out')
  },100)

  
}



function updatePhysics(){
            /*bodies[0].position.set(point.x,point.y,point.z)
            bodies[0].velocity.set(0,0,0)
            bodies[0].angularDamping=1
            bodies[0].inertia.set(0,0,0)*/

  world.step(1/30);
}
initCannon();


}