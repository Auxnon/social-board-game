
import * as HexManager from "./HexManager.js";
import * as Environment from "./Environment.js";

let settings;
function init() {
	settings=document.querySelector('.settingsPane')
    addButton('Toggle Hex Grid Lines', HexManager.setGrid);
    addButton('Toggle Light Helper', Environment.setLightHelper);
    addButton('Toggle Physics Mesh Helper', Render.togglePhysicsDebugger);

}


function addButton(text, callback, reference, possibleValues) {
    let row = document.createElement('div')
    let button = document.createElement('div');
    button.classList.add('switch');
    let defaultState;
    if(reference) {
        defaultState = settingsObject[reference];
    }

    if(possibleValues) { //not boolean
        if(defaultState != possibleValues[0]) {
            if(defaultState != possibleValues[possibleValues.length - 1]) {
                button.classList.add('switchHalf');
            } else {
                button.classList.add('switchOn');
            }
        }
        button.setAttribute("value", defaultState);
        let index = 0;
        for(let ii = 0; ii < possibleValues.length; ii++) {
            if(possibleValues[ii] == defaultState) {
                index = ii;
            }
        }
        button.setAttribute("index", index);
        button.addEventListener('click', function(ev) {
            ev.stopPropagation();
            let i = button.getAttribute("index");
            i++;
            if(i >= possibleValues.length) {
                i = 0;
            }
            if(i == 0) {
                button.classList.remove('switchOn');
            } else if(i == possibleValues.length - 1) {
                button.classList.remove('switchHalf');
                button.classList.add('switchOn');
            } else {
                button.classList.add('switchHalf');
            }
            let val = possibleValues[i];
            button.setAttribute("value", val);
            button.setAttribute("index", i);
            callback(val);
            updateSettings(reference, val)

            /*
            if(!button.classList.contains('switchOn')){
            	button.classList.add('switchOn')
            	callback(true);
            	updateSettings(reference,true)
            }else{
            	button.classList.remove('switchOn')
            	callback(false);
            	updateSettings(reference,false)
            }*/
        });
    } else { //boolean
        if(defaultState)
            button.classList.add('switchOn');

        button.addEventListener('click', function(ev) {
            ev.stopPropagation();
            if(!button.classList.contains('switchOn')) {
                button.classList.add('switchOn')
                callback(true);
                updateSettings(reference, true)
            } else {
                button.classList.remove('switchOn')
                callback(false);
                updateSettings(reference, false)
            }
        })
    }




    row.appendChild(button);

    let label = document.createElement('span');
    label.innerHTML = text;
    row.appendChild(label);
    settings.appendChild(row);
    callback(defaultState)
}

function updateSetings(){
    
}


export {init}