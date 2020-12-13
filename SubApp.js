 module.exports = function Game(app,express,server){



const colors = require('colors');

const crypto = require('crypto');
const sqlite3 = require('sqlite3');
const passport = require('passport');
const passportInit = passport.initialize();
const passportSession = passport.session();
const LocalStrategy = require('passport-local').Strategy
const cookieParser = require('cookie-parser')();
//const app = require("https-localhost")()
const fs = require("fs");

//var passportSocketIo = require('passport.socketio');
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
var sessionStore = new SQLiteStore;

var passedArgs = process.argv.slice(2);
console.log(passedArgs)

var sessionObj = session({
    //key: 'express.sid',
    store: sessionStore,
    secret: 'your secret',
    //resave: true,
    // httpOnly: true,
    //secure: true,
    //ephemeral: true,
    saveUninitialized: true,
    //cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
});

app.use(sessionObj);
var io = require("socket.io")(server);

//var sharedsession = require("express-socket.io-session");

io.use(function(socket, next) {
    sessionObj(socket.request, {}, next); //socket.request.res || {}
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser);
app.use(passportInit);
app.use(passportSession);

var USERS = [];
var possibleUsers = [];



const { Sequelize, Model, DataTypes } = require('sequelize');
//const sequelize = new Sequelize('sqlite');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    storage: './database.sqlite',
    dialect: 'sqlite',
    /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
    logging: false,
});

class User extends Model {}
User.init({
    username: DataTypes.STRING,
    salt: DataTypes.STRING,
    password: DataTypes.STRING,
    //birthday: DataTypes.DATE
    color: DataTypes.STRING,
    sessionID: DataTypes.STRING,
    online:false,
}, { sequelize, modelName: 'user' });


function makeUser(name, color, pin, callback) {
    if(name && color && pin != undefined) {
        User.create({
            username: name,
            color: color,
            pin: pin
        }).then(() => {
            callback();
        }).catch(() => {
            console.log('Something went wrong with creating user')
        });
    } else {
        console.log('Missing data to create user')
    }
}

function getUser(id, callback) {
    User.findOne({ where: { id: id } }).then(user => {
        callback(user)
    }).catch(e => {

    });
}

function getUsers(callback) {
    User.findAll().then(users => {
        callback(users)
    }).catch(e => {

    })
}


function pullUser(sessionID,callback) {
    User.findOne({ where: { sessionID: sessionID } }).then(user=>{
      callback(user);
    })
}


(async () => {
    if(passedArgs[0]=='purge'){
       await sequelize.sync({force:true});
       let contents=[
       ['test0','1234','salt','#B234C5'],
       ['test1','1234','salt','#B234C5'],
       ['test2','1234','salt','#B234C5'],
       ['test3','1234','salt','#B234C5'],
       ['test4','1234','salt','#B234C5'],
       ['test5','1234','salt','#B234C5'],
       ['Jake','8888','salt','#B234C5'],
       ['VA','9999','salt','#B234C5'],
       ['Meg','4343','salt','#B234C5'],
       ['Claire','7272','salt','#B234C5'],
       ['Emo','1111','salt','#B234C5'],
       ['Jon','4200','salt','#B234C5'],
       ['Helen','0005','salt','#B234C5'],
       ['Greg','9000','salt','#3442C5'],
       ['Nick','8008','salt','#7EBB1D'],
       ['Heather','6969','salt','#FF00D8'],
       ]

       contents.forEach(stuff=>{
          let person = User.create({
          username: stuff[0],
          //birthday: new Date(1980, 6, 20)
          salt: stuff[2],
          color:stuff[3],
          password: hashPassword(stuff[1],stuff[2])
          });
       })
       await sequelize.sync();
       

    }else{
       await sequelize.sync();
    }
   

    const users = await User.findAll();

    console.log('[[ USER COUNT %i ]]', users.length)
    console.log('=====[[ VVV Start VVV ]]===='.underline.bgMagenta)



})();

function hashPassword(password, salt) {
    var hash = crypto.createHash('sha256');
    hash.update(password);
    hash.update(salt);
    return hash.digest('hex');
}

passport.use(new LocalStrategy({ usernameField: "username", passwordField: "password" }, function(username, password, done) {
    console.log('? attempt login for ', username)
    User.findOne({ where: { username: username } }).then(user => {
        console.log('DEV:hash check::', username, password, user.salt)
        var hash = hashPassword(password, user.salt);
        if(user.password == hash) {
            return done(null, user); 
        }
        return done(null, false);
    }).catch(e => {
        return done(null, false);
    })
}));




const CANNON = require('./cannon.min')

app.use(express.static(__dirname + '/public'));
app.get('/*', function(req, res, next){ 
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  res.setHeader('Cache-Control','no-cache');//max-age=14400');
  res.header('Content-Security-Policy', "img-src 'self'");
  next(); 
});

app.post('/login', function(req, res, next) {
        passport.authenticate('local', function(error, user, info) {

            console.log('* session ', req.sessionID)
            if(user) {
                console.log('- login for ', user.username, ':', user.id)
            } else {
                console.log('- bad login'.yellow)
            }

            if(error) {
                res.status(401).send({ message: error });
            } else if(!user) {
                res.status(401).send({ message: info });
            } else {
                user.sessionID = req.sessionID;
                user.online = true;
                USERS[req.sessionID] = user;
                user.save();
                next();
            }
        })(req, res);
    },


    function(req, res) {
        res.status(200).send({ message: 'logged in!' });
    });



































const dandSpace = io.of('/dand-dev'); 

dandSpace.use((socket, next) => {
  // ensure the user has sufficient rights
  next();
});
/*
adminNamespace.on('connection', socket => {
  socket.on('delete user', () => {
    // ...
  });
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


dandSpace.on('connection', function(socket){
  console.log('socket session id ', socket.request.session.id)
    evaluateUser(socket.request.session, username => {
        if(!username) {
            socket.disconnect('reauth');
            console.log('- kicked null user'.yellow)
        } else {
          //socket nodes

            console.log('-socket connected to user:', username);
            socket.on('disconnect', function() {
                if(socket.request.session.id) {
                    let user = USERS[socket.request.session.id];
                    user.online = false;
                    user.save();
                }
                console.log('lost connection to user')
            });
            socket.on('message', function(m) {
              let user=getUsername(socket.request.session);
                io.emit('message', user, m)
                User.findOne({which:{username:user}}).then(o=>{
                  console.log('messaged with id ',o);
                })
            })



        }
    
  

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
    dandSpace.emit('make',obj) //io.sockets
  });

  socket.on('chat', function(id,message){
    dandSpace.emit('chat',id,message);
  });

  socket.on('reboot',function(crypt){
    if(crypt=='dingo'){
      console.log('!!! DESTROY THE MAP!!!');
      users=[];
      objects=[];
      dandSpace.emit('reboot')
    }
  });


  //PHYS

  socket.on('physReset', function(){
    //io.sockets.emit('chat',id,message);
    //boxBody.position.set(0,0,100)
    //boxBody.velocity.set(0,0,0)
    physArray.forEach(o=>{
        o.position.set(0,0,100)
        o.velocity.set(0,0,0)
    })
  });

  socket.on('physMake', function(size,mass,pos){
    let id=addPhys(size,mass,pos);
    dandSpace.emit('physMake',id,size,mass,pos)
    console.log('made obj')
  });
  socket.on('physInit', function(){
    console.log('send phys init data')
    socket.emit('physInit',physInits)
  });
})
 
});
function getUsername(session) {
    if(session) {
        let user = USERS[session.id];
        if(user) {
            return user.username
        }
    }
}

function evaluateUser(session, callback) {
    let username = getUsername(session)
    if(!username) {
        pullUser(session.id, result => {
            if(result) {
                USERS[session.id]=result;
                callback(result.username)
            } else {
                callback(undefined)
            }
        })
    } else {
        callback(username)
    }

}


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

var physTick=0;

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


  physData.push([id,body.position,body.quaternion, body.velocity,body.angularVelocity])
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


  /*let boxShape = new CANNON.Box(new CANNON.Vec3(1,1,2));
           
  boxBody = new CANNON.Body({ mass: 2 });
  boxBody.addShape(boxShape);
  boxBody.position.set(0,0,60);
  world.addBody(boxBody);*/
  setInterval(function(){
    updatePhysics()
    
    if(physTick>=10){
      dandSpace.emit('physUpdate',physData);
      physTick=0;
    }
    physTick++;
  },10)

  

  
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