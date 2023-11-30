const serverVersion = "0.2.0";
const express = require("express");
const app = express();
const fs = require("fs");
const cookieParser = require("cookie-parser")();

const http = require("http");
const https = require("https");

const PORT = 8443;
const options = {
  key: fs.readFileSync("ssl/lh.key"), //"./test/privkey.pem"),
  cert: fs.readFileSync("ssl/lh.pub"), //"./test/fullchain.pem")
};

const server = http.createServer(app);
const secureServer = https.createServer(app, options);

var session = require("express-session");
var SQLiteStore = require("connect-sqlite3")(session);
var sessionStore = new SQLiteStore();

var sessionObj = session({
  //key: 'express.sid',
  store: sessionStore,
  secret: "your secret", // DEV temporary
  //resave: true,
  // httpOnly: true,
  //secure: true,
  //ephemeral: true,
  saveUninitialized: true,
  //cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
});

app.use(cookieParser);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionObj);

const io = require("socket.io")(server);

io.use(function (socket, next) {
  console.log("> Passed session through io socket");
  sessionObj(socket.request, {}, next); //socket.request.res || {}
});

var gameBase = require("./SubApp")(app, express, server, io, sessionObj);

server.listen(PORT, function () {
  console.log(`> Listening on *:${PORT}, version ${serverVersion}`);
});
