import * as Render from "./Render.js";
import * as Control from "./Control.js";
import * as Online from "./Online.js";

//import * as Mail from "./Mail.js";

var chatPane;
var chatBlock;
var chatInput;



function init(){
	let mainDom=document.querySelector('#chatCard');
	let chatButton=document.createElement('div');
	chatButton.classList.add('chatButton','menuHidable');

	chatBlock=document.createElement('div');
	chatBlock.classList.add('chatBlock');

	chatPane=document.createElement('div');
	chatPane.classList.add('chatPane');

	mainDom.appendChild(chatButton);
	chatBlock.appendChild(chatPane);
	mainDom.appendChild(chatBlock);
	


	let bottom=document.createElement('div');
	bottom.classList.add('chatBottom');

	chatInput=document.createElement('input');
	let color="0xffff55";//World.getOwnPlayer().color
	color='#'+color.substring(2,color.length);
	chatInput.style.border=color+" 6px solid"
	bottom.appendChild(chatInput);

	let toggle=document.createElement('div');
	toggle.classList.add('chatToggle');
	bottom.appendChild(toggle);

	chatBlock.appendChild(bottom)

	chatBlock.style.left='100%';

	

	chatButton.addEventListener('click',function(ev){
		Control.addConfetti(window.innerWidth-30,window.innerHeight-30,225);
		openChat();
	})
	chatPane.addEventListener('click',function(ev){
		closeChat();
	})

	chatInput.addEventListener('keyup',function(ev){
		if(ev.which==13){
			if(chatInput.value.length>0){
				//World.socket.emit('chat',World.getOwnPlayer().id,chatInput.value);
				Online.message(chatInput.value)
				chatInput.value=''
			}else{
				setTimeout(closeChat,20);
			}
			
		}else if(ev.which==27){
			closeChat();
		}
	});
	toggle.addEventListener('click',function(ev){
		if(toggle.classList.contains('chatToggle')){
			toggle.classList.remove('chatToggle');
			toggle.classList.add('mailToggle');
		}else{
			toggle.classList.remove('mailToggle');
			toggle.classList.add('chatToggle');
		}

	})

	//s
    //World.socket.on('chat', chatHook);

    /////LETTERS


    let letterPane=document.createElement('div');
    letterPane.classList.add('letterPane');

    //setTimeout(()=>{Mail.init()},800);
    
}
var pastDom=null;
var pastPlayerId=-1;
var lastDom=null;
var lastPlayerId=-1
function addBubble(s,player,color,model){
	

	let chatBubble=document.createElement('p');
	
	chatBubble.style.border=color+' solid 6px'
	let stt=s.split('');
	stt.forEach((c,i)=>{
		let sp=document.createElement('span');
		sp.style.animationDelay=(i*0.03 +Math.random()/10)+'s';
		sp.innerHTML=c;
		if(c==' ')
			sp.innerHTML='&nbsp'
		chatBubble.appendChild(sp)
	})
	setTimeout(function(){
		chatBubble.innerHTML=s;
	},(s.length*0.03+2)*1000)
	if(model){
		chatBubble.classList.add('chatWorldBubble');
		let projection=document.querySelector('#projection');
		
		projection.appendChild(chatBubble);
		let anchor=Render.addAnchor(model,chatBubble);
		Control.addConfetti(anchor.x,anchor.y,Math.floor(Math.random()*360));
		Control.addConfetti(anchor.x,anchor.y,Math.floor(Math.random()*360));
		//Render.schedule(player,"shake")
		return anchor;

	}else{
		let chatRow=document.createElement('div');
		chatRow.classList.add('chatRow')

		/*if(player.id==World.getOwnPlayer().id)
			chatRow.style.textAlign= 'right';*/

		chatBubble.classList.add('chatBubble');
		if(lastPlayerId>=0 && lastPlayerId==player.id){
			if(pastPlayerId==player.id){
				lastDom.classList.remove("chatBubbleFooter");
				lastDom.classList.add("chatBubbleBody");
			}else{
				lastDom.classList.add("chatBubbleHeader");
			}
			//lastDom.classList.remove("chatBubbleHeader","chatBubbleBody")
			
			chatBubble.classList.add("chatBubbleFooter");
		}else{
			let nameTag=document.createElement('p');
			nameTag.classList.add('chatNameTag');
			nameTag.innerHTML=player.name;
			let tagRow=document.createElement('div');
			//if(player.id==World.getOwnPlayer().id)
			//	tagRow.style.textAlign='right'
			nameTag.style.background=color;
			tagRow.appendChild(nameTag);
			chatPane.appendChild(tagRow);
		}

		pastDom=lastDom;
		pastPlayerId=lastPlayerId;
		lastDom=chatBubble;
		lastPlayerId=player.id;

		
		chatRow.appendChild(chatBubble)
		chatPane.appendChild(chatRow)
		chatPane.scrollTop = chatPane.scrollHeight;

		return chatBubble;
	}
	
}
function hook(id,message){
	let player=id//World.getPlayer(id);
	let color='black'
	/*if(player){ //TODO
		color=player.color;
		color='#'+color.substring(2,color.length);

		

		
		let anchor=addBubble(message,player,color,player.model);
		setTimeout(function(){
			anchor.bubble.remove();
			anchor.bubble=null;
		},8000)
	}*/
	//if(!Control.isMenuLocked())
	//	Control.addConfetti(window.innerWidth-30,window.innerHeight-30,225);

	addBubble(message,{id:id},color);
}
function openChat(){
	if(!Control.isMenuLocked()){
		chatBlock.style.left='0%';
		//addBubble('test text for great prosperity','red');
		chatInput.focus();
		Control.lockMenu(true);
	}
	
}
function closeChat(){
	chatBlock.style.left='100%';
	chatInput.blur();
	Control.lockMenu(false);
}

export {init,openChat,closeChat,hook}
