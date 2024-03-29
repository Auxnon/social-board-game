import * as THREE from "./lib/three.module.js";
import * as Render from "./Render.js";
import * as HexManager from "./HexManager.js";
import * as Control from "./Control.js";
import * as Online from "./Online.js";

import * as PictureMaker from "./PictureMaker.js";
import * as Physics from "./Physics.js";
import * as UI from "./UI.js";
import * as BarUI from "./BarUI.js";
import * as Login from "./Login.js";
import * as Chat from "./Chat.js";
import * as Settings from "./Settings.js";
import * as MakerMenu from "./MakerMenu.js";
import * as AssetManager from "./AssetManager.js";
import * as Drawer from "./Drawer.js";
import * as Equipment from "./Equipment.js";
import * as Character from "./Character.js";
import * as Helper from "./Helper.js";
import * as Mode from "./Mode.js";
import * as Flock from "./Flock.js";

import * as Experimental from "./Experimental.js";

var mainDom;

function init() {
  window.TAU = Math.PI * 2;
  mainDom = document.querySelector("#main");
  UI.init(mainDom);
  try {
    controls = {};

    window.onError = function (message, source, lineno, colno, error) {
      UI.systemMessage(message, "error");
    };
    Physics.init();

    /*
    window.addEventListener('keydown', ev => {
        console.log(ev.keyCode)
        switch (ev.keyCode) {
            case 37:
            case 65:
                controls.left = true;
                break; //left
            case 39:
            case 68:
                controls.right = true;
                break; //right
            case 38:
            case 87:
                controls.up = true;
                break; //up
            case 40:
            case 83:
                controls.down = true;
                break; //down
            case 32:
                make();
                break;
            case 66:
                for(let ii = 0; ii < 12; ii++) { make(); }
                break;
            case 69:
                HexManager.toggleType();
                break;
            case 71:
                makeMan();
                break;
            case 81:
                PictureMaker.test();
                break;
            case 82:
                //PictureMaker.make(HexManager.getModel('Tree_N'), 75, -75);
                Online.resetPhys();
                break;
            case 84:
                //PictureMaker.make(HexManager.getModel('Mount_N'), 90, -20);
                break;
            case 89:
                Online.makePhys({x:.5,y:.5,z:.5},2,{x:0,y:0,z:30});
                break;

            case 8:
                HexManager.setType(1);
                break;
        }
    })
    window.addEventListener('keyup', ev => {
        switch (ev.keyCode) {
            case 37:
            case 65:
                controls.left = false;
                break; //left
            case 39:
            case 68:
                controls.right = false;
                break; //right
            case 38:
            case 87:
                controls.up = false;
                break; //up
            case 40:
            case 83:
                controls.down = false;
                break; //down
        }
    })*/

    let canvas = Render.init();

    if (Mode.init()) {
      HexManager.init();
      PictureMaker.init();

      BarUI.init();
      Character.init();
      Equipment.init();
      Login.init(); //Login calls Online class init after succesful auth, then Online calls init for Control class

      Chat.init();
      Settings.init();
      MakerMenu.init();
      AssetManager.init();

      Drawer.init();
      window.Helper = Helper;
      window.TAU = Math.PI * 2;
      window.Render = Render;

      let loop = setInterval(function () {
        if (AssetManager.getPending() <= 0) {
          // Experimental.init();
          Flock.init();

          clearInterval(loop);
        }
      }, 1000);
    } else {
      //do something completly different
      PictureMaker.init();
      AssetManager.init();
      let loop = setInterval(function () {
        if (AssetManager.getPending() <= 0) {
          // Experimental.init();
          Control.init();
          Mode.initFammies();

          clearInterval(loop);
        }
      }, 100);
    }

    //makeRoom(200,220,80,10)

    //Render.addModel(Render.plane(100,100,0))
  } catch (err) {
    UI.systemMessage(err, "error");
    console.error("!!", err);
  }
}
init();

var controls;

function makeRoom(w, d, h, t) {
  let body = new CANNON.Body({ mass: 0, material: wallProperty });

  let xWall = new CANNON.Box(new CANNON.Vec3(t / 2, d, h));
  let yWall = new CANNON.Box(new CANNON.Vec3(w, t / 2, h));
  let zWall = new CANNON.Box(new CANNON.Vec3(w, d, t / 2));

  body.addShape(xWall, new CANNON.Vec3(-w, 0, h / 2));
  body.addShape(xWall, new CANNON.Vec3(w, 0, h / 2));

  body.addShape(yWall, new CANNON.Vec3(0, -d, h / 2));
  body.addShape(yWall, new CANNON.Vec3(0, d, h / 2));

  body.addShape(zWall, new CANNON.Vec3(0, 0, h));
  body.addShape(zWall, new CANNON.Vec3(0, 0, 0));
  world.addBody(body);

  let xm = Render.cubic(t, d * 2, h, -w, 0, h / 2, Render.wood);
  let xm2 = xm.clone();
  xm2.position.x = w;

  Render.addModel(xm);
  Render.addModel(xm2);

  let ym = Render.cubic(w * 2, t, h, 0, d, h / 2, Render.wood);
  Render.addModel(ym);

  let zm = Render.cubic(w * 2, d * 2, t, 0, 0, 0, Render.ground);
  Render.addModel(zm);
}

function rand(x) {
  return (Math.random() * 2 - 1) * x;
}

export { controls };
