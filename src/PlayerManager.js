
var users;
var ownPlayer;


function init(data){
	users=[];
	data.forEach(user=>{
		users[user.id]=user;
	})
}
function getUser(id){
	return users[id]
}

function getOwnPlayer(){
	return ownPlayer;
}
function setOwnPlayer(id){

	ownPlayer=users[id];
	if(!ownPlayer)
		throw new Error("player doesn't exist")
}
function getOwnColor(){
	return parseInt('0x'+ownPlayer.color.substring(1))
}

export {init,getUser,getOwnPlayer,setOwnPlayer,getOwnColor}