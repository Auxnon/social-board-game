module.exports = function Game(app, express, server, io, sessionObj) {

    const colors = require('colors');

    const crypto = require('crypto');
    const sqlite3 = require('sqlite3');
    const passport = require('passport');
    const passportInit = passport.initialize();
    const passportSession = passport.session();
    const LocalStrategy = require('passport-local').Strategy

    //const app = require("https-localhost")()
    const fs = require("fs");

    var passedArgs = process.argv.slice(2);
    console.log(passedArgs)

    //var io = require('socket.io')(server)
    //var passportSocketIo = require('passport.socketio');


    //var sharedsession = require("express-socket.io-session");





    app.use(passportInit);
    app.use(passportSession);

    var USERS = [];
    var possibleUsers = []; //TODO get rid of this lol
    var lastChats = [];
   
    var sheets={};
    var equipments={}; //i hate this name but just differentiating it from equipment
    var land



    const { Sequelize, Model, DataTypes } = require('sequelize');
    //const sequelize = new Sequelize('sqlite');
    const sequelize = new Sequelize('database', 'username', 'password', {
        host: 'localhost',
        storage: './database.sqlite',
        dialect: 'sqlite',
        // one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' 
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
        online: false,
        sheet: DataTypes.JSON,
        equipment:DataTypes.JSON,
    }, { sequelize, modelName: 'user' });

    class Land extends Model {}
    Land.init({
        data: DataTypes.STRING,
        meta: DataTypes.STRING,
    }, { sequelize, modelName: 'land' });


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


    function pullUser(sessionID, callback) {
        User.findOne({ where: { sessionID: sessionID } }).then(user => {
            callback(user);
        })
    }




    (async () => {
        if(passedArgs[0] == 'purge') {
            console.log('P U R G I N G  DB'.red)
            await sequelize.sync({ force: true });
            let contents = [
                ['Bingo', '1234', 'salt', '#8F239F'],
                ['Boingo', '1234', 'salt', '#C25BD2'],
                ['Bongo', '1234', 'salt', '#7B068D'],
                ['Bungo', '1234', 'salt', '#8248A3'],
                ['Bango', '1234', 'salt', '#B804AD'],
                ['Bilbo', '1234', 'salt', '#7C03D0'],
                ['Jake', '8008', 'salt', '#FFFC34'],
                ['VA', '9999', 'salt', '#FF7700'],
                ['Meg', '4343', 'salt', '#25BDFC'],
                ['Claire', '7272', 'salt', '#D10054'],
                ['Emo', '1111', 'salt', '#940818'],
                ['Jon', '4200', 'salt', '#B234C5'],
                ['Jack', '1954', 'salt', '#863D0C'],
                ['Helen', '0005', 'salt', '#002C57'],
                ['Greg', '9000', 'salt', '#FF0000'],
                ['Nick', '8008', 'salt', '#7EBB1D'],
                ['Heather', '6969', 'salt', '#FF00D8'],
                ['Twilt', '4200', 'salt', '#FF00D8'],
                ['Dylan', '4200', 'salt', '#00FF8A'],
            ]

            contents.forEach(stuff => {
                let person = User.create({
                    username: stuff[0],
                    //birthday: new Date(1980, 6, 20)
                    salt: stuff[2],
                    color: stuff[3],
                    password: hashPassword(stuff[1], stuff[2])
                });
            })

            let land = Land.create({
                        data: '',
                        meta:'',
            });

            await sequelize.sync();


        } else {
            await sequelize.sync();
        }


        const users = await User.findAll();
        users.forEach(user => {
            possibleUsers.push({ id: user.id, username: user.username, color: user.color });
            sheets[user.id]=user.sheet
            equipments[user.id]=user.equipment
        })

        Land.findOne().then(l=>{
            land=l;
        })

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
    //app.use('dev.makeavoy.com', express.static(__dirname + '/public'))

    app.get('/*', function(req, res, next) {
        res.setHeader('Last-Modified', (new Date()).toUTCString());
        res.setHeader('Cache-Control', 'no-cache'); //max-age=14400');
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
                res.status(200).send({ id: user.id, message: 'logged in!' });
                //next();
            }
        })(req, res);
        //},
    });

    //function(req, res) {
    //    res.status(200).send({ message: 'logged in!' });
    //});

    app.post('/getUsers', function(req, res, next) {
        console.log('* sending users ', possibleUsers.length)
        res.send({ users: possibleUsers });
    })
    app.post('/lastChats', function(req, res, next) {
        res.send({ array: lastChats });
    })
    app.post('/grid', function(req, res, next) {
        res.send({ grid: land?land.data:undefined });
    })
    app.post('/getSheets', function(req, res, next) {
        console.log('* sending sheets ')
        res.send({ array: sheets });
    })
    app.post('/getEquipment', function(req, res, next) {
        if(req.body.id)
        res.send({ array: equipments[req.body.id] });
    })








    const dandSpace = io.of('/dand-dev'); ///'/dand-dev');

    dandSpace.use(function(socket, next) {
        console.log('* passed session through io socket')
        sessionObj(socket.request, {}, next); //socket.request.res || {}
    });


    // dandSpace.use((socket, next) => {
    //     // ensure the user has sufficient rights
    //     next();
    // });


    // adminNamespace.on('connection', socket => {
    //   socket.on('delete user', () => {

    //   });
    // });


    var users = [];
    var sockets = [];
    var objects = [{ x: 60, y: 0, z: 60, type: 'tree', layer: 0, owner: 0 }];
    var count = -1;
    var objCount = 0; //below the current count for lazy indexing reasons

    const version = [0, 16, 10];
    console.log('_game version ' + version[0] + '.' + version[1] + '.' + version[2]);
    //createObject({x:20,y:20,z:0,type:'tree',layer:0,owner:0});


    var world;
    var boxBody;


    dandSpace.on('connection', function(socket) {
        console.log('* connecting...');
        if(!socket.request.session) {
            console.log("! socket session doesn't exist!".red);
            return;
        }

        console.log('socket session id ', socket.request.session.id)
        evaluateUser(socket.request.session, username => {

            if(!username) {
                socket.disconnect('reauth');
                console.log('- kicked null user'.yellow)
            } else {
                //socket nodes

                console.log('-socket connected to user:', username);
                let user = USERS[socket.request.session.id];

                socket.broadcast.emit('join', user ? user.username : 'Unknown');

                socket.on('disconnect', function() {
                    if(socket.request.session.id) {
                        let user = USERS[socket.request.session.id];
                        user.online = false;
                        user.save();
                    }
                    console.log('lost connection to user')
                });
                socket.on('message', function(m) {
                    let userId = getUserId(socket.request.session);
                    lastChats.push([userId, m]);
                    if(lastChats.length > 10)
                        lastChats.shift()
                    dandSpace.emit('message', userId, m)
                    /*User.findOne({ which: { username: user } }).then(o => {
                        console.log('messaged with id ', o ? o.username : undefined, " message: ", m);
                    })*/
                });
                socket.on('terrain', function(id, chunk, data) {
                    land.data = data;
                    socket.broadcast.emit('terrain', id, chunk, data);
                    console.log('- terrain sync length ', data.length)
                })
                socket.on('physSend', function(obj, floating) {
                    let target = physArray[obj.id]
                    if(target) {
                        target.position.copy(obj.position)
                        target.quaternion.copy(obj.quaternion)

                        if(floating) {
                            target.sleep();
                        } else {
                            target.velocity.copy(obj.velocity)
                            target.angularVelocity.copy(obj.angularVelocity)
                            target.wakeUp();
                        }
                        socket.broadcast.emit('physSend', obj, floating);
                    }
                })
                socket.on('updateSheet', function(id, obj) {
                    sheets[id]=obj;
                    console.log('updating sheet ',JSON.stringify(obj))
                    socket.broadcast.emit('updateSheet', id, obj);
                    getUser(id,user=>{
                        user.sheet=obj
                        user.save();
                    })
                })
                socket.on('sendEquipment', function(id, obj) {
                    equipments[id]=obj
                    getUser(id,user=>{
                        user.equipment=obj;
                        user.save();
                    })
                })

                //body.position, body.quaternion, body.velocity, body.angularVelocity,body.dynamics






                socket.on('init', function(major, minor, partial, data) {
                    if(data) {
                        //let versionMatch=(major>=version[0]) && (minor>=version[1]) && (partial>=version[2])
                        //createUser(socket,data,versionMatch);
                        socket.broadcast.emit('move', move);
                    }
                });
                /*
                socket.on('disconnect', function() {
                    let id = sockets.indexOf(socket);
                    if(id >= 0) {
                        let player = users[id];
                        console.log('user ' + player.name + ' disconnected');
                        socket.broadcast.emit('disconnected', id);
                        users[id].dead = true;
                        sockets[id] = null;
                    }
                });*/

                socket.on('move', function(move) {
                    console.log('move ready, player ' + move.id);
                    if(move.path) {
                        //console.log('path final x: ' + move.path[move.path.length-1].x);
                        if(move.id) {
                            users[move.id].path = move.path;
                            socket.broadcast.emit('move', move);
                        }
                    }
                });

                socket.on('enter', function(id, door) {
                    socket.broadcast.emit('enter', id, door);
                });
                socket.on('make', function(obj) {
                    obj.id = createObject(obj);
                    dandSpace.emit('make', obj) //io.sockets
                });

                socket.on('chat', function(id, message) {
                    dandSpace.emit('chat', id, message);
                });

                socket.on('reboot', function(crypt) {
                    if(crypt == 'dingo') {
                        console.log('!!! DESTROY THE MAP!!!');
                        users = [];
                        objects = [];
                        dandSpace.emit('reboot')
                    }
                });


                //PHYS

                socket.on('physReset', function() {
                    //io.sockets.emit('chat',id,message);
                    //boxBody.position.set(0,0,100)
                    //boxBody.velocity.set(0,0,0)
                    physArray.forEach(o => {
                        o.position.set(0, 0, 100)
                        o.velocity.set(0, 0, 0)
                    })
                });

                socket.on('physMake', function(size, mass, pos, quat, type, meta) {
                    let id = physMake(size, mass, pos, quat, type, meta);
                    dandSpace.emit('physMake', id, size, mass, pos, quat, type, meta)
                    console.log('made obj')
                });
                socket.on('physDel', function(id) {
                    physDel(id);
                    dandSpace.emit('physDel', id)
                    console.log('delete obj')
                });
                socket.on('physInit', function() {
                    console.log('send phys init data')
                    socket.emit('physInit', physInits, physData)
                });
                socket.on('forceSave', function() {
                    save();
                })
                socket.on('sysMessage', function(m) {
                    dandSpace.emit('sysMessage', m)
                })

            }
        })

    });

    function save(){
        if(land){
            land.save();
            dandSpace.emit('sysMessage', 'server land saved','success')
        }
    }
    setInterval(function(){
        save()
    },600000) //10 minutes


    function getUserId(session) {
        if(session) {
            let user = USERS[session.id];
            if(user) {
                return user.id
            }
        }
    }

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
                    USERS[session.id] = result;
                    callback(result.username)
                } else {
                    callback(undefined)
                }
            })
        } else {
            callback(username)
        }

    }

    //older method
    function createUser(channel, player, versionMatch) {
        count++;
        player.model = undefined;
        player.path = undefined;
        player.id = count;
        player.layer = 0;
        /*let obj={
    path:undefined,
    id:count,
    color:data.color,
    layer:0
    };*/
        channel.emit('init', versionMatch, count, users, objects);
        channel.broadcast.emit('join', player);
        users[count] = player;
        sockets[count] = channel;
        console.log('created user ' + player.name + ' and emitted to them');
        return count;
    }

    function createObject(obj) {
        objCount++;
        objects[objCount] = obj
        return objCount;
    }

    
    var physCounter = 0; //determines ids

    var physArray = {} //hold actual objects
    var physData = [] //quick access data array full of POINTERS i.e. json 
    var physInits = [] //basic initializers to send on first connection

    var physTick = 0;

    var sleeping
    var physStep = 1 / 30;
    var defaultMat;

    var watched={};

    function physMake(size, mass, pos, quat, type, meta) {
        let body = new CANNON.Body({ mass: mass,material:defaultMat });
        let shape;
        switch(type){
            case 1: shape = new CANNON.Cylinder(size.x, size.y, size.z, 6); break;
            case 3: shape = new CANNON.Sphere(size.x);body.angularDamping=0.3; break;
            default: shape = new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z));
        }

        body.addShape(shape);
        body.position.set(pos.x, pos.y, pos.z);
        if(quat)
            body.quaternion.copy(quat)

        let id = physCounter;


        body.dynamics = { value:-1,sleep: 0 }
        if(meta.label=='dice'){
            body.watch=true;
            watched[id]=(body)
        }
        body.id = id;
        physArray[id] = body;
        world.addBody(body);
        physCounter++;

        physData.push([id, body.position, body.quaternion, body.velocity, body.angularVelocity, body.dynamics])
        physInits.push([id, size, mass, type, meta])
        return id;
    }
    function physDel(id){
        if(physArray[id] && physArray[id].watch)
          delete watched[id]

        delete physArray[id];
        for(let i=0;i<physInits.length;i++){
            if(physInits[i][0]==id){
                physData.splice(i,1)
                physInits.splice(i,1)
                return;
            }
            
        }
    }

    function initCannon() {
        world = new CANNON.World();
        world.quatNormalizeSkip = 0;
        world.quatNormalizeFast = false;
        world.allowSleep = true;

        world.gravity.set(0, 0, -10);
        world.broadphase = new CANNON.NaiveBroadphase();

        defaultMat = new CANNON.Material("basicMaterial");

        const contactMaterial = new CANNON.ContactMaterial(defaultMat, defaultMat, {
            friction: 0.2
        });

        world.addContactMaterial(contactMaterial);

        let groundShape = new CANNON.Plane();
        let groundBody = new CANNON.Body({ mass: 0, material:defaultMat });
        groundBody.addShape(groundShape);
        world.addBody(groundBody);


        /*let boxShape = new CANNON.Box(new CANNON.Vec3(1,1,2));
                 
        boxBody = new CANNON.Body({ mass: 2 });
        boxBody.addShape(boxShape);
        boxBody.position.set(0,0,60);
        world.addBody(boxBody);*/
        setInterval(function() {
            updatePhysics()
            if(!sleeping) {
                if(physTick >= 360) {
                    let array=Object.values(watched)
                    array.forEach(p=>{
                      if(p.sleepState==0)
                        p.dynamics.value=Math.random();
                    })
                    dandSpace.emit('physUpdate', physData);
                    physTick = 0;
                }
                physTick++;
            }

        }, 10)

    }



    function updatePhysics() {
        let array = Object.values(physArray);
        let awakeCount = 0;
        array.forEach(obj => {
            obj.dynamics.sleep = obj.sleepState
            if(obj.sleepState == 0) { //active

                awakeCount++;
                /*if(obj.watch){
                    obj.dynamics.value=M
                }*/
            }
        })
        //console.log('sleep ',awakeCount)


        sleeping = awakeCount <= 0
        /*bodies[0].position.set(point.x,point.y,point.z)
        bodies[0].velocity.set(0,0,0)
        bodies[0].angularDamping=1
        bodies[0].inertia.set(0,0,0)*/

        world.step(physStep);
    }
    initCannon();


}