

function hexToRGB(h) {
	if(h.startsWith('0x'))
		h=h.substring(1)
  let r = 0, g = 0, b = 0;

  // 3 digits
  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

  // 6 digits
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }
  let ar=[parseInt(r),parseInt(g),parseInt(b)]
  
  return ar;
}
function hexToRGBFloat(h){
	let ar=hexToRGB(h);
	return ar.map(v=>{return v/256.0})
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function rgbFloatToHex(r,g,b){
	r=Math.floor(r*256);
	g=Math.floor(g*256);
	b=Math.floor(b*256);
	return rgbToHex(r,g,b)
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '';//Math.random()>0.3?0x66B136:0x76610E;
  for (var i = 0; i < 6; i++) {
    let val;
    /*if(i<2)
        val=(Math.random() * 4)+4
    else if(i<4)
        val=(Math.random() * 6)+7
    else*/
        val=Math.random() * 16

    color += letters[Math.floor(val)];
  }
  return parseInt(color);
}

export {rgbToHex,rgbFloatToHex, hexToRGB, hexToRGBFloat,getRandomColor}