
// Constants
var CANVAS_HEIGHT = 500;
var CANVAS_WIDTH = 1000;

var BOX_HEIGHT = 10;
var BOX_WIDTH = 10;

var BOARD_ROWS = CANVAS_HEIGHT / BOX_HEIGHT;
var BOARD_COLUMNS = CANVAS_WIDTH / BOX_WIDTH;

var EMPTY_BOX = 0;
var SNAKE_BOX = 1;
var OBSTICLE_BOX = 2;
var FOOD_BOX = 3;

var SNAKE_START_LENGTH = 5;
var SNAKE_START_ROW = BOARD_ROWS / 2;
var SNAKE_START_COLUMN = BOARD_COLUMNS / 2;
var SNAKE_START_SPEED = 4;
var SNAKE_SIZE_INCREASE_FACTOR = 5;

var FPS = 60;

var DIRECTION_UP = 0;
var DIRECTION_DOWN = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 3;

var SCORE_LOCATION_X = CANVAS_WIDTH - 100;
var SCORE_LOCATION_Y = 20;

// End Constants

var ctx = null;  // Holds the Drawing Context
var board = []; // Holds the Drawing Board

var direction = DIRECTION_LEFT; // Current Direction of the Snake
var speedCalc = 0; // This variable is used to Skip Frames
var speed = SNAKE_START_SPEED; // This variable holds the current speed

var foodPosition = null;
var score = 0;

var snake = {
	queue: [],
	size: SNAKE_START_LENGTH,

	add: function(position) {

		this.queue.push(position);

		if (this.length() > this.size) {
			return this.remove();	
		} else {
			return null;
		}
	},

	remove: function() {
		return this.queue.shift();
	},

	length: function() {
		return this.queue.length;
	},

	head: function() {
		return this.queue[this.length() - 1];
	},

	headX: function() {
		return this.head()[1];
	},

	headY: function() {
		return this.head()[0];
	},

	contains: function(lst) {
		var row = lst[0];
		var column = lst[1];
		
		for (var i = 0; i < this.queue.length; i++) {
			if (this.queue[i][0] == row && this.queue[i][1] == column)
				return true;
		} 

		return false;
	}
};


// On Load
$(function() {

	//console.log(arr.length >= SNAKE_START_LENGTH);
	// Set Width and Height of Canvas
	$('#canvas').css({'border-style': 'solid'})

	ctx = $('#canvas').get(0).getContext('2d');

	// Initialize Board
	initialize();

	// Main game loop
	setInterval(function() {
		update();
		draw();
	}, 1000/FPS);
	
	$(document).bind("keydown", "left", function() {
		if (direction != DIRECTION_LEFT && direction != DIRECTION_RIGHT) {
			direction = DIRECTION_LEFT;
		}
	});

	$(document).bind("keydown", "right", function() {
		if (direction != DIRECTION_LEFT && direction != DIRECTION_RIGHT) {
			direction = DIRECTION_RIGHT;
		}
	});

	$(document).bind("keydown", "up", function() {
		if (direction != DIRECTION_UP && direction != DIRECTION_DOWN) {
			direction = DIRECTION_UP;
		}
	});

	$(document).bind("keydown", "down", function() {
		if (direction != DIRECTION_UP && direction != DIRECTION_DOWN) {
			direction = DIRECTION_DOWN;
		}
	});
});


function initialize() {

	// Set initial values
	direction = DIRECTION_LEFT;
	speedCalc = 0;
	speed = SNAKE_START_SPEED;

	foodPosition = null;	
	score = 0;

	snake.queue = [];
	snake.size = SNAKE_START_LENGTH;

	board = [];

	// Initialize Empty Board
	for (var row = 0; row < BOARD_ROWS; row++) {
		var rowArray = [];
		for (var column = 0; column < BOARD_COLUMNS; column++) {
			rowArray.push(EMPTY_BOX);
		}

		board.push(rowArray);
	} 

	// Draw Snake on Board
	for (var columnShift = SNAKE_START_LENGTH - 1; columnShift >= 0; columnShift--) {
		board[SNAKE_START_ROW][SNAKE_START_COLUMN + columnShift] = SNAKE_BOX;
		snake.add([SNAKE_START_ROW, SNAKE_START_COLUMN + columnShift]);
	}

	// Create Random Food
	createRandomFood();
}


// This function draws the board
function draw() {

	// Clear Rect
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	// Draw Items
	for (var row = 0; row < BOARD_ROWS; row++) {
		var rowArray = board[row];
		for (var column = 0; column < BOARD_COLUMNS; column++) {

			var coord = getCoordsOfBox(row, column);
			
			if (rowArray[column] == EMPTY_BOX) {
				//ctx.fillStyle = "#000";
			} else if (rowArray[column] == SNAKE_BOX) {
				ctx.fillStyle = "#0F0";
				ctx.fillRect(coord.x, coord.y, BOX_WIDTH, BOX_HEIGHT);
			} else if (rowArray[column] == FOOD_BOX) {
				ctx.fillStyle = "#F00";
				ctx.fillRect(coord.x, coord.y, BOX_WIDTH, BOX_HEIGHT);
			}
		}
	}

	// Draw Score
	ctx.fillStyle = "#00F";
	ctx.font = 'italic 15pt Calibri';
	ctx.fillText("Score : " + score, SCORE_LOCATION_X, SCORE_LOCATION_Y)
}

// This function takes the coordinates of the board and draws a box
function getCoordsOfBox(row, column) {
	var coord = new Object();
	coord.x = column * BOX_WIDTH;
	coord.y = row * BOX_HEIGHT;

	return coord;
}


// This function updates the position of the Snake
function update() {

	if (speedCalc >= speed) {
		var snakeCurrentPositionX = snake.headX();
		var snakeCurrentPositionY = snake.headY();

		if (direction == DIRECTION_LEFT) {
			snakeCurrentPositionX -= 1;		
		} else if (direction == DIRECTION_RIGHT) {
			snakeCurrentPositionX += 1;
		} else if (direction == DIRECTION_UP) {
			snakeCurrentPositionY -= 1;
		} else {
			snakeCurrentPositionY += 1;
		}

		// Wrap Around
		if (snakeCurrentPositionX < 0) {
			snakeCurrentPositionX = BOARD_COLUMNS - 1;
		} else if (snakeCurrentPositionX >= BOARD_COLUMNS) {
			snakeCurrentPositionX = 0;
		} else if (snakeCurrentPositionY < 0) {
			snakeCurrentPositionY = BOARD_ROWS - 1;
		} else if (snakeCurrentPositionY >= BOARD_ROWS) {
			snakeCurrentPositionY = 0;
		} 

		// Check to see if food found
		if (snakeCurrentPositionX == foodPosition[1] && snakeCurrentPositionY == foodPosition[0]) {
			gotFood();
		}

		// Check for collision
		if (snake.contains([snakeCurrentPositionY, snakeCurrentPositionX])) {
			alert("Game Over");
			initialize();
		}

		var tail = snake.add([snakeCurrentPositionY, snakeCurrentPositionX]);
		
		if (tail != null) {
			board[tail[0]][tail[1]] = EMPTY_BOX;				
		}

		board[snakeCurrentPositionY][snakeCurrentPositionX] = SNAKE_BOX;

		speedCalc = 0;
	} else {
		speedCalc += 1;
	}
	
}

// This function returns a random position for Food
function createRandomFood() {
	var row = Math.floor((Math.random() * BOARD_ROWS - 1) + 1);
	var column = Math.floor((Math.random() * BOARD_COLUMNS - 1) + 1);

	foodPosition = [row, column];
	board[foodPosition[0]][foodPosition[1]] = FOOD_BOX;
}

function gotFood() {
	score += 1;
	snake.size += SNAKE_SIZE_INCREASE_FACTOR;

	increaseSpeed();
	// Create Random Food
	createRandomFood();
}

function increaseSpeed() {

	if (score > 5 && speed > 0) {
		speed = speed - (score / 5);
		if (speed < 0)
			speed = 0;
	}
}