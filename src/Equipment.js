import * as PictureMaker from "./PictureMaker.js";
import * as Online from "./Online.js";
import * as Control from "./Control.js";
import * as Physics from "./Physics.js";
import * as PlayerManager from "./PlayerManager.js";

var main;
var dragger;
var menu;
var held;
var items = {} //name:,description:,model:
var equipmentDebounce;

function init() {
    initSheet();
    main = document.querySelector('#equipmentCard')
    menu = main.querySelector('#equipment-bar')
    dragger = main.querySelector('#pseduo-dragger')

    window.addEventListener('pointermove', ev => { //DEV TODO todo
        if(held) {
            moveDragger(ev)
        }
    })

    /* menu.addEventListener('pointerup', ev => {
         if(!held){
             let target=Physics.getCarry()
             if(target){
                 makeItem(target.meta.name,target.meta.description,target.meta.model)
                 Physics.delPhys(target.id)
                 Control.cancelCarry();
             }
         }
     })*/

    /*main.addEventListener('contextmenu',ev=>{
        ev.preventDefault();
    })*/

    window.addEventListener('pointerup', ev => {

    })

}

function pointerUp(mx, my) {
    if(held) {
        held.classList.remove('equipment-item-selected')
        if(dragger.children.length)
            dragger.children[0].remove()

        held.style.display = 'none'
        let obj = scrapItem(held)
        if(obj) {
            let pos = Control.pos();
            obj.player = PlayerManager.getOwnPlayer()
            if(obj && obj.model.startsWith('die')){
                obj.label='dice'
                Online.physMake({ x: 1.2,y: 1.2, z: 1.2 }, 2, { x: pos.x, y: pos.y, z: 10 }, Physics.calcQuaterion(Math.PI / 2), 3, obj);
            }else
                Online.physMake({ x: 1.5, y: 1.5, z: 3 }, 2, { x: pos.x, y: pos.y, z: 10 }, Physics.calcQuaterion(Math.PI / 2), 1, obj);
        }
        held = undefined
    } else {
        let target = Physics.getCarry()
        if(target) {
            let dom = document.elementFromPoint(mx, my)
            if(dom) {
                dom = dom.closest('#equipment-bar')
                if(dom) {
                    makeItem(target.meta.name, target.meta.description, target.meta.model)
                    Physics.physDel(target.id)
                    Control.cancelCarry();
                }


            }
        }
    }
}

function moveDragger(ev) {
    dragger.style.left = ev.clientX + 'px'
    dragger.style.top = ev.clientY + 'px'
}

function makeItem(name, description, model) {
    let dom = d('equipment-item')
    if(!name)
        name = 'undefined'
    let h4 = document.createElement('h4')
    h4.innerText = name

    let p = document.createElement('p')
    if(description)
        p.innerText = description
    else
        p.innerText = 'stuff'

    let icon = document.createElement('img')
    icon.className = 'equipment-icon'
    if(model) {
        dom.setAttribute('data', model)
        icon.setAttribute('src', PictureMaker.get(model));
    }

    dom.appendChild(h4)
    dom.appendChild(icon)
    dom.appendChild(p)
    dom.addEventListener('pointerdown', ev => {
        if(dragger.children.length)
            dragger.children[0].remove()
        held = dom;
        held.classList.add('equipment-item-selected')
        dragger.appendChild(dom.cloneNode(true))
        moveDragger(ev)
    })
    dom.addEventListener('pointerup', ev => {
        let target = document.elementFromPoint(ev.clientX, ev.clientY)
        if(!target.classList.contains('equipment-item')) {
            target = target.parentElement
            if(!target.classList.contains('equipment-item')) {
                return;
            }
        }

        console.log('up' + target.innerText)
        if(held) {
            held.classList.remove('equipment-item-selected')
            menu.insertBefore(held, target)
            held = undefined
        }
        if(dragger.children.length)
            dragger.children[0].remove()
    })
    menu.appendChild(dom)
    //item.push({name:name,description:description,model:model})
    if(equipmentDebounce){
        clearTimeout(equipmentDebounce)
        equipmentDebounce=undefined
    }
    equipmentDebounce=setTimeout(()=>{
        let array=[];
        main.querySelectorAll('.equipment-item').forEach(item=>{
            array.push(scrapItem(item))
        })
         Online.sendEquipment(PlayerManager.getOwnPlayer().id,array)
         console.log('send equipment '+array.length)
    },2000)
}
function syncEquipment(data){
    if(!data || data.length==0){
        makeItem('A Man', 'Good boi', 'man')
        makeItem('Cool Rock', "It's a cool rock", 'rock')
        makeItem('Pot', "420", 'pot')
    }else{
        data.forEach(item=>{
            makeItem(item.name,item.description,item.model)
        })
    }
}

function scrapItem(item) {
    let obj = {};
    let name = item.querySelector('h4')
    let description = item.querySelector('p')
    let model = item.getAttribute('data')
    if(name)
        obj.name = name.innerText
    if(description)
        obj.description = description.innerText
    if(model)
        obj.model = model
    return obj;
}

function reset() {
    menu.querySelectorAll('.equipment-item').forEach(app => {
        app.style.display = ''
    })
}

function d(c) {
    let dom = document.createElement('div')
    if(c)
        dom.className = c;
    return dom;
}

function initSheet() {
    var sheet = document.createElement('style')
    sheet.innerHTML = `
    #equipment-bar{
        position: absolute;
        border-radius: 16px;
        background-color: #fff5;
        border-radius: 16px;
        min-height: 128px;
        max-height: 60%;
        width: 512px;
        bottom: 96px;
        left: 50%;
        transform: translate(-50%);
        overflow-x: hidden;
        overflow-y: auto;
        touch-action: none;
        pointer-events:auto;
    }
    .equipment-item{
        user-select: none;
        border-radius: 8px;
        background-color: white;
        display: inline-block;
        min-height: 16px;
        min-width: 16px;
        max-width: 200px;
        margin: 8px;
        box-sizing: border-box;
    }
    .equipment-item-selected{
        border: dashed white 3px;
        opacity: 0.5;
    }
    .equipment-item h4{
        display:block;
        margin:6px;
    }
    .equipment-item p{
        display: inline-block;
        margin: 16px;
    }
    .equipment-icon{
        min-width: 48px;
        min-height: 48px;
        border-radius: 8px;
        background-color: gray;
        display: inline-block;
    }
    #pseduo-dragger{
        position: absolute;
        pointer-events: none;
    }`
    document.body.appendChild(sheet)

}

export { init, pointerUp,syncEquipment }