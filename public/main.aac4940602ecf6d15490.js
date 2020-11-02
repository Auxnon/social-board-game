/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkbuup"] = self["webpackChunkbuup"] || []).push([["main"],{

/***/ "./src/Main.js":
/*!*********************!*\
  !*** ./src/Main.js ***!
  \*********************/
/*! namespace exports */
/*! export updatePhysics [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"updatePhysics\": () => /* binding */ updatePhysics\n/* harmony export */ });\n/* harmony import */ var _Render_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Render.js */ \"./src/Render.js\");\n/* harmony import */ var _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/cannon.min.js */ \"./src/lib/cannon.min.js\");\n/* harmony import */ var _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__);\n\r\n\r\n\r\nvar dt = 1 / 60;\r\n\r\nfunction init(){\r\n\tinitCannon();\r\n\tlet canvas=_Render_js__WEBPACK_IMPORTED_MODULE_0__.init();\r\n\tdocument.querySelector('#main').appendChild(canvas)\r\n\r\n\r\n\t\r\n\r\n\tmake()\r\n\r\n\r\n\r\n\r\n}init();\r\n\r\nvar bodies;\r\nvar meshes;\r\nvar world;\r\nfunction initCannon(){\r\n\t\t\tlet N =1;\r\n\t\t\tbodies=[];\r\n            // Setup our world\r\n            world = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.World();\r\n            world.quatNormalizeSkip = 0;\r\n            world.quatNormalizeFast = false;\r\n\r\n            world.gravity.set(0,0,-10);\r\n            world.broadphase = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.NaiveBroadphase();\r\n\r\n            // Create boxes\r\n            let mass = 5, radius = 1.3;\r\n            let boxShape = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Box(new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(0.5,0.5,0.5));\r\n            for(let i=0; i<N; i++){\r\n                let boxBody = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Body({ mass: mass });\r\n                boxBody.addShape(boxShape);\r\n                boxBody.position.set(0,0,100);\r\n                world.addBody(boxBody);\r\n                //boxBody.angularDamping=0.8 //really high\r\n                bodies.push(boxBody);\r\n            }\r\n\r\n            // Create a plane\r\n            let groundShape = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Plane();\r\n            let groundBody = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Body({ mass: 0 });\r\n            groundBody.addShape(groundShape);\r\n            groundBody.position.set(0,0,35)\r\n           // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);\r\n            world.addBody(groundBody);\r\n\r\n            // Joint body\r\n            let shape = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Sphere(0.1);\r\n            let jointBody = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Body({ mass: 0 });\r\n            jointBody.addShape(shape);\r\n            jointBody.collisionFilterGroup = 0;\r\n            jointBody.collisionFilterMask = 0;\r\n            world.addBody(jointBody)\r\n        }\r\n\r\nfunction make(){\r\n\tlet boxShape = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Box(new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(0.5,0.5,0.5));\r\n\tlet boxBody = new _lib_cannon_min_js__WEBPACK_IMPORTED_MODULE_1__.Body({ mass: 5 });\r\n    boxBody.addShape(boxShape);\r\n    world.addBody(boxBody);\r\n    //boxBody.angularDamping=0.8 //really high\r\n    bodies.push(boxBody);\r\n    let cube=_Render_js__WEBPACK_IMPORTED_MODULE_0__.cubit(0.5,0.5,0.5);\r\n    meshes.push(cube)\r\n\r\n    _Render_js__WEBPACK_IMPORTED_MODULE_0__.addModel(cube)\r\n\r\n}\r\n\r\n        function updatePhysics(){\r\n            /*bodies[0].position.set(point.x,point.y,point.z)\r\n            bodies[0].velocity.set(0,0,0)\r\n            bodies[0].angularDamping=1\r\n            bodies[0].inertia.set(0,0,0)*/\r\n\r\n            world.step(dt);\r\n\r\n            \r\n\r\n            for(var i=0; i !== meshes.length; i++){\r\n                meshes[i].position.copy(bodies[i].position);\r\n                meshes[i].quaternion.copy(bodies[i].quaternion);\r\n            }\r\n\r\n            _Render_js__WEBPACK_IMPORTED_MODULE_0__.player.position.copy(bodies[0].position);\r\n            _Render_js__WEBPACK_IMPORTED_MODULE_0__.player.quaternion.copy(bodies[0].quaternion);\r\n            console.log(_Render_js__WEBPACK_IMPORTED_MODULE_0__.player.position)\r\n        }\r\n\r\n\n\n//# sourceURL=webpack://buup/./src/Main.js?");

/***/ }),

/***/ "./src/Render.js":
/*!***********************!*\
  !*** ./src/Render.js ***!
  \***********************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements:  */
/***/ (() => {

eval("throw new Error(\"Module parse failed: Export 'addModel' is not defined (659:15)\\nYou may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders\\n| \\n| \\n> export { init, addModel,cubit, getAlphaCanvas, bufferPrint, loadModel, resize,player }\");\n\n//# sourceURL=webpack://buup/./src/Render.js?");

/***/ })

},
0,[["./src/Main.js","runtime","libs"]]]);