/*
<div class="list">
	<div class="list-item"><span>Hello</span>
		<div id="login-junk">
			
		</div></div>
</div>*/
import * as Online from "./Online.js";

var input

function init() {
    initSheet();

    let login=document.querySelector('#login-junk')
    login.style.display='none'
    let list = document.createElement('div');
    list.className='list'

    //let login = document.createElement('div')
    //login.id = 'login-junk'
    //
	input=login.querySelector('input')
    //let input = document.createElement('input')
    //input.setAttribute('type', 'password')
    //input.setAttribute('size', '4')
    //input.setAttribute('maxlength', '4')
    //login.appendChild(input)

    makeNum(login)
    let loginMenu=document.querySelector('#login-menu')
    loginMenu.appendChild(list)
    loginMenu.appendChild(login)



    for(let i = 0; i < 20; i++) {
        let dom = document.createElement('div');
        dom.className = 'list-item';
        let color = getRandomColor();
        dom.style.backgroundColor = color;
        let bool = testBW(hexToRGB(color))

        dom.style.color = bool ? '#000000' : '#FFFFFF';
        dom.style.textShadow = '1px 1px 2px ' + (bool ? '#FFFFFF' : '#000000');


        dom.addEventListener('click', ev => {
            let login = document.querySelector('#login-junk')
            login.style.display=''
            login.parentElement.classList.remove('bigger-item')
            dom.appendChild(login)
            dom.classList.add('bigger-item')
            ev.stopPropagation();
        })

        let port = document.createElement('div');
        port.className = 'list-portrait';
        dom.appendChild(port)

        let span = document.createElement('span');
        span.innerText = text();
        dom.appendChild(span)
        list.appendChild(dom);
    }
}

function text() {
    let r = Math.random() * 32;
    let st = ''
    for(let i = 0; i < r; i++) {
        st += Math.random() > 0.2 ? String.fromCharCode(110 + Math.random() * 6) : ' ';
    }
    return st;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#'; //Math.random()>0.3?0x66B136:0x76610E;
    for(var i = 0; i < 6; i++) {
        let val;
        /*if(i<2)
            val=(Math.random() * 4)+4
        else if(i<4)
            val=(Math.random() * 6)+7
        else*/
        val = Math.random() * 16

        color += letters[Math.floor(val)];
    }

    i
    return color //parseInt(color);
}

function hexToRGB(h) {

    if(h.startsWith('0x'))
        h = h.substring(1)
    let r = 0,
        g = 0,
        b = 0;

    // 3 digits
    if(h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

        // 6 digits
    } else if(h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }
    let ar = [parseInt(r), parseInt(g), parseInt(b)]

    return ar;
}

function testBW(rgb) {
    // http://stackoverflow.com/a/3943023/112731
    let val = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114)
    console.log(val)
    return val > 186


}

function makeNum(ele) {
    let row = document.createElement('div');
    row.className = 'num-row'

    for(let i = 1; i <= 10; i++) {
        let item = document.createElement('div')
        item.innerText = i == 10 ? 0 : i;
        item.className = 'num'
        row.appendChild(item)
        item.addEventListener('click', ev => {
        	ev.stopPropagation();
            if(input.value.length < 4)
                input.value += ev.target.innerText
        })
        // if(i%3==0){
        // 	row=document.createElement('div');
        // }
    }
    let del = document.createElement('div')
    del.className = 'num'
    del.innerText = 'C'
    del.addEventListener('click', ev => {
    	ev.stopPropagation();
        input.value = ''
    })
    row.appendChild(del)

    let go = document.createElement('div')
    go.className = 'num'
    go.innerText = 'Go'
    go.style.backgroundColor = '#fff5';
    go.addEventListener('click', ev => {
    	ev.stopPropagation();
    	let span=ev.target.parentElement.parentElement.parentElement.querySelector('span')
    	if(span){
    		console.log('login with ',span.innerText,':',input.value)
    		Online.login(span.innerText,input.value)
    	}
    })
    row.appendChild(go)


    ele.appendChild(row)
}



function initSheet() {

    var sheet = document.createElement('style')
    sheet.innerHTML = `
		.list-item{
			border-radius: 16px;
			background-color: white;
			box-shadow: 6px 16px 1px #0005;
			max-width: calc(100% - 128px);
			transform: translate(-50%,0);// rotate3d(1,0,0,0deg);
			margin: 32px 0 16px 0;
			position: relative;
			padding: 16px;
			left: 50%;
			font-weight: bold;
			font-size: 2em;
			text-shadow: 1px 1px 2px black;
			text-align: center;
			font-family: 'foont', serif;
			transition: 0.2s transform;

		}
		.list-item span{
			margin: 32px 0 32px 0;
		}
		.list-item:hover{
			transform: translate(-50%,0) scale(1.1,1.1);// rotate3d(1,0,0,0deg);

		}
		.list{
			width: 100%;
			height: 100%;
			position: absolute;
			overflow: scroll;
		}
		.list-portrait{
			left: 8px;
			top: 8px;
			position: absolute;
			display: inline-block;
			width: 64px;
			height: 64px;
			border-radius: 32px;
			background-color: white;
			box-shadow: 6px 16px 1px #0005;
			overflow: hidden;
			box-sizing: border-box;
			border: white solid 6px;
			transform: translate(-50%,-50%);
			transition: left 0.4s;
		}
		.bigger-item .list-portrait{
			left: 50% !important;
			top: 0px !important;
		}
		.login-popin{
			position: fixed;
			border-radius: 16px;
			background-color: white;
			box-shadow: 6px 16px 1px #0005;
		}
		#login-junk{
			max-width: 500px;
			height: 300px;
			transform: translate(-50%,0);
			position: relative;
			left: 50%;
		}
		.num{
			margin-left: 0 !important;
			border-radius: 28px;
			font-size: 36px;
			background-color: #0005;
			width: 56px;
			height: 56px;
			display: inline-block;
			overflow: hidden;
			cursor: pointer;
		}
		.num-row{
			width: 168px;
			height: 168px;
			position: absolute;
			left: 50%;
			transform: translate(-50%,0);
		}
		input{
			text-align: center;
			font-size: 16px;
			outline: none;
			border: none;
			border-bottom: black 6px solid;
			margin: 16px;
			background-color: transparent;
			color: inherit;
		}
		`
    document.body.appendChild(sheet);
}



export { init }