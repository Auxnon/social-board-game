import * as UI from "./UI.js";
import * as Render from "./Render.js";
import * as Control from "./Control.js";
import * as Chat from "./Chat.js";

//doms
var apps;
var svg;
var path;
var bar;
var barBox;
var mainTitle;

var focused;
var barMove = false;
var barPos = 1;
var barTucked = false;
var appPoints;
var moveFactor = 0;

var count = 0;
var tick = false;

var targetMove = undefined;
var targetPoint = { x: 0, y: 0 }

var points;

var pendingRenderId; //if not undefined, wait for Render to load and then apply the scene

var resizeDebouncer;

var closeCard;

function init(argument) {
    closeCard = document.querySelector('#closeCard');
    closeCard.addEventListener('click', ev => { closeApp() })

    let preApps = document.querySelectorAll('.card');
    apps = []
    preApps.forEach(app => { //convert out of a nodelist to an array, it matters trust me
        apps.push(app)
    });

    apps.forEach((app, index) => {
        app.style.top = Math.random() * window.innerWidth + 'px'
        app.style.left = Math.random() * window.innerHeight + 'px'
        app.offset = { x: 0, y: 0 };
        app.appId = index;
        app.addEventListener('pointerdown', ev => { appSelect(app, ev); })
        app.addEventListener('dragstart', ev => { ev.preventDefault() })
    });

    window.addEventListener('pointerup', winMouseUp)
    window.addEventListener('resize', resize);
    //initLine();
    window.addEventListener('pointermove', mousemove)

    barInit();

    resize();
    animate();
    //setInterval(() => { boundaryCheck() }, 3000)
}

function openApp(id) {
    let app = apps[id];
    if(app) {

        app.classList.add('cardMax')
        app.focused = true;
        app.style.zIndex = 0;
        Object.values(app.children).forEach(sub => {
            if(sub.className == 'card-notifier')
                sub.remove();
            else
                sub.style.display = 'initial';
        })

        if(app.id == 'landscapeCard') {
            Control.setLandscaping(true)
        } else {
            Control.setLandscaping(false)
        }

        if(app.id == 'chatCard') {
            Chat.openChat()
        }

        if(app.id == 'npcCard') {
            Control.setMaker(true)
        } else {
            Control.setMaker(false)
        }

        if(app.spot == -1) {
            closeCard.style.top = '32px'
            closeCard.style.left = '32px'
        } else {
            closeCard.style.top = app.style.top
            closeCard.style.left = app.style.left
        }
        closeCard.style.opacity = '1';
        closeCard.style.pointerEvents = 'auto';

        /*if(Render) {
            openAppApplyRender(id, app)
        } else {
            pendingRenderId = id;
            pendApp(id);
        }*/
        focused = app;


    }
}

function openAppApplyRender(id, app) {
    let d = Render.getAlphaCanvas();
    d.style.opacity = 1;
    d.remove();

    let afterImage = document.querySelector('#afterImage');

    afterImage.remove();


    app.appendChild(d);

    if(focused) {
        focused.appendChild(afterImage);
        afterImage.style.opacity = 1;
        setTimeout(() => { afterImage.style.opacity = 0; }, 1);
    } else { //silly I know but it's just easier to keep the afterImage within the dom, even if in this logical case it's not used
        afterImage.style.opacity = 0;
        if(app == 0)
            apps[1].appendChild(afterImage);
        else
            apps[0].appendChild(afterImage);
    }
    Render.bufferPrint();
    Render.flipScene(id)
}

function closeApp() {
    if(focused) {
        focused.classList.remove('cardMax')
        focused.style.zIndex = 2;
        focused.focused = undefined; //wow why did i name this like this //TODO
        Control.primaryTouchPan()
        Control.setLandscaping(false)
        Control.setMaker(false)
        Object.values(focused.children).forEach(sub => {
            if(sub.className == 'card-notifier')
                sub.style.display = 'initial'
            else
                sub.style.display = 'none';
        })


        /*window.history.pushState({}, '', '/');
        if(!disableFade && Render) {
            let d = Render.getAlphaCanvas();
            setTimeout(() => { d.style.opacity = 0; }, 1);
            d.style.opacity = 1;
        }*/
        closeCard.style.opacity = '0';
        closeCard.style.pointerEvents = 'none';
    }
    if(barTucked) {
        barTucked = false;
        barAdjust()
    }
}



function resize() {

    clearTimeout(resizeDebouncer);
    resizeDebouncer = setTimeout(function() {
        //svg.setAttribute('width', window.innerWidth + "px")
        //svg.setAttribute('height', window.innerHeight + "px")
        barAdjust();
        Render.resize();

        //UI.systemMessage('inner ' + window.innerWidth + '; screen ' + window.screen.width, 'success')
    }, 250);

}

function rand() {
    return Math.random() * 100 - 50;
}


function barInit() {
    bar = document.querySelector('#bar')
    let barHandle = document.querySelector('#barHandle')
    barHandle.addEventListener('pointerdown', ev => {
        //let xx = barBox.left //-(barBox.right-barBox.left)/2
        //let yy = barBox.top //-(barBox.bottom-barBox.top)/2

        barMove = true; //{x:ev.clientX-xx,y:ev.clientY-yy};

        /*if(points.length < 10) { //rebuild are point array
            let startPoint = points[0];
            let array = Array(7).fill(startPoint);
            points = array.concat(points)
        }

        barLineFactor = 0;*/
    })
    barHandle.addEventListener('dragstart', ev => { ev.preventDefault() })
    /*barHandle.addEventListener('pointerup',ev=>{
        barMove=false;
    })*/

    appPoints = [];

    barHandle.style.transform = 'translate(-50%,-200%)';
    bar.style.left = '50%';
    bar.style.top = (window.innerHeight - 64) + 'px';

    barCalculate(true);
}

function barCalculate(notate) {

    //first determine  how many apps will be visably part of the app bar
    let count = 0;
    let appsInRow = [];
    let sideWays = barPos == 0 || barPos == 2;

    if(!notate) {
        apps.forEach(app => {
            if(app.spot != -1) {
                appsInRow.push(app)
                count++;
            }
        })
    } else {
        count = apps.length;
        appsInRow = apps;
    }
    if(sideWays) {
        bar.style.height = (count > 0 ? count : 1) * 64 + 'px'
        bar.style.width = '82px'

    } else {
        bar.style.width = (count > 0 ? count : 1) * 64 + 'px'
        bar.style.height = '82px'
    }

    let rect = bar.getBoundingClientRect();
    barBox = rect
    let width = rect.width;
    let height = rect.height;

    let ratio;
    if(sideWays)
        ratio = height / (count);
    else
        ratio = width / (count);

    if(!notate) {
        if(sideWays) {
            appsInRow.sort(function(a, b) {
                return parseInt(a.style.top) - parseInt(b.style.top);
            });
            //bar.style.borderWidth="0 6px 0px 6px";

        } else
            appsInRow.sort(function(a, b) {
                return parseInt(a.style.left) - parseInt(b.style.left);
            });
    }


    for(let i = 0; i < count; i++) {
        if(sideWays)
            appPoints[i] = { x: rect.left + width / 2, y: 32 + rect.top + (i) * ratio };
        else
            appPoints[i] = { x: 32 + rect.left + (i) * ratio, y: rect.top + height / 2 };


        if(targetMove && targetMove == appsInRow[i])
            targetPoint = appPoints[i]

        if(notate) {
            apps[i].spot = i;
            appPoints[i].app = appsInRow[i]
        }
        _moveEle(appsInRow[i], appPoints[i].x, appPoints[i].y)
    }
    //if(barLineFactor == -1) {
    let handle = barHandle.getBoundingClientRect();
    if(sideWays) {
        let xx = handle.left + handle.width / 2
        drawSimpleBarLine({ x: xx, y: handle.top }, { x: xx, y: handle.bottom })
    } else {
        let yy = handle.top + handle.height / 2
        drawSimpleBarLine({ x: handle.left, y: yy }, { x: handle.right, y: yy })
    }

    //}
}

function animate() {
    /*if(barLineFactor > -1) {
        if(barLineFactor < 4) {
            if(barLineFactor) {
                let target = {};
                let rect = barHandle.getBoundingClientRect();
                let mid = { x: rect.width / 2, y: rect.height / 2 }

                if(barPos == 0 || barPos == 2) {
                    switch (barLineFactor) {
                        case 3:
                            target = { x: rect.left + mid.x, y: rect.top };
                            break;
                        case 2:
                            target = { x: rect.left + mid.x, y: rect.top + mid.y };
                            break;
                        default:
                            target = { x: rect.left + mid.x, y: rect.bottom }
                    }
                } else {
                    switch (barLineFactor) {
                        case 3:
                            target = { x: rect.left, y: rect.top + mid.y };
                            break;
                        case 2:
                            target = { x: rect.left + mid.x, y: rect.top + mid.y };
                            break;
                        default:
                            target = { x: rect.right, y: rect.top + mid.y }
                    }
                }

                let dx = mouseObj.x - target.x;
                let dy = mouseObj.y - target.y;
                let dr = Math.sqrt(dx * dx + dy * dy)
                mouseObj.x -= dx / 2
                mouseObj.y -= dy / 2
                if(dr < 1 && barLineFactor < 4)
                    barLineFactor++;
            }


            let diff = { x: mouseObj.x - points[0].x, y: mouseObj.y - points[0].y }
            let dr = Math.sqrt(diff.x * diff.x + diff.y * diff.y)

            if(dr > 40) {
                let nextVector;
                if(barLineFactor > 1) { //straight to next point
                    nextVector = { x: mouseObj.x, y: mouseObj.y };
                } else { //wiggle the line
                    nextVector = { x: mouseObj.x - (tick ? 1 : -1) * 20 * diff.y / dr, y: mouseObj.y + (tick ? 1 : -1) * 20 * diff.x / dr };
                }

                let dir = Math.abs(diff.x) > Math.abs(diff.y);
                let pos = dir ? diff.x > 0 : diff.y > 0
                tick = !tick

                drawBarLine(nextVector);
            }
        } else {
            if(barLineFactor % 5 == 1) {

                let target = points.shift();
                console.log('chop off points ' + points.length)
                if(points.length <= 3) {
                    barLineFactor = -1;
                    barCalculate();
                } else {
                    drawBarLine(target)
                }

            }
            if(barLineFactor != -1)
                barLineFactor++;

        }
    }
*/

    requestAnimationFrame(animate);
}

function drawBarLine(nextVector) {
    /*let st = "M" + mouseObj.x + " " + mouseObj.y;
    let last = { x: nextVector.x, y: nextVector.y };
    for(let i = 0; i < points.length; i++) {
        let halfy = (points[i].y - last.y) / 2
        let halfx = (points[i].x - last.x) / 2
        let midx = last.x + halfx;
        let midy = last.y + halfy;
        st += "Q" + last.x + " " + last.y + " " + midx + " " + midy //+points[i].x+" "+points[i].y

        let prev = { x: points[i].x, y: points[i].y };
        points[i] = { x: last.x, y: last.y };
        last = prev;
    }
    path.setAttribute('d', st)*/
}

function drawSimpleBarLine(one, two) {
    let st = "M" + one.x + ' ' + one.y + "L" + two.x + ' ' + two.y;
    //path.setAttribute('d', st);

}

function mousemove(ev) {
    barMoveHandler(ev);
    if(targetMove) {
        moveFactor++;
        targetMove.pos = { x: ev.clientX + targetMove.offset.x, y: ev.clientY + targetMove.offset.y }

        if(ev.clientY > barBox.top && ev.clientY < barBox.bottom && ev.clientX > barBox.left && ev.clientX < barBox.right) {
            let point = targetPoint;
            let d = { x: point.x - targetMove.pos.x, y: point.y - targetMove.pos.y }
            targetMove.pos = { x: point.x - d.x / 3, y: point.y - d.y / 3 }
            if(targetMove.moving) { //called once per state change
                targetMove.moving = undefined;
                targetMove.spot = 0;
                barCalculate();
            }

        } else {
            if(!targetMove.moving) { //called once per state change
                targetMove.moving = true;
                targetMove.spot = -1;

                barCalculate()
            }

        }

        targetMove.style.left = targetMove.pos.x + 'px'
        targetMove.style.top = targetMove.pos.y + 'px'
    }
    /*else if(barLineFactor == 0) {
           if(count > 2) {
               count = 0;
               mouseObj = { x: ev.clientX, y: ev.clientY }
           }
           count++
       }*/
}

function barMoveHandler(ev) {
    if(barMove) {
        moveFactor++;
        let xx = ev.clientX;
        let yy = ev.clientY;
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let dx = xx - mx;
        let dy = yy - my;
        let xtuck = (mx - Math.abs(dx)) < 10
        let ytuck = (my - Math.abs(dy)) < 10

        let r = Math.atan2(dy, dx) / Math.PI;
        let ar = Math.abs(r)
        if(ar < 0.25) { //right
            if(barPos != 2) {
                barPos = 2;
                barAdjust()
            }
            if(xtuck != barTucked) {
                barTucked = xtuck;
                barAdjust();
            }
        } else if(ar < 0.75) { //top or bottom
            if(r < 0) { //top
                if(barPos != 3) {
                    barPos = 3;
                    barAdjust()
                }
            } else { //botttom
                if(barPos != 1) {
                    barPos = 1
                    barAdjust()
                }
            }
            if(ytuck != barTucked) {
                barTucked = ytuck;
                barAdjust();
            }
        } else { //left
            if(barPos != 0) {
                barPos = 0;
                barAdjust()
            }
            if(xtuck != barTucked) {
                barTucked = xtuck;
                barAdjust();
            }
        }

        /*
                        if(window.innerWidth>window.innerHeight){ //landscape
                            let half=(window.innerWidth - window.innerHeight)/2
                            if(xx<half){ //left
                                bar.style.transform='rotate(90deg)'
                                barHandle.style.transform='translate(-50%,-200%)'
                            }else if(xx>window.innerWidth-half){ //right
                                bar.style.transform='rotate(90deg)'
                                barHandle.style.transform='translate(-50%,100%)'
                            }else{
                                bar.style.transform='rotate(0deg)'
                                if(yy>window.innerHeight/2){
                                    barHandle.style.transform='translate(-50%,-200%)'
                                }else{
                                    barHandle.style.transform='translate(-50%,100%)'
                                }
                            }
                        }else{ //portrait
                            let half=(window.innerHeight - window.innerWidth)/2
                            if(yy<half){ //top
                                bar.style.transform='rotate(0deg)'
                                barHandle.style.transform='translate(-50%,-200%)'
                            }else if(yy>window.innerHeight-half){ //bottom
                                bar.style.transform='rotate(0deg)'
                                barHandle.style.transform='translate(-50%,100%)'
                            }else{
                                bar.style.transform='rotate(90deg)'
                                if(xx>window.innerWidth/2){
                                    barHandle.style.transform='translate(-50%,-200%)'
                                }else{
                                    barHandle.style.transform='translate(-50%,100%)'
                                }
                            }
                        }*/
    }
}

function barAdjust() {
    if(barPos == 2) { //right

        bar.style.left = window.innerWidth - (barTucked ? -32 : 48) + 'px';
        bar.style.top = '50%'; //window.innerHeight/2;
        barCalculate();
        barHandle.style.transform = 'translate(-200%,-50%)'
        barHandle.style.width = '32px';
        barHandle.style.height = '80%';
        bar.style.borderWidth = "0px 0px 0px 6px";
        //mainTitle.style.top = '28px';
        Chat.setSize(false)
    } else if(barPos == 3) { //top
        barHandle.style.transform = 'translate(-50%,100%)'
        bar.style.left = '50%';
        bar.style.top = (barTucked ? -32 : 48) + 'px';
        //mainTitle.style.top = 'calc(100% - 128px)';

        barCalculate();
        barHandle.style.height = '32px';
        barHandle.style.width = '80%';
        bar.style.borderWidth = "0px 0px 6px 0px";
        Chat.setSize(false)
    } else if(barPos == 1) { //bottom
        barHandle.style.transform = 'translate(-50%,-200%)'
        bar.style.left = '50%';
        bar.style.top = window.innerHeight - (barTucked ? -32 : 48) + 'px';
        //mainTitle.style.top = '28px';
        barCalculate();
        barHandle.style.height = '32px';
        barHandle.style.width = '80%';
        bar.style.borderWidth = "6px 0px 0px 0px"
        Chat.setSize(true)
    } else { //left
        barHandle.style.transform = 'translate(100%,-50%)'
        bar.style.left = (barTucked ? -32 : 48) + 'px';
        bar.style.top = '50%'
        barCalculate()
        barHandle.style.width = '32px'
        barHandle.style.height = '80%'
        bar.style.borderWidth = "0px 6px 0px 0px";
        //mainTitle.style.top = '28px';
        Chat.setSize(false)
    }
}


function appSelect(app, ev) {
    if(!app.focused) {
        targetMove = app;

        app.pos = { x: parseInt(app.style.left), y: parseInt(app.style.top) }
        targetPoint = { x: app.pos.x, y: app.pos.y }
        //app.origin={x:app.pos.x,y:app.pos.y}
        app.offset = { x: app.pos.x - ev.clientX, y: app.pos.y - ev.clientY }
        app.classList.add('cardMove')
        app.moving = undefined;

    }
}

function winMouseUp(ev) {
    if(barMove) {
        barMove = false;
        //barLineFactor = 1;
        console.log(moveFactor)
        if(moveFactor < 10) {
            closeApp();
        }
    }

    if(targetMove) {
        targetMove.classList.remove('cardMove')
        if(moveFactor < 20) {
            if(focused && focused == targetMove) {
                targetMove.classList.remove('cardMax')
                targetMove.focused = undefined;
                focused = undefined;
                targetMove.style.zIndex = 2;
                //window.history.pushState({}, '', '/');

            }
            // else {

            closeApp(true);
            openApp(targetMove.appId);

            //window.history.pushState({ appId: targetMove.appId }, targetMove.name, '?id=' + targetMove.appId + '&app=' + targetMove.id);
            //}
        } else {
            barCalculate();

            console.log('fix bar also')
        }
    } else {
        barCalculate();
        console.log('fix bar')
    }
    targetMove = undefined;

    moveFactor = 0;

}

function boundaryCheck() {
    apps.forEach(app => {
        if(!app.focused) {
            let rect = app.getBoundingClientRect();

            let x = rect.left;
            let y = rect.top;
            let w2 = (rect.right - rect.left) / 2;
            let h2 = (rect.bottom - rect.top) / 2

            if(x < 0) {
                app.style.left = w2 + 'px'
            } else if(x > window.innerWidth - w2 * 2) {
                app.style.left = window.innerWidth - w2 + 'px'
            }
            if(y < 0) {
                app.style.top = h2 + 'px'
            } else if(y > window.innerHeight - h2 * 2) {
                app.style.top = window.innerHeight - h2 + 'px'
            }

        }

    })
}

function _moveEle(ele, x, y, bool) {
    if(!bool)
        ele.pos = { x: x, y: y }
    ele.style.left = x + 'px'
    ele.style.top = y + 'px'
}

function pendApp(id) {
    let app = apps[id]
    let cube = app.querySelector('cube')
    if(!cube) {
        cube = document.createElement('cube');
        app.appendChild(cube);
    }
}

function clearPendApp(id) {
    let app = apps[id]
    let cube = app.querySelector('cube')
    if(cube)
        cube.remove()
}

function hide() {
    barTucked = true;
    barAdjust();
}

function setNotifier(id, num) {
    let target = apps[id];
    if(!target.focused) {
        let dom = target.querySelector('.card-notifier');
        if(!dom) {
            dom = document.createElement('div')
            dom.className = 'card-notifier';
            target.appendChild(dom)
            dom.innerText = num
        } else
            dom.innerText = parseInt(dom.innerText) + num;

        target.style.animation = ''
        void target.offsetWidth;
        target.style.animation = 'attention 0.2s';

    }

}

function isFocused(id) {
    let app = apps[id]
    if(app)
        return app.focused

    return false;
}


export { pendApp, clearPendApp, apps, init, openApp, closeApp, hide, setNotifier }