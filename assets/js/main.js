// Initate the canvas for the timeline
// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
		  window.webkitRequestAnimationFrame || 
		  window.mozRequestAnimationFrame    || 
		  window.oRequestAnimationFrame      || 
		  window.msRequestAnimationFrame     ||  
		  function( callback ){
			window.setTimeout(callback, 1000 / 60);
		  };
})();

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}

function between(min,max,float)
{
    if(float)
      return Math.random() * (max - min + 1) + min;
    else
      return Math.floor(Math.random()*(max-min+1)+min);
}

function hexToRgb(hex, opacity) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? "rgba("
        + parseInt(result[1], 16) +","
        + parseInt(result[2], 16) +","
        + parseInt(result[3], 16) + "," + opacity + ")"
     : null;
}

var canvas = document.getElementById("canvas");

// Initialize the context of the canvas
var ctx = canvas.getContext("2d");

// Set the canvas width and height to occupy full window
var W = window.innerWidth-20, 
    H = 320;

canvas.width = W;
canvas.height = H;

var lineCount = 20,
    lineSpacing = 15,
    dotCount = 1,
	dots = [],
    dotSpacing = 15,
    lines = [];

function Line(positionY){
  this.dots = [];
  this.width = 600;
  this.height = 10;
  this.x = 0;
  this.y = positionY;
  
  this.pushDot = function(width, color, data){
      this.dots.push(new Dot(this.x - ( i * 15 ), positionY, width, color, data));
  }
  
  this.destroyDot = function(i){
      if(this.dots[i].x >= canvas.width){
        this.dots.splice(i, 1);
      }
  }
  
  this.drawDots = function(){
    for(var i=0; i<this.dots.length; i++){
      this.dots[i].draw();
    }
  }
  
  this.moveDots = function(){
    for(var i = 0; i < this.dots.length; i++){
      this.dots[i].move();
      this.destroyDot(i);
    }
  }
  
}

// Dot object which will inherit it's position from the parent line
function Dot(x, y, width, color, data) {

  this.width = width;
  this.height = 10;
  this.opacity = 1;
	this.x = x;
	this.y = y;  
	this.vx = 1;
  this.direction = "right";
  this.color = color;

  //Tx data
  this.data = data;

}

Dot.prototype.draw = function(){
  
  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.rect(this.x, this.y, this.width, this.height);
  ctx.fill();
  ctx.closePath();
  
}

Dot.prototype.move = function(){
  
  if(this.direction == "left")
      this.moveLeft();
  else if(this.direction == "right")
      this.moveRight();
}

Dot.prototype.moveLeft = function(){
  
  this.x += -this.vx;
    
  if(this.x <= this.vx)
    this.x += this.vx;
  
}

Dot.prototype.moveRight = function(){
  this.x += this.vx * 1;
}

// Create Lines
for(var i = 0; i < lineCount; i++){
    lines.push(new Line(i * lineSpacing + 10));
}

canvas.addEventListener("mousedown", selectTx, false);
function selectTx(event) {
	var rect = canvas.getBoundingClientRect();
	click_x = event.clientX - rect.left;
	click_y = event.clientY - rect.top;

	//console.log("CLICK: (" + click_x + ", " + click_y +")");

	for(var l = 0; l < lineCount; l++) {
		var allDots = lines[l].dots;
		for(var d = 0; d < allDots.length; d++) {
		    var rect = allDots[d];
		    if ( click_x >= rect.x && click_x <= rect.x + rect.width
		    &&   click_y >= rect.y && click_y <= rect.y + rect.height ) {
		        setTxInfo(allDots[d].data);
		    }
		}
	}
}

function setTxInfo(data) {
	var value = 0;
	var outputs = data.x.out;
	for (i = 0; i < outputs.length; ++i) {
	    value += outputs[i].value;
	}

	value = value/100000000;
	$("#selectedTx").html('Size: <span class="normal">'+ data.x.size.toString() +' bytes</span><br>Total outputs: <span class="normal">'+ value.toString() +' BTC</span><br>Time: <span class="normal">' + $.format.date(data.x.time*1000, "HH:mm dd/MM/yyyy") + '</span><br><a href="https://blockchain.info/tx/'+ data.x.hash +'">Open in blockchain.info</a>');
}


(function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < lines.length; i++){
      lines[i].drawDots();
      lines[i].moveDots(); 
    }
     
    requestAnimFrame(loop);
})();

// Setup the clock
var clock = {
	timestamp: 0,

	clocktime: {},

  	dots: document.querySelectorAll('#lcd-clock .dots'),
	
  	dotsState: false,
	
  	updateClock: function (){

  		var current = new Date();
  		var last_block = new Date(clock.timestamp*1000);

  		var difference = Math.floor((current.getTime() - last_block.getTime())/1000);

  		clock.clocktime.hour   = Math.floor(difference / 3600);
  		difference = difference % 3600;
		clock.clocktime.minute = Math.floor(difference / 60);
		clock.clocktime.second = Math.floor(difference % 60);

		for (var timeUnit in clock.clocktime) {
			// convert all to values to string,
			// pad single values, ie 8 to 08
	 		// split the values into an array of single characters
			clock.clocktime[timeUnit] = clock.clocktime[timeUnit].toString();
			if (clock.clocktime[timeUnit].length == 1) {
				clock.clocktime[timeUnit] = '0'+clock.clocktime[timeUnit];
			}
			clock.clocktime[timeUnit] = clock.clocktime[timeUnit].split('');

			// update each digit for this time unit
			for (var i=0; i<2; i++) {
				var selector = '#lcd-clock .'+timeUnit+'.digit-'+(i+1);
				var className = 'number-is-'+clock.clocktime[timeUnit][i];
				// remove any pre-existing classname
				for (var j=0; j<10; j++) {
					var oldClass = 'number-is-'+j;
					document.querySelector(selector).classList.remove(oldClass);
				}
				// add the relevant classname to the appropriate clock digit
				document.querySelector(selector).classList.add(className);
			}

		}
		clock.toggleDots();
	},

	toggleDots: function(){

		var num_dots = clock.dots.length;

		for (var i=0; i < num_dots; i++) {
			if (clock.dotsState === false) {
				clock.dots[i].classList.add('lcd-element-active');
				continue;
			} else {
				clock.dots[i].classList.remove('lcd-element-active');
			}
		}

		clock.dotsState = !clock.dotsState;

	},

	init: function(ts){
		clock.timestamp = ts;

		clock.toggleDots();
		clock.updateClock();
		setInterval(clock.updateClock, 500);

	}

};

function newBlockIndicator() {
	$("body").toggleClass("inv");
}

// Connect to the socket and display data
// Value in satoshis
function getColorForTransactionValue(value) {
	var btc = value / 100000000;
	if(btc < 0.1) return hexToRgb("#A7FCA9", 1);
	else if(btc < 0.25) return hexToRgb("#85FF89", 1);
	else if(btc < 0.5) return hexToRgb("#4FFF55", 1);
	else if(btc < 1) return hexToRgb("#AAFF4F", 1);
	else if(btc < 3) return hexToRgb("#F6FF4F", 1);
	else if(btc < 5) return hexToRgb("#FFBE4F", 1);
	else return hexToRgb("#FF4F4F", 1);
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var sock = new WebSocket('wss://ws.blockchain.info/inv');;
var firstFlag = true;


sock.onopen = function() {
	sock.send('{"op":"unconfirmed_sub"}');
	sock.send('{"op":"blocks_sub"}');
	sock.send('{"op":"ping_block"}');
};
sock.onmessage = function(e) {
	var data = JSON.parse(e.data);
	if(data.op == "utx") {
		var value = 0; // transaction output value container
		var outputs = data.x.out;
		for (i = 0; i < outputs.length; ++i) {
		    value += outputs[i].value;
		}

		var w = 10+Math.round((value)/10000000);
		if(w > 100) w = 100;

		//console.log("Width: " + w + " Value:" + value + " Color:" + getColorForTransactionValue(value));

		lines[getRandomInt(0, lineCount-1)].pushDot(w, getColorForTransactionValue(value), data);
		//console.log("ping");
	}
	else if(data.op = "block") {
		clock.init(data.x.time);
		$("#lblock-btcsent").html(data.x.totalBTCSent/100000000);
		$("#lblock-txnum").html(data.x.nTx);
		$("#lblock-reward").html(data.x.reward/100000000);
		$("#lblock-time").html($.format.date(data.x.time*1000, "HH:mm dd/MM/yyyy"));

		if(!firstFlag) {
			$("#newBlockAudio")[0].play();
			newBlockIndicator();
			setTimeout(newBlockIndicator,3500);
		}
		else firstFlag = false;
	}
};
sock.onclose = function() {
	
}