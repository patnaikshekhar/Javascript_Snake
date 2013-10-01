
// Constants
var CANVAS_HEIGHT = 500;
var CANVAS_WIDTH = 1000;

var BOX_HEIGHT = 20;
var BOX_WIDTH = 20;

var BOARD_ROWS = Math.round(CANVAS_HEIGHT / BOX_HEIGHT);
var BOARD_COLUMNS = Math.round(CANVAS_WIDTH / BOX_WIDTH);

var EMPTY_BOX = 0;
var SNAKE_BOX = 1;
var OBSTICLE_BOX = 2;
var FOOD_BOX = 3;

var SNAKE_START_LENGTH = 5;
var SNAKE_START_SPEED = 4;
var SNAKE_SIZE_INCREASE_FACTOR = 5;

var FPS = 60;

var DIRECTION_UP = 0;
var DIRECTION_DOWN = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 3;

var SCORE_LOCATION_1_X = CANVAS_WIDTH - 100;
var SCORE_LOCATION_1_Y = 20;

var SCORE_LOCATION_2_X = CANVAS_WIDTH - 100;
var SCORE_LOCATION_2_Y = 40;

var RANDOM_COLORS = ["#FF0000","#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "CC0099", "9933CC", "9933FF", "FF6666", "FFFF33", "996666", "6699FF"];

// End Constants

var ctx = null;  // Holds the Drawing Context

// Holds the global snake class
var player1Snake = null;
var player2Snake = null;
var food = null;

// Singleton - It holds all snakes
SnakesOnBoard = {
	snakes: [],
	newSnakeId: 0,

	add: function() {

		var snake = new Snake();
		snake.id = this.newSnakeId;
		this.newSnakeId++;

		this.snakes.push(snake);

		return snake.id;
	},

	getIndex: function(id) {
		var index = -1;

		for (var i = 0; i < this.snakes.length; i++) {
			if (this.snakes[i].id == id) {
				index = i;
				break;
			}
		}

		return index;
	},

	getSnake: function(id) {
		var index = this.getIndex(id);

		if (index >= 0) {
			return this.snakes[index];
		}		

		return null;
	},

	remove: function(id) {

		var index = this.getIndex(id);

		if (index >= 0) {
			for (var i = index; i < this.snakes.length - 1; i++) {
				this.snakes[i] = this.snakes[i + 1];
			}	
		}
				
		this.snakes.pop();
	},

	draw: function(context) {

		for (var i = 0; i < this.snakes.length; i++) {
			this.snakes[i].draw(context);
		}
	},

	update: function() {

		for (var i = 0; i < this.snakes.length; i++) {
			this.snakes[i].update();
		}
	},

	contains: function(location) {

		for (var i = 0; i < this.snakes.length; i++) {
			if(this.snakes[i].contains(location))
				return true;
		}

		return false;	
	}
};

//_____________________________________________________________________________________
// Start Class Food

function Food() {
	this.location = [];
	this.color = getRandomColor();

	this.createRandomFood();
}

// This function returns a random position for Food
Food.prototype.createRandomFood = function() {
		var row = Math.floor((Math.random() * BOARD_ROWS - 1) + 1);
		var column = Math.floor((Math.random() * BOARD_COLUMNS - 1) + 1);

		this.location = [row, column];
	};

Food.prototype.draw = 
	function(context) {
		var coord = getCoordsOfBox(this.location[0], this.location[1]);
		context.fillStyle = this.color;
		context.fillRect(coord.x, coord.y, BOX_WIDTH, BOX_HEIGHT);
	};

// End Class Food

// Start Class Snake

function Snake() {

	this.initialize();
}

Snake.prototype.initialize = 
	function() {
		
		this.id = -1;

		this.score = 0; // Holds the score of the current player
		this.direction = DIRECTION_LEFT; // Current Direction of the Snake
		this.speedCalc = 0; // This variable is used to Skip Frames
		this.speed = SNAKE_START_SPEED; // This variable holds the current speed
		
		this.queue = [];
		this.size = SNAKE_START_LENGTH;

		this.color = getRandomColor();

		this.getRandomLocation();
	};

Snake.prototype.getRandomLocation = 
	function() {
		var startRow = Math.floor((Math.random() * BOARD_ROWS - SNAKE_START_LENGTH) + 0);
		var startColumn = Math.floor((Math.random() * BOARD_COLUMNS - SNAKE_START_LENGTH) + 0);

		for (var columnShift = SNAKE_START_LENGTH - 1; columnShift >= 0; columnShift--) {
			this.add([startRow, startColumn + columnShift]);
		}
	};

Snake.prototype.add = 
	
	function(position) {

		this.queue.push(position);

		if (this.length() > this.size) {
			return this.remove();	
		} else {
			return null;
		}
	};

Snake.prototype.remove = 
	function() {
		return this.queue.shift();
	};

Snake.prototype.length = 
	function() {
		return this.queue.length;
	};

Snake.prototype.head = 
	function() {
		return this.queue[this.length() - 1];
	};

Snake.prototype.headX = 
	function() {
		return this.head()[1];
	};

Snake.prototype.headY = 
	function() {
		return this.head()[0];
	};

Snake.prototype.contains = 
	function(lst) {
		var row = lst[0];
		var column = lst[1];
		
		for (var i = 0; i < this.queue.length; i++) {
			if (this.queue[i][0] == row && this.queue[i][1] == column)
				return true;
		} 

		return false;
	};

Snake.prototype.draw =
	function(context) {
		for (var i = 0; i < this.queue.length; i++) {
			var coord = getCoordsOfBox(this.queue[i][0], this.queue[i][1]);
			context.fillStyle = this.color;
			context.fillRect(coord.x, coord.y, BOX_WIDTH, BOX_HEIGHT);
		}		
	};

Snake.prototype.update = 
// This function updates the position of the Snake
	function() {

		if (this.speedCalc >= this.speed) {
			var snakeCurrentPositionX = this.headX();
			var snakeCurrentPositionY = this.headY();

			if (this.direction == DIRECTION_LEFT) {
				snakeCurrentPositionX -= 1;		
			} else if (this.direction == DIRECTION_RIGHT) {
				snakeCurrentPositionX += 1;
			} else if (this.direction == DIRECTION_UP) {
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

			collisionCheck(this, snakeCurrentPositionX, snakeCurrentPositionY);

			this.add([snakeCurrentPositionY, snakeCurrentPositionX]);
			
			this.speedCalc = 0;
		} else {
			this.speedCalc += 1;
		}
		
	};

Snake.prototype.gotFood = 
	function() {
		this.score += 1;
		this.size += SNAKE_SIZE_INCREASE_FACTOR;
		createNewFood();
	};

// End Class Snake
//_____________________________________________________________________________________


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
	
	bindControls();
});

function initialize() {

	score = 0;

	food = new Food();

	playerSnake1 = createSnakePlayer1();
}

// This updates the game state
function update() {
	SnakesOnBoard.update();
}


// This function draws the characters
function draw() {

	// Clear Rect
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	// Draw Snake
	SnakesOnBoard.draw(ctx);

	// Draw Food
	food.draw(ctx);

	// Draw Score
	ctx.fillStyle = "#00F";
	ctx.font = 'italic 15pt Calibri';
	
	if (player1Snake != null) {
		ctx.fillText("Score : " + SnakesOnBoard.getSnake(player1Snake).score, SCORE_LOCATION_1_X, SCORE_LOCATION_1_Y);	
	}
	
	if (player2Snake != null) {
		ctx.fillText("Score : " + SnakesOnBoard.getSnake(player2Snake).score, SCORE_LOCATION_2_X, SCORE_LOCATION_2_Y);
	}
}

// This function takes the coordinates of the board and draws a box
function getCoordsOfBox(row, column) {
 	var coord = new Object();
	coord.x = column * BOX_WIDTH;
	coord.y = row * BOX_HEIGHT;

	return coord;
}

function getRandomColor() {
	var index = Math.floor((Math.random() * RANDOM_COLORS.length - 1) + 0);
	return RANDOM_COLORS[index];
}


// What happens when the snake eats the food
function createNewFood() {

	// Create new Food
	food = new Food();
}

// Called when game is over 
function gameOver(id) {

	SnakesOnBoard.remove(id);

	if (id == player1Snake) {
		alert("Game Over for Player 1");
		player1Snake = null;
	}

	if (id == player2Snake) {
		alert("Game Over for Player 2");
		player2Snake = null;
	}
}

function bindControls() {
	$(document).bind("keydown", "left", function() {
		
		playerSnake1 = createSnakePlayer1();

		var currentSnake = SnakesOnBoard.getSnake(player1Snake);

		if (currentSnake.direction != DIRECTION_LEFT && currentSnake.direction != DIRECTION_RIGHT) {
			currentSnake.direction = DIRECTION_LEFT;
		}
	});

	$(document).bind("keydown", "right", function() {		
		
		playerSnake1 = createSnakePlayer1();

		var currentSnake = SnakesOnBoard.getSnake(player1Snake);

		if (currentSnake.direction != DIRECTION_LEFT && currentSnake.direction != DIRECTION_RIGHT) {
			currentSnake.direction = DIRECTION_RIGHT;
		}
	});

	$(document).bind("keydown", "up", function() {
		
		playerSnake1 = createSnakePlayer1();

		var currentSnake = SnakesOnBoard.getSnake(player1Snake);

		if (currentSnake.direction != DIRECTION_UP && currentSnake.direction != DIRECTION_DOWN) {
			currentSnake.direction = DIRECTION_UP;
		}
	});

	$(document).bind("keydown", "down", function() {
		
		player1Snake = createSnakePlayer1();

		var currentSnake = SnakesOnBoard.getSnake(player1Snake);

		if (currentSnake.direction != DIRECTION_UP && currentSnake.direction != DIRECTION_DOWN) {
			currentSnake.direction = DIRECTION_DOWN;
		}
	});

	$(document).bind("keydown", "a", function() {
		
		playerSnake2 = createSnakePlayer2();

		var currentSnake = SnakesOnBoard.getSnake(player2Snake);

		if (currentSnake.direction != DIRECTION_LEFT && currentSnake.direction != DIRECTION_RIGHT) {
			currentSnake.direction = DIRECTION_LEFT;
		}
	});

	$(document).bind("keydown", "d", function() {		
		
		playerSnake2 = createSnakePlayer2();

		var currentSnake = SnakesOnBoard.getSnake(playerSnake2);

		if (currentSnake.direction != DIRECTION_LEFT && currentSnake.direction != DIRECTION_RIGHT) {
			currentSnake.direction = DIRECTION_RIGHT;
		}
	});

	$(document).bind("keydown", "w", function() {
		
		playerSnake2 = createSnakePlayer2();

		var currentSnake = SnakesOnBoard.getSnake(playerSnake2);

		if (currentSnake.direction != DIRECTION_UP && currentSnake.direction != DIRECTION_DOWN) {
			currentSnake.direction = DIRECTION_UP;
		}
	});

	$(document).bind("keydown", "s", function() {
		
		playerSnake2 = createSnakePlayer2();

		var currentSnake = SnakesOnBoard.getSnake(playerSnake2);

		if (currentSnake.direction != DIRECTION_UP && currentSnake.direction != DIRECTION_DOWN) {
			currentSnake.direction = DIRECTION_DOWN;
		}
	});
}


function createSnakePlayer1() {
	if (player1Snake == null) {
		player1Snake = SnakesOnBoard.add();	
	} else {
		return player1Snake;
	}
}

function createSnakePlayer2() {
	if (player2Snake == null) {
		player2Snake = SnakesOnBoard.add();	
	} else {
		return player2Snake;
	}
}

function collisionCheck(snake, snakeCurrentPositionX, snakeCurrentPositionY) {

	// Check to see if food found
	if (snakeCurrentPositionX == food.location[1] && snakeCurrentPositionY == food.location[0]) {
		snake.gotFood();
	}

	// Check for collision with snakes
	if (SnakesOnBoard.contains([snakeCurrentPositionY, snakeCurrentPositionX])) {
		gameOver(snake.id);
	}

}