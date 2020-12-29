import * as Drawer from "./Drawer.js";
import * as PictureMaker from "./PictureMaker.js";
import * as Online from "./Online.js";
import * as PlayerManager from "./PlayerManager.js";
import * as UI from "./UI.js";

const SKILLS = [
    ['STR', 'Athletics', 'athletics.png'],
    ['DEX', 'Acrobatics', 'acrobatics.png'],
    ['DEX', 'Sleight of Hand', 'sleight.png'],
    ['DEX', 'Stealth', 'stealth.png'],

    ['INT', 'Arcana', 'arcana.png'],
    ['INT', 'History', 'history.png'],
    ['INT', 'Investigation', 'investigation.png'],
    ['INT', 'Nature', 'nature.png'],
    ['INT', 'Religion', 'religion.png'],

    ["WIS", "Animal Handling", 'animal.png'],
    ["WIS", "Insight", 'insight.png'],
    ["WIS", "Medicine", 'medicine.png'],
    ["WIS", "Perception", 'perception.png'],
    ["WIS", "Survival", 'survival.png'],

    ["CHR", "Deception", 'deception.png'],
    ["CHR", "Intimidation", 'intimidation.png'],
    ["CHR", "Performance", 'performance.png'],
    ["CHR", "Persuasion", 'persuasion.png'],
]

var testToggle = true;
var main;
var editing = false;

var sectionStatus;
var sectionStats;
var sectionPersonality;
var sectionCharacter;
var sectionOther;
var sectionTraits;

var traitsAdd
var otherAdd;
var inspirationButton;

var sheets={};
var currentUser;
var sheetDom;

const emptySheet=JSON.stringify({traits:[],personality:["","","",""],proficiencies:[],abilities:[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],skills:[0,0,0,0,0,0,0,0,0,0,0,0,0,0],character:{name:"Doopy",type:"Bard",proficiency:0,inspiration:"./undefined"}})

function init() {
    main = document.querySelector('#characterCard')
    sheetDom  = document.querySelector('.sheet')
    initSheet();


    let stats = main.querySelector('.section-stats')
    sectionStats=stats;
    sectionOther=main.querySelector('.section-other');
    sectionTraits=main.querySelector('.section-traits');
    sectionPersonality=main.querySelector('.section-personality');
    sectionStatus=main.querySelector('.section-status');
    sectionCharacter=main.querySelector('.section-character');

    let strDom = makeStat('STR', 'Strength', 5)
    let dexDom = makeStat('DEX', 'Dexterity', 5)
    let conDom = makeStat('CON', 'Constitution', 5)
    let intDom = makeStat('INT', 'Intelligence', 5)
    let wisDom = makeStat('WIS', 'Wisdom', 5)
    let chrDom = makeStat('CHR', 'Charisma', 5)

    let strg = d('section-group section-group-mini')
    let dexg = d('section-group section-group-mini')
    let cong = d('section-group section-group-mini')
    let intg = d('section-group section-group-mini')
    let wisg = d('section-group section-group-mini')
    let chrg = d('section-group section-group-mini')

    strg.appendChild(strDom)
    dexg.appendChild(dexDom)
    cong.appendChild(conDom)
    intg.appendChild(intDom)
    wisg.appendChild(wisDom)
    chrg.appendChild(chrDom)

    stats.appendChild(strg)
    stats.appendChild(dexg)
    stats.appendChild(cong)
    stats.appendChild(intg)
    stats.appendChild(wisg)
    stats.appendChild(chrg)


    SKILLS.forEach((i, n) => {
        let skill = makeSkill(n, i[0], i[1], i[2]);
        switch (i[0]) {
            case 'STR':
                strg.appendChild(skill);
                break;
            case 'DEX':
                dexg.appendChild(skill);
                break;
            case 'CON':
                cong.appendChild(skill);
                break;
            case 'INT':
                intg.appendChild(skill);
                break;
            case 'WIS':
                wisg.appendChild(skill);
                break;
                ddefault: chrg.appendChild(skill);
        }
        //skillList.appendChild(
    })


    strg.addEventListener('click', toggleMini);
    dexg.addEventListener('click', toggleMini);
    cong.addEventListener('click', toggleMini);
    intg.addEventListener('click', toggleMini);
    wisg.addEventListener('click', toggleMini);
    chrg.addEventListener('click', toggleMini);



    //
    window.addEventListener('keyup', ev => {
        //console.log(ev.keyCode )
        if(ev.keyCode == 27) {
            if(testToggle)
                enableEdit()
            else
                disableEdit()

            testToggle = !testToggle
        }
    })

    //dom[1].appendChild(makeSkill(0,'CHR','Hello',null,2));
    makeStatus();

    //createSimpleAdjuster(main)
    

    otherAdd=sectionOther.querySelector('.feature-add');
    traitsAdd=sectionTraits.querySelector('.feature-add');

    otherAdd.addEventListener('click',ev=>{
        let dom=makeOther();
        sectionOther.insertBefore(dom,otherAdd)
    })

    traitsAdd.addEventListener('click',ev=>{
        let dom=makeTrait();
        sectionTraits.insertBefore(dom,traitsAdd)
    })

    let prof=sectionCharacter.querySelector('.character-proficiency')
    let cent=d('centered')
    cent.appendChild(input(2,6))
    prof.appendChild(cent)

    main.querySelector('#sheet-edit-button').addEventListener('click',ev=>{
        if(testToggle){
                enableEdit()
                ev.target.classList.add('toggled')
            }else{
                let out=disableEdit()
                if(out)
                    UI.systemMessage('Saved Character!','success',false,1500)
                ev.target.classList.remove('toggled')
            }
            testToggle = !testToggle
    })

    let inspiration=sectionCharacter.querySelector('.character-inspiration')

    inspirationButton=Drawer.makeButton(inspiration,'character',function(opening){
        let profi=sectionCharacter.querySelector('.character-inspiration').querySelector('img')

        if(opening)
            Drawer.setData(profi)
        else
            profi.src=Drawer.getData()
    })
    inspirationButton.style.position='absolute'
    inspirationButton.style.right='-16px'
    inspirationButton.style.bottom='-16px'
    //inspiration.appendChild(inspButton)

    let pic=sectionCharacter.querySelector('.character-picture')
    pic.src=PictureMaker.get('man')

    disableEdit(true);
}



function makeStat(type, label) {
    let item = d('section-item ' + type);
    let labelDom = d('section-item-label')
    let num = input(0, 30)
    //num.disabled=true;
    labelDom.innerText = label
    item.appendChild(labelDom)

    let center = d('centered')
    center.appendChild(num)
    item.appendChild(center)

    let st = d('section-item-saving-throw')
    let stCenter = d('centered')
    let stn = document.createElement('input');
    stn.className = 'number';
    stn.value = 0
    stn.type = 'number'
    stn.min = 0;
    stn.max = 30;
    stCenter.appendChild(stn)
    st.appendChild(stCenter)
    item.appendChild(st)

    let row = d('skill-link-row')
    item.appendChild(row)

    return item;
}

function makeSkill(id, type, label, icon) {
    let item = d('skill-item');
    item.classList.add(type)
    item.type = type;


    let iconDom = d('skill-item-icon');
    iconDom.style.backgroundImage = " url('./assets/" + icon + "')";
    let labelDom = d('skill-item-label');
    labelDom.innerText = label

    let numberDom = document.createElement('input')
    numberDom.className = 'number'
    numberDom.value = 0;
    numberDom.type = 'number'
    numberDom.min = -5
    numberDom.max = 10

    item.appendChild(iconDom);
    item.appendChild(labelDom);
    item.appendChild(numberDom);

    item.skillId = id;
    return item;
}

function makeInputNumber(parent) {
    let input = d('editable-number');
    let box = parent.getBoundingClientRect();
    //offsetLeft
    input.style.left = -24 + box.width / 2 + parent.offsetLeft + 'px'; //
    input.style.top = -24 + box.height / 2 + parent.offsetTop + 'px';

    input.addEventListener('touchstart', numberStartAdjust);
    input.addEventListener('touchmove', numberMoveAdjust);
    input.addEventListener('touchend', numberEndAdjust);
    input.addEventListener('click', numberClick);
    input.host = parent;
    input.range = [parseInt(parent.value), parseInt(parent.min), parseInt(parent.max)]

    parent.parentElement.appendChild(input)
}
function makeOther(){
    let dom=d('feature')
    let p=document.createElement('p')
    p.setAttribute('contenteditable',true)
    dom.appendChild(p)
    return dom;
}

function makeTrait(obj){
    let dom=d('feature')
    let name=d('feature-name')
    let tag;
    
    let p=document.createElement('p')
    

    let check=document.createElement('input')
    check.setAttribute('type','checkbox')

    if(obj){
        check.checked=obj.spell
        check.style.display='none'
        name.innerText=obj.name;
        p.innerText=obj.description
        tag=[];
        obj.tags.forEach(t=>{
            let dom=d('feature-tag')
            dom.innerText=t
            tag.push(dom)
        })

    }else{
        tag=d('feature-tag')
        name.setAttribute('contenteditable',true)
        tag.setAttribute('contenteditable',true)
        p.setAttribute('contenteditable',true)
    }
   


    dom.appendChild(name)
    if(obj)
        tag.forEach(t=>{dom.appendChild(t)})
    else
        dom.appendChild(tag)

    dom.appendChild(p)
    dom.appendChild(check)
    return dom;
}

function enableEdit() {
    editing = true;
    main.querySelectorAll('.section-group-mini').forEach(dom => {
        dom.classList.remove('section-group-mini')
    })
    /*let skills = skillList.querySelectorAll('.skill-item')
    skillList.appendChild(d('section-dashed-line'))
    skills.forEach(skill => {
        if(skill.style.display == 'none') {
            skill.style.display = 'block'
            //skill.remove();
            skillList.appendChild(skill)
        } else {
            skill.classList.add('selected')
        }
        skill.addEventListener('click', skillSelect)
    })*/

    let numbers = main.querySelectorAll('.number')
    numbers.forEach(number => {
        number.disabled = false;
        makeInputNumber(number)
    })

    let list=Object.values(main.querySelectorAll('p'))

    //list = list.concat(Object.values(sectionTraits.querySelectorAll('.feature-name')))
    //list = list.concat(Object.values(sectionTraits.querySelectorAll('.feature-tag')))
    list.forEach(p=>{
        p.setAttribute('contenteditable',true)
    })

    let features=sectionTraits.querySelectorAll('.feature');
    features.forEach(ft=>{
        let inp=ft.querySelector('input')
        if(inp)
            inp.style.display='initial'
        let name=ft.querySelector('.feature-name')
        let text=ft.querySelector('p')
        if(name)
            name.setAttribute('contenteditable',true)
        if(text)
            text.setAttribute('contenteditable',true)
        let tags=ft.querySelectorAll('.feature-tag')
        tags.forEach(tag=>{
            tag.setAttribute('contenteditable',true)
        })
    })

     inspirationButton.style.display='initial';
     let charName=sectionCharacter.querySelector('.section-banner')
     charName.setAttribute('contenteditable',true)

    main.querySelectorAll('.feature-add').forEach(adder=>{
        adder.style.display='block'
    })
    window.scrollTo(0,0)
   
}

function disableEdit(initial) {
    editing = false;
    main.querySelectorAll('.section-group').forEach(dom => {
        dom.classList.add('section-group-mini')
    })
    let tempObj={};


    let doms = main.querySelectorAll('.editable-number')
    doms.forEach(input => {
        input.removeEventListener('touchstart', numberStartAdjust);
        input.removeEventListener('touchmove', numberMoveAdjust);
        input.removeEventListener('touchend', numberEndAdjust);
        input.addEventListener('mouseup', numberClick);
        input.remove();
    })
    let numbers = main.querySelectorAll('.number')
    numbers.forEach(number => {
        number.disabled = true;
    })

    tempObj.traits=[];

    let features=sectionTraits.querySelectorAll('.feature');
    features.forEach(ft=>{
        let obj={};
        let name=ft.querySelector('.feature-name')
        let text=ft.querySelector('p')
        if(!(name || text) || (name.innerText.length==0 && text.innerText.length==0)){
            ft.remove();
        }else{
            obj.name=name.innerText;
            obj.text=text.innerText;
            obj.tags=[];
            let tags=ft.querySelectorAll('.feature-tag')
            tags.forEach(tag=>{
                tag.setAttribute('contenteditable',undefined)
                if(tag.innerText.length>0){
                    obj.tags.push(tag.innerText)
                }else
                    tag.remove();
            })
            let inp=ft.querySelector('input')
            if(inp){
                if(inp.checked ){
                    obj.spell=true;
                    ft.classList.remove('trait')
                    ft.classList.add('spell')
                }else{
                    ft.classList.add('trait')
                    ft.classList.remove('spell')
                }
                inp.style.display='none'
            }
            name.setAttribute('contenteditable',undefined)
            text.setAttribute('contenteditable',undefined)
            tempObj.traits.push(obj)
        }
    })

    ///
    tempObj.personality=[];
    let pers=sectionPersonality.querySelectorAll('p');
    pers.forEach(p=>{
        p.setAttribute('contenteditable',undefined)
        tempObj.personality.push(p.innerText)
    })
    ///
    tempObj.proficiencies=[];
    let pros=sectionOther.querySelectorAll('p');
    pros.forEach(p=>{
        tempObj.proficiencies.push(p.innerText)
    })

    ///
    tempObj.abilities=[]
    let stats=sectionStats.querySelectorAll('.section-item')
    stats.forEach(p=>{
        let nums=p.querySelectorAll('.number')
        tempObj.abilities.push([nums[0].value,nums[1].value])
    })
    tempObj.skills=[]
    let skills=sectionStats.querySelectorAll('.skill-item')
    skills.forEach(p=>{
        tempObj.skills.push(p.querySelector('input').value)
    })

    tempObj.character={}
    let characterName=sectionCharacter.querySelector('.section-banner')
    let characterType=sectionCharacter.querySelector('.character-class')
    let proficiency=sectionCharacter.querySelector('.number')


    if(Drawer.getState()=='character'){
        inspirationButton.click();
    }
    inspirationButton.style.display='none';
    let inspiration=sectionCharacter.querySelector('.character-inspiration').querySelector('img')
    tempObj.character.name=characterName.innerText
    tempObj.character.type=characterType.innerText

    tempObj.character.proficiency=proficiency.value;
    tempObj.character.inspiration=inspiration.src;

    
    ///


    main.querySelectorAll('.feature-add').forEach(adder=>{
        adder.style.display='none'
    })
    window.scrollTo(0,0)
    console.log(tempObj)
    window.tempy=JSON.stringify(tempObj)
    if(!initial){

        Online.updateSheet(currentUser,tempObj)
        updateSheet(currentUser,tempObj)
    }
    return tempObj;
}


function apply(obj){
    let features=sectionTraits.querySelectorAll('.feature');
    features.forEach(ft=>{
        ft.remove();
    })
    obj.traits.forEach(trait=>{
        sectionTraits.insertBefore(makeTrait(trait),traitsAdd)
    })


    let pers=sectionPersonality.querySelectorAll('p');
    pers.forEach((p,i)=>{
        p.innerText=obj.personality[i]
    })
    ///
    let pros=sectionOther.querySelectorAll('p');
    pros.forEach(p=>{
        p.remove();
    })
    obj.proficiencies.forEach(p=>{
        let dom=d('feature');
        dom.innerText=p;
        sectionOther.insertBefore(dom,otherAdd)
    })

    ///
    let stats=sectionStats.querySelectorAll('.section-item')
    stats.forEach((p,i)=>{
        let nums=p.querySelectorAll('.number')
        nums[0].value=obj.abilities[i][0]
        nums[1].value=obj.abilities[i][1]
    })

    let skills=sectionStats.querySelectorAll('.skill-item')
    skills.forEach((p,i)=>{
        p.querySelector('input').value=obj.skills[i]
    })

    let characterName=sectionCharacter.querySelector('.section-banner')
    let characterType=sectionCharacter.querySelector('.character-class')
    let proficiency=sectionCharacter.querySelector('.number')

    let inspiration=sectionCharacter.querySelector('.character-inspiration').querySelector('img')
    characterName.innerText=obj.character.name
    characterType.innerText=obj.character.type
    if(obj.character.proficiency)
        proficiency.value=obj.character.proficiency
    inspiration.src=obj.character.inspiration;
    window.scrollTo(0,0)
}

var simpleAdjuster

function createSimpleAdjuster(parent) {
    let row = d('floater-number-input')
    let down = d('floater-arrow');
    let up = d('floater-arrow');

    up.addEventListener('click', ev => {
        up.style.animationName = ''
        void up.offsetWidth;
        up.style.animationName = 'blinker';
        adjustHost.range[0] = Math.min(adjustHost.range[2], ++adjustHost.range[0])
        adjustTarget.value = adjustHost.range[0]
    })
    down.addEventListener('click', ev => {
        down.style.animationName = ''
        void down.offsetWidth;
        down.style.animationName = 'blinker';
        adjustHost.range[0] = Math.max(adjustHost.range[1], --adjustHost.range[0])
        adjustTarget.value = adjustHost.range[0]
    })
    row.appendChild(up);
    row.appendChild(down);
    row.style.display = 'none';
    simpleAdjuster = row;
    parent.appendChild(simpleAdjuster)
}

function moveSimpleAdjuster(target) {
    simpleAdjuster.style.display = 'block';
    let box = target.getBoundingClientRect();
    simpleAdjuster.style.left = -48 + box.left + 'px'
    simpleAdjuster.style.top = box.top + 'px'
}


function sliderButton(dom) {
    dom.addEventListener('touchmove', ev => {
        let v = ev.touches[0].clientX - ev.target.getBoundingClientRect().left;
        v = Math.max(0, Math.min(v, 96));
        console.log(v)
        ev.target.style.transform = 'translate(' + v + 'px)'
    })
    /**/
}

var adjustTarget;
var adjustHost;
var movingAdjust = { x: 0, y: 0 }

var touchTimeout = false;

function numberStartAdjust(ev) {
    adjustHost = ev.target;
    adjustTarget = ev.target.host
    simpleAdjuster.style.display = 'none';
    movingAdjust = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
    ev.target.className = 'floater-arrow'
    ev.target.range[0] = parseInt(adjustTarget.value);
    setTimeout(function() {
        touchTimeout = true
    }, 200)
    touchTimeout = false;

    //console.log('hi')
}

function numberMoveAdjust(ev) {
    if(movingAdjust) {
        let flip = true;
        //let box=ev.target.getBoundingClientRect()
        let v = ev.touches[0].clientX - (movingAdjust.x);
        let c = 0
        if(v > 24 || v < -24) {
            v = Math.max(-96, Math.min(v, 96));
            if(v < -24) {
                flip = false;
                c = (ev.target.range[1] - ev.target.range[0]) * ((Math.abs(v) - 24) / 72)
            } else {
                c = (ev.target.range[2] - ev.target.range[0]) * ((v - 24) / 72)
            }
        } else
            v = 0;
        console.log(v)

        adjustTarget.value = Math.round(ev.target.range[0] + c);
        ev.target.style.transform = 'translate(' + v + 'px)' + (flip ? ' rotate(180deg)' : '');
    }
}

function numberEndAdjust(ev) {
    movingAdjust = false;
    ev.target.className = 'editable-number'
    ev.target.style.transform = 'translate(0)';
    if(!touchTimeout) {
        moveSimpleAdjuster(ev.target)
    }
}

function numberClick(ev) {
    adjustHost = ev.target;
    adjustTarget = ev.target.host
    ev.target.host.focus();
}

function skillSelect(ev) {
    if(ev.target.classList.contains('skill-item')) {
        if(ev.target.classList.contains('selected')) {
            ev.target.classList.remove('selected')
            ev.target.parentElement.appendChild(ev.target)
        } else {
            ev.target.classList.add('selected')
            let parent = ev.target.parentElement;
            let line = parent.querySelector('.section-dashed-line')
            parent.insertBefore(ev.target, line)
        }

    }
}

function d(c) {
    let dom = document.createElement('div')
    if(c)
        dom.className = c;
    return dom
}

function input(start, end) {
    let num = document.createElement('input');
    num.className = 'number';
    num.value = 0
    num.type = 'number'
    num.min = start;
    num.max = end;
    return num;
}

function makeStatus() {
    let status = main.querySelector('.section-status');
    let armor = d('status-armor')
    let initiative = d('status-initiative')
    let speed = d('status-speed')
    let speedNumber = input(0, 10);
    let armorNumber = input(0, 10);
    let initiNumber = input(0, 10);

    speedNumber.innerText = 10;
    initiNumber.innerText = 10;
    armorNumber.innerText = 10;
    armor.appendChild(armorNumber)
    speed.appendChild(speedNumber)
    initiative.appendChild(initiNumber)


    let row = main.querySelector('.status-row')
    row.appendChild(armor);
    row.appendChild(initiative);
    row.appendChild(speed);


    let hitpoints=sectionStatus.querySelector('.status-hitpoints')
    let num1=input(0,30)
    let num2=input(0,30)
    hitpoints.appendChild(num1)
    hitpoints.appendChild(num2)
    //let hitDice=d('status-dice')
    //status.appendChild(hitDice);
}

function toggleMini(ev) {
    if(editing)
        return;
    let doms = main.querySelectorAll('.section-group')
    doms.forEach(obj => {
        if(ev.target != obj)
            obj.classList.add('section-group-mini')
    })
    if(ev) {

        ev.target.classList.toggle('section-group-mini')
    }
}


/******************/
function applyUsers(data){
    sheets=data

    let nav=main.querySelector('.sheet-nav');
    let ownDom
    PlayerManager.users.forEach(user=>{
        let dom=d('sheet-user')
        dom.style.backgroundColor=user.color;
        let span=document.createElement('span')
        span.innerText=user.username;
        dom.appendChild(span)
        dom.setAttribute('data',user.id)
        dom.addEventListener('click',ev=>{
            let i=parseInt(ev.target.getAttribute('data'))
            let sheet=sheets[i]
            if(sheet){
                
            }else{
                UI.systemMessage('No Sheet available, loading empty','warn',false,1500)
                sheet=JSON.parse(emptySheet)
            }
            apply(sheet)
                window.scrollTo(0,0)
                currentUser=i;
                ev.target.style.animation='';
                void ev.target.offsetWidth;
                ev.target.style.animation='jello 0.4s'

                sheetDom.style.animation='';
                void sheetDom.offsetWidth;
                sheetDom.style.animation='jello 0.4s'

        })
        if(user.id==PlayerManager.getOwnPlayer().id){
            currentUser=user.id;
            ownDom=dom
            let sheet=sheets[user.id]
            if(sheet)
                apply(sheet)
        }else
            nav.appendChild(dom)
    })
    if(ownDom)
        nav.insertBefore(ownDom,nav.firstChild)

}

function updateSheet(id,obj){
    sheets[id]=obj
}
/*
function setSheets(obj){

}*/


















function initSheet() {
    var sheet = document.createElement('style')
    sheet.innerHTML = `
    [contenteditable="true"]:active,
[contenteditable="true"]:focus{
  border:none;
  outline:none;
}

[contenteditable="true"]::before{
    color:#5555;
content:"::";
}
[contenteditable="true"]::after{
    color:#5555;
    text-align: right;
content:"::";
}

[type="checkbox"]{
    margin:0 !important;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type=number] {
    -moz-appearance: textfield;
}


.sheet {
    display: flex;
    position: absolute;
    border-radius: 16px;
    background-color: white;
    box-shadow: 6px 6px 1px #0005;
    margin: 0 32px;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    overflow-y: auto;
    max-height: calc(100% - 200px);
    font-family: openBold;
}
.sub-section{
    display: flex;
    flex: 1;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
}

.section {
    font-size: 16px;
    width: 300px;
    border-radius: 16px;
    background-color: #F5F0E5;
    box-shadow: 6px 6px 1px #0005;
    flex: 3 1 1;
    margin: 16px;
    min-height: 96px;
}
.section *{
    border-radius: 16px;
}
.section-banner{
    text-align: center;
    position: relative;
    font-size: 24px;
    background-color: inherit;
    box-shadow: inherit;
    border-radius: 4px;
    padding: 8px;
    letter-spacing: 6px;
    width: 100%;
    left: 50%;
    border: 6px outset gray;
    border-style: none groove none groove;
    transform: translate(-50%);
}

.section-item {
    height: 32px;
    box-shadow: 6px 6px 1px #0005;
    padding: 16px;
    position: relative;
    background-color: #83D943;
}

.number {
    color: inherit;
    font: inherit;
    width: auto;
    outline: none;
    border: none;
    background-color: transparent;
    padding: 0;
    text-align: center;
    max-width: 64px;
    font-size: 32px;
}



.section-item-label {
    position: absolute;
    left: 16px;
    top: 16px;
}

.STR {
    background-color: #FF1B71 !important;
    color: #8B1944 !important;
}

.DEX {
    background-color: #8BFF36 !important;
    color: #697F1E !important;
}

.CON {
    background-color: #E9EE6A !important;
    color: #76602C !important;
}

.INT {
    background-color: #730FB2 !important;
    color: #FDC3FF !important;
}

.WIS {
    background-color: #FFA81F !important;
    color: #FFFEB6 !important;
}

.CHR {
    background-color: #FFA3A3 !important;
    color: #8800AF !important;
}

.section-item-saving-throw {
    border: white solid 3px;
    width: 64px;
    height: 64px;
    position: absolute;
    right: 0;
    top: 0;
    box-sizing: border-box;
    border-radius: 16px;
    font-size: 24px;
    text-align: center;
    line-height: 24px;
}

.section-item-saving-throw::before {
    line-height: 102px;
    top: -10px;
    color: white;
    font-size: 16px;
    content: 'S.T.'
}

.section-group{
    border-radius: 16px;
    background-color: #5555;
    margin: 16px;

}
 .section-group *{
    pointer-events: none;
}


.section-skills {}
.section-stats {
}
.section-status *{
    margin: 8px;
}
.section-character{

}
.section-traits{

}
.section-personality{

}
.section-other{

}

.skill-item {
    border-radius: 16px;
    height: 24px;
    box-shadow: 6px 6px 1px #0005;
    padding: 8px;
    position: relative;
    background-color: #8DA4EE;
    margin: 16px;
}
.skill-item .number{
    font-size: initial;
}
.skill-item-icon {
    border-radius: 16px 8px 8px 16px;
    width: 40px;
    height: 40px;
    position: absolute;
    top: 0;
    left: -1px;
    background-color: white;
    background-size: 40px;
    background-image: url('./spell.png');
}

.skill-item .number {
    position: absolute;
    right: 32px;
}

.skill-item-label {
    display: inline-block;
    margin-left: 48px;
    content: 'hello'
}

/**********/
.section-group-mini .skill-item{
    width: 64px;
    display: inline-block;
    margin:4px;
}
.section-group-mini .skill-item-label{
    display: none;
}
.section-group-mini .number{
    right:0;
}
/*********/


.feature{
    max-height: 96px;
    overflow-y: scroll;
    background-color: #B6E0D1;
   padding: 1px 16px 16px 16px;
   margin: 8px;
   color: gray;
   position: relative;
}
.feature p{
    margin: 0 16px 0 16px;
    font-family: open;
}

.feature-name{
    font-size: 22px;
    display: inline-block;
    font-style: italic;
    color: black;
    margin: 0 8px 0 8px;
}
.feature-middle{
    font-size: 18px;
    font-style: italic;
    text-align: center;
    color: gray;
}


.feature-tag{
    border-radius: 16px;
    background-color: lightgreen;
    font-weight: bold;
    display: inline-block;
    padding: 0 16px 0 16px;
    box-sizing: border-box;
    border: solid white 2px;
}
.trait{
    background-color: #8BBDEB
}

.spell{
    background-color: #E3C5E3
}

.feature input{
    position: absolute;
    right: 12px;
    top: 12px;

}
.feature input::after{
    color: gray;
    font-size: 10px;
    content: 'spell?';
    position: relative;
    left: -28px;
    top: -6px;
}

.feature-add,.lil-add{
        position: relative;
        width:36px;
        height:36px;
        background-color: #FAFABC;
        border-radius: 28px;
        margin:18px 0 18px 0;
        cursor: pointer;
        pointer-events: auto;
        left: 50%;
        transform: translate(-50%);

        background-image: url("data:image/svg+xml,<svg width='36' height='36' stroke='black' stroke-width='6' stroke-linecap='round' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'><path d='m9 18 h 18M18 9v18'/></svg>");
        
    }
    .lil-add{
        width:24px;
        height:24px;
        background-size: cover;
        left: auto;
        transform: none;
    }


/************/

.floater-number-input {
    position: absolute;
    width: 144px;
    height: 48px;
    /*border:black 3px solid;*/
}

.floater-arrow {
    z-index: 99;
    width: 48px;
    height: 48px;
    border-radius: 24px;
    background-color: #5558;
    position: absolute;
    left: 0;
    top: 0;
    display: inline-block;
    animation: 0.3s;
    background-repeat: no-repeat;
    background-size: 32px;
    background-position: center center;


    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.71 6.71c-.39-.39-1.02-.39-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L10.83 12l3.88-3.88c.39-.39.38-1.03 0-1.41z"/></svg>');

}

.floater-number-input .floater-arrow:nth-child(1) {
    left: 96px;
    transform: rotate(180deg);
}

/*.floater-arrow::after{
            content: '';
            background-color: red;
            width: 16px;
            height: 16px;
            display: block;
            position: absolute;
            left: 48px;
            top: 50%;
            border-radius: 8px;
            transform: translate(0,-50%);
        }

        .floater-arrow::before{
            width: 48px;
            height: 2px;
            border-radius: 8px;
            content: '';
            display: block;
            background-color: green;
            position: absolute;
            left: 24px;
            top: 50%;
            transform: translate(0,-50%);
        }*/

@keyframes blinker {
    0% {
        background-color: #fff6;
    }

    50% {
        background-color: #0004;
    }

    100% {}
}

.editable-number {
    width: 48px;
    height: 48px;
    box-sizing: border-box;
    border-radius: 24px;
    border: #fff7 dotted 3px;
    display: block;
    position: absolute;
    left: 0;
    top: 0;

    overflow: visible;
    transition: 0.1s transform;
}

.editable-number::before {
    content: '';
    width: 24px;
    height: 24px;
    display: block;
    position: absolute;
    left: 32px;
    top: -8px;

    background-repeat: no-repeat;
    background-size: 24px;
    background-position: center center;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>');
}


.selected {

    box-shadow: 12px 6px 0px white;
}

.selected::after {
    content: '';
    right: 0px;
    top: 8px;
    width: 24px;
    height: 24px;
    position: absolute;
    display: block;
    background-position: center center;
    background-size: 24px;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="24" fill="white" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>');
}

.section-dashed-line {
    height: 0;
    margin: 16px;
    border-bottom: 3px dashed black;
    border-radius:0;
}

.centered {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.status-hitpoints{
    height: 64px;
    background-color: #EE9A9A;
    background-position: left center;
    background-repeat: no-repeat;
    background-size: 64px;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="white" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"/></svg>');
}

.status-initiative,.status-armor,.status-speed{
    display: inline-block;
    width:64px;
    height: 64px;
    background-position: center center;
    background-repeat: no-repeat;
}
.status-initiative .number,.status-armor .number,.status-speed .number{
    color: white;
    font-size: 24px;
    position: relative;
}
.status-initiative{
    background-size: 82px;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" fill="rgb(170, 68, 0)" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 17.27l5.17 3.12c.38.23.85-.11.75-.54l-1.37-5.88 4.56-3.95c.33-.29.16-.84-.29-.88l-6.01-.51-2.35-5.54c-.17-.41-.75-.41-.92 0L9.19 8.63l-6.01.51c-.44.04-.62.59-.28.88l4.56 3.95-1.37 5.88c-.1.43.37.77.75.54L12 17.27z"/></svg>');
}
.status-armor{
    background-size: 64px;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" fill="rgb(35, 79, 35)"><g><rect fill="none" height="24" width="24"/><path d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1L12,1z"/></g></svg>'); /*fill="#224E22"     rgb(35, 79, 35)*/
}
.status-speed{
    background-size: 86px;
    background-position: center center;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="24" fill="rgb(30, 70, 178)" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3.5 18.99l11 .01c.67 0 1.27-.33 1.63-.84L20.5 12l-4.37-6.16c-.36-.51-.96-.84-1.63-.84l-11 .01L8.34 12 3.5 18.99z"/></svg>');
}

.status-dice{
    background-color: #8CEB8C;
    height: 64px;
    background-size: 64px;
    background-position: center center;
    background-position: left center;
    background-repeat: no-repeat;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="24" fill="white" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 3h-4.18H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 15h-2v-2h2v2zm0-5c0 .55-.45 1-1 1s-1-.45-1-1V9c0-.55.45-1 1-1s1 .45 1 1v4zm-1-8c-.55"/></svg>');
}
.saving-row{

    position: relative;
    text-align: right;
}

/*************/
.character-picture{
    width:212px;
    height: 256px;
    background-color: #17D1FF;
    display: inline-block;
}
.character-column{
    width:64px;
    display: inline-block;
    position: absolute;

}

.character-proficiency{
    display: inline-block;
    width:64px;
    height: 64px;
    position: relative;
    left: 0;
    top: 0;
    background-color: #ECD4EC;
}
.character-inspiration{
    display: inline-block;
    width:64px;
    height: 64px;
    position: relative;
    right: 0;
    top: 0;
    background-color: #5555;
}
.character-inspiration img{
    width: 100%;
    height: 100%;
}
.character-class{
    display: block;
    margin: 6px;
    position: relative;
    text-align: center;
    font-size: 18px;
    color: gray;
}
/***********************/

.sheet-nav{
    position: relative;
    height: 96px;
    overflow-x: auto;
    overflow-y: hidden;
    width: calc(100% - 88px);
    transform: translate(-50%);
    left: 50%;
    white-space: nowrap;
}
.sheet-user{
    position: relative;
    display: inline-block;
    border-radius: 28px;
    background-color: green;
    height: 56px;
    width: 56px;
    top: 0;
    margin: 8px 8px 0 8px;
}
.sheet-user span{
    border-radius: 16px;
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translate(-50%);
    background-color: #fff5;
    pointer-events: none;
}

.sheet-selected::before{
    position: absolute;
    display: block;
    background-color: white;
    top: -10px;
    height: 112px;
    width: 64px;
    border-radius: 16px;
    content: '';
    z-index: -1;
    left: 50%;
    transform: translate(-50%);
}

#sheet-edit-button{
     position: fixed;
        width:56px;
        height:56px;
        background-color: #FAFABC;
        border-radius: 28px;
        cursor: pointer;
        pointer-events: auto;
        right: 102px;
        bottom: 108px;
        background-size: 48px;
        background-position: center center;
        box-shadow: 6px 6px 1px #0005;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>');
}
#sheet-edit-button.toggled{
    background-color: #16FF16;

    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z"/></svg>');
}`
    document.body.appendChild(sheet)

}


export {init,updateSheet,applyUsers}