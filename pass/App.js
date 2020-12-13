const colors = require('colors');

const crypto = require('crypto');
const sqlite3 = require('sqlite3');
const passport = require('passport');
const passportInit = passport.initialize();
const passportSession = passport.session();
const LocalStrategy = require('passport-local').Strategy
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')();
//const app = require("https-localhost")()
const fs = require("fs");

const http = require('http');
const https = require('https');
const server = http.createServer(app);

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

/*
io.use(sharedsession(sessionObj, {
    autoSave:true
})); */
/*
io.use(function(socket, next){
  socket.client.request.originalUrl = socket.client.request.url;
  cookieParser(socket.client.request, socket.client.request.res, next);
});

io.use(function(socket, next){
  socket.client.request.originalUrl = socket.client.request.url;
  sessionMiddleware(socket.client.request,   socket.client.request.res, next);
});

io.use(function(socket, next){
  passportInit(socket.client.request, socket.client.request.res, next);
});

io.use(function(socket, next){
  passportSession(socket.client.request, socket.client.request.res, next);
}); */


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser);
app.use(passportInit);
app.use(passportSession);

var USERS = [];
var possibleUsers = [];

/*
const options = {
    key: fs.readFileSync("ssl/lh.key"), //"./test/privkey.pem"),
    cert: fs.readFileSync("ssl/lh.pem") //"./test/fullchain.pem")
};*/
/*
const server = http.createServer(app);
const secureServer = https.createServer(app, options);
*/


//const { Sequelize } = require('sequelize');

// Option 1: Passing a connection URI
//const sequelize = new Sequelize('sqlite') // Example for sqlite

//var db = new sqlite3.Database('./database.sqlite3');

// ...

/*
const expressSession = require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
});*/


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
    //const users = 
    User.findAll().then(users => {
        callback(users)
    }).catch(e => {

    })
    //console.log(users.every(user => user instanceof User)); // true
    //console.log("All users:", JSON.stringify(users, null, 2));
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
   

    //const jane = await User.findOne({ where: { id: 1 } });

    // const person = await User.create({
    //     username: 'yiffy',
    //     //birthday: new Date(1980, 6, 20)
    //     salt: 'bacon',
    //     password: hashPassword('cheese','bacon')
    //   });
    //dunky pasta -> ugh
    // var stuff=['dingo','dinky','salt']


    /*
        


        const person = await User.create({
        username: stuff[0],
        //birthday: new Date(1980, 6, 20)
        salt: stuff[2],
        password: hashPassword(stuff[1],stuff[2])
      });
    person.save();
    */

    //await User.sync({force:true});


    //await sequelize.sync();

    /*
    if(jane)
      console.log(jane.toJSON());
    else
      console.log('something went wrong!')*/

    //console.log('hash ' + hashPassword('cheese', 'bacon'))



    const users = await User.findAll();

    //console.log(users.every(user => user instanceof User)); // true
    //console.log("All users:", JSON.stringify(users, null, 2));
    console.log('[[ USER COUNT %i ]]', users.length)
    console.log('=====[[ VVV Start VVV ]]===='.underline.bgMagenta)



})();
/*
getUser(1,user=>{
  console.log("This user:", JSON.stringify(user, null, 2));
})
getUsers(users=>{
  console.log("All users:", JSON.stringify(users, null, 2));
})*/

function hashPassword(password, salt) {
    var hash = crypto.createHash('sha256');
    hash.update(password);
    hash.update(salt);
    return hash.digest('hex');
}

passport.use(new LocalStrategy({ usernameField: "username", passwordField: "password" }, function(username, password, done) {
    console.log('? attempt login for ', username)
    User.findOne({ where: { username: username } }).then(user => {
        //callback(user)
        console.log('DEV:hash check::', username, password, user.salt)
        var hash = hashPassword(password, user.salt);
        if(user.password == hash) {
            return done(null, user); //{id:user.id,username:user.username});

        }
        return done(null, false);
    }).catch(e => {
        return done(null, false);
    })
    /*db.get('SELECT salt FROM users WHERE username = ?', username, function(err, row) {
      if (!row) return done(null, false);
      var hash = hashPassword(password, row.salt);
      db.get('SELECT username, id FROM users WHERE username = ? AND password = ?', username, hash, function(err, row) {
        if (!row) return done(null, false);
        return done(null, row);
      });
    });*/

}));

passport.serializeUser(function(user, done) {
    console.log('serialize...')
    return done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('deserialize...')
    User.findOne({ where: { id: id } }).then(user => {
        return done(null, user); //{id:user.id,username:user.username});
    }).catch(e => {
        return done(null, false);
    })

    //db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
    //if(!row) return done(null, false);
    //return done(null, row);
    //});
});

// ...
/*
app.post('/login', passport.authenticate('local', {
    successRedirect: '/good-login',
    failureRedirect: '/bad-login'
}));*/



app.post('/login', function(req, res, next) {
        passport.authenticate('local', function(error, user, info) {
            // this will execute in any case, even if a passport strategy will find an error
            // log everything to console
            //console.log(error);
            console.log('* session ', req.sessionID)
            if(user) {
                console.log('- login for ', user.username, ':', user.id)
            } else {
                console.log('- bad login'.yellow)
            }
            //console.log(user ? user.username : user);
            //console.log(info);

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

    //{ failureRedirect: '/yuck' }),
    function(req, res) {
        res.status(200).send({ message: 'logged in!' });
    });

app.get('/', (req, res, next) => {

    console.log('session ', req.sessionID);
    next()
})

app.use(express.static(__dirname + '/public'));


///================================================================================///




function ioOnAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');

    // The accept-callback still allows us to decide whether to
    // accept the connection or not.
    accept(null, true);

    // OR

    // If you use socket.io@1.X the callback looks different
    accept();
}

function ioOnAuthorizeFail(data, message, error, accept) {
    if(error)
        throw new Error(message);
    console.log('failed connection to socket.io:', message);

    // We use this callback to log all of our failed connections.
    accept(null, false);

    // OR

    // If you use socket.io@1.X the callback looks different
    // If you don't want to accept the connection
    if(error)
        accept(new Error(message));
    // this error will be sent to the user as a special error-package
    // see: http://socket.io/docs/client-api/#socket > error-object
}

/*
io.use(function(socket, next){
  if (socket.handshake.query && socket.handshake.query.token){
    // jwt.verify(socket.handshake.query.token, 'SECRET_KEY', function(err, decoded) {
    //   if (err) return next(new Error('Authentication error'));
    //   socket.decoded = decoded;
    //   next();
    // });

  }
  // else {
  //   next(new Error('Authentication error'));
  // }    
})*/



//Have to put our io stuff in a delay for some reason? TODO find out why
//setTimeout(function(){
io.on('connection', function(socket) {
    //console.log(socket.request.session)
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
    })
})

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

/*
io.use(passportSocketIo.authorize({
    //key: 'connect.sid',
    secret: 'your secret', //process.env.SECRET_KEY_BASE,
    store: sessionStore,
    //passport: passport, //,
    // cookieParser: cookieParser
    success: ioOnAuthorizeSuccess, // *optional* callback on success
    fail: ioOnAuthorizeFail, // *optional* callback on fail/error
}));*/

//},500)




///================================================================================///

server.listen(8080, function() {
    console.log('runnin')
})
/*
secureServer.listen(443, function() {
    console.log('1. listening on *:8080, version ' + 1);
});*/