const baseURL = 'http://localhost:10001'
let points_X = [];
let points_Y = [];
let points_length_temp = 0;
let points_length = 0;

let firstDraw = false;

let counter = 0;
let isDrawing = false;

let isEnding = false;

let button_save;
let isSaved = false;


var cnv;

var chaoticLevel = 0
var sketches_length = 0


async function requestt(path) {
	const response = await fetch(`${baseURL}/${path}`)
	return await response.json()
}

async function setup() {
	frameRate(100);
	createCanvas(displayWidth, displayHeight);
	//cnv = createCanvas(600, 600);
	//cnv.parent('draw_sketch');
	//background(255);
	//clear();
	background(0);
	textAlign(CENTER, CENTER);
	textSize(40);
	loadSketches();
}

async function loadSketches() {
	const sketches = await requestt('sketches')
	sketches_length = sketches.length
	return sketches
}
async function fetch_one_sketch() {
	var sketches = await loadSketches();
	var rng = floor(random(sketches_length))
	const response = await fetch(`/data/${sketches[rng]}`);
	const randomSketch = await response.json()
	console.log(Object.keys(randomSketch))
	return randomSketch
}

function mouseDragged() {
	//button_save.hide();

	if (!isSaved) {

		//first stroke of drawing
		firstDraw = true;

		isEnding = false;
		counter_ending = 0;

		if (isDrawing == false) {
      clear();
			showEnd = 0;
			//background(255);
			clear();
			points_length_temp = 0;
			isDrawing = true;
			counter = 0;
			points_X.splice(0, points_length);
			points_Y.splice(0, points_length);
		}
		var now_x = mouseX / width;
		var now_y = mouseY / height;
		points_X.push(mouseX / width);
		points_Y.push(mouseY / height);
		stroke(0);
		strokeWeight(2);
		if (points_length_temp > 0)
			line(
				points_X[points_length_temp - 1] * width,
				points_Y[points_length_temp - 1] * height,
				now_x * width,
				now_y * height
			);
		points_length_temp++;
	}
	rectMode(CENTER);
	noFill();
	strokeWeight(1);
	stroke(0);
	/* rect(width/2,height/2,width*0.9,height*0.9); */
}

function mouseReleased() {
	//background(255);
	clear();
	returnLogoSketches()

	isDrawing = false;
	points_length = points_length_temp;

	points_length_temp = 0;
	counter = 0;
}

var randomSketch;
var isDrawingSketches = false;
var counter_sketch = 0
var sketch_length = 0;
var sketch_pos_x;
var sketch_pos_y;
async function draw() {

  if (isDrawing == false) {
    clear();
	if (isDrawingSketches == false) {
		randomSketch = await fetch_one_sketch();
		sketch_length = randomSketch.length;
		isDrawingSketches = true;
		sketch_pos_x = randomSketch.x;
		sketch_pos_y = randomSketch.y;
    console.log(randomSketch);
    counter_sketch = 0;
	} else {
		const length = randomSketch;
		counter_sketch += 1;
    console.log(counter_sketch)
		if (counter_sketch > sketch_length - 1) {
			isDrawingSketches = false;
      counter_sketch = 0;
		} else {
			for (var i = 1; i < counter_sketch; i++) {
				line(
					sketch_pos_x[i - 1] * width,
					sketch_pos_y[i - 1] * height,
					sketch_pos_x[i] * width,
					sketch_pos_y[i] * height
				);
			}
		}
	}}

}

// Repeat the user drawing.
function repeatDrawing() {

	if (isDrawing == false) {
		//background(255);
		clear();
		strokeWeight(2);

		counter += 1;
		for (var i = 1; i < counter; i++) {
			line(
				points_X[i - 1] * width,
				points_Y[i - 1] * height,
				points_X[i] * width,
				points_Y[i] * height
			);
		}
		if (counter == points_length - 1) {
			isEnding = true;
			//counter = 0
		}
	}


}

function return_ChaoticLevel() {
	var l = points_X.length;
	var slopes = [];
	for (var i = 1; i < points_X.length; i++) {
		var x1 = points_X[i - 1];
		var y1 = points_Y[i - 1];
		var x2 = points_X[i];
		var y2 = points_Y[i];
		//console.log(atan2(y2-y1,x2-x1));
		append(slopes, atan2(y2 - y1, x2 - x1));
	}
	console.log("slopes  " + slopes);
	slopes_delta = [];

	//all delta slope
	for (var i = 1; i < slopes.length; i++) {
		append(slopes_delta, slopes[i] - slopes[i - 1]);
	}

	console.log("slopes_delta  " + slopes_delta);
	total_slope_delta = 0.0
	for (var i = 0; i < slopes_delta.length; i++) {
		total_slope_delta += slopes_delta[i];
	}
	console.log("total_slope_delta  " + total_slope_delta);
	console.log("answer  " + total_slope_delta / slopes_delta.length);

	return ((total_slope_delta / slopes_delta.length * 100))

}

async function upload(content) {
	const response = await fetch(`${baseURL}/sketch`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(content)
	});
	const json = await response.json();
}

function returnLogoSketches() {

	console.log("save sketch");
	_chaoticLevel = return_ChaoticLevel();

	upload({
		length: points_X.length,
		x: points_X,
		y: points_Y,
		chaoticLevel: _chaoticLevel,
	})

	// isSaved = true;
	// var y = str(year());
	// var d = str(day());
	// var h = str(hour());
	// var m = str(minute());
	// var s = str(second());
	// let writer = createWriter(y+d+h+m+s+'.txt');
	//
	// writer.write(points_X);
	// writer.write(" ");
	// writer.write(points_Y);
	// writer.close();
}

/* function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
}

function windowResized() {
  centerCanvas();
} */
