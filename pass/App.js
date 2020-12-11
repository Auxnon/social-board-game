const crypto = require('crypto');
const sqlite3 = require('sqlite3');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const express = require('express');
const app = express();
//const app = require("https-localhost")()
const fs = require("fs");

const http = require('http');
const https = require('https');




//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
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


const { Sequelize, Model, DataTypes } = require('sequelize');
//const sequelize = new Sequelize('sqlite');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    storage: './database.sqlite',
    dialect: 'sqlite' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
});

class User extends Model {}
User.init({
    username: DataTypes.STRING,
    salt: DataTypes.STRING,
    password: DataTypes.STRING,
    //birthday: DataTypes.DATE
    color: DataTypes.STRING,
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


(async () => {
    await sequelize.sync();

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
        var stuff=['humm','yuck','salt']


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

    console.log('hash '+hashPassword('cheese','bacon'))


    
    const users = await User.findAll();

    //console.log(users.every(user => user instanceof User)); // true
    //console.log("All users:", JSON.stringify(users, null, 2));
    console.log('[[ USER COUNT %i ]]',users.length)




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

passport.use(new LocalStrategy({usernameField: "username",passwordField:"password"},function(username, password, done) {
  console.log('check for ',username,password)
    User.findOne({ where: { username: username } }).then(user => {
        //callback(user)
        console.log('inner dump ',username,password,user.salt)
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
/*
app.use(express.json());
app.use(express.urlencoded({ extended: true}));*/

const bodyParser = require("body-parser");
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json()); 

const expressSession = require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
});



app.use(passport.initialize());
app.use(passport.session());
app.use(expressSession);



app.post('/doo', function(req,res){
  console.log('caught ',req.body)
  res.send({m:'hi',body:req.body})
})

app.post('/login', function(req,res,next){
  console.log('caught ',req.body)
  passport.authenticate('local',function (error, user, info) {
      // this will execute in any case, even if a passport strategy will find an error
      // log everything to console
      console.log(error);
      console.log(user);
      console.log(info);

      if (error) {
        res.status(401).send({message:error});
      } else if (!user) {
        res.status(401).send({message:info});
      } else {
        next();
      }
    })(req,res);
},

      //{ failureRedirect: '/yuck' }),
function (req, res) {
    res.status(200).send({message:'logged in!'});
  });

app.use(express.static(__dirname + '/public'));


app.listen(8080,function(){
  console.log('runnin')
})
/*
secureServer.listen(443, function() {
    console.log('1. listening on *:8080, version ' + 1);
});*/