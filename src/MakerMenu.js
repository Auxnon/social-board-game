import * as AssetManager from "./AssetManager.js";
import * as PictureMaker from "./PictureMaker.js";

var menu;
var selected;
var stuff = [
    'man',
    'pot',
    'rock',
    'gran',
    'goblin',
    'hedgehog',
    'werewolf',
    'vampire',
    'zombie',
    'trash',
    'dice'
]

function init() {
    menu = document.querySelector('#makerBar')
    stuff.forEach(i => {
        item(i);
    })
}

function item(st) {
    let dom = d('makerIcon')
    dom.setAttribute('data', st)
    dom.addEventListener('click', ev => {
        selected = ev.target.getAttribute('data')
    })
    dom.innerText = st
    menu.appendChild(dom)
}

function d(c) {
    let div = document.createElement('div')
    div.className = c;
    return div
}

function getSelection() {
    return selected
}

export { init, getSelection }