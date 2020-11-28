const serverVersion = '0.1.3'; 
const express=require('express');
const app = express();
const fs = require("fs");

const http= require('http');
const https = require('https');


const options = {
  key: fs.readFileSync("ssl/lh.key"),//"./test/privkey.pem"),
  cert: fs.readFileSync("ssl/lh.pem")//"./test/fullchain.pem")
};

const server = http.createServer(app);
const secureServer = https.createServer(app,options);


var gameBase = require('./SubApp')(app,express,server);

server.listen(8080, function(){
  console.log('1. listening on *:8080, version '+serverVersion);
});