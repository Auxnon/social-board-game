import * as Render from "./Render.js";
import * as Environment from "./Environment.js";
import * as AssetManager from "./AssetManager.js";

function init(){
	if(window.location.search.length) {
        let params = new URLSearchParams(window.location.search);
        let id = params.get('fammies');
        if(id!=null) {


            return false;
        }
    }
	return true;
}
let chicken;
let hedgehog;

function initFammies(){
	Environment.setLight(1)
	let plane=Render.plane(10,10,0xFF8486);
	Render.addModel(plane)
	hedgehog=AssetManager.make('hedgehog')
	chicken=AssetManager.make('chicken')
	Render.addModel(hedgehog)


}

export{init,initFammies}