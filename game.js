var width = 500,
	height = 500,
	c = document.getElementById('c'),
	ctx = document.getElementsByTagName('canvas')[0].getContext('2d'),
	points = 0,
	state = true,
	gLoop;
	
c.width = width;
c.height = height;

var clear = function(){
	ctx.fillStyle = '#d0E7F9';
	ctx.beginPath();
	ctx.rect(0,0, width, height);
	ctx.closePath();
	ctx.fill();
};

var circlesNum = 10, circles = [];

for (var i = 0; i < circlesNum; i++)
	circles.push([Math.random() * width, Math.random() * height, Math.random() * 100, Math.random() / 2]);

var DrawCircles = function(){   
	for (var i = 0; i < circlesNum; i++) {   
		ctx.fillStyle = 'rgba(255, 255, 255, ' + circles[i][3] + ')';
		ctx.beginPath();   
		ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	}
};

var MoveCircles = function(deltaY){
	for(var i = 0; i < circlesNum; i++) {
		if(circles[i][1] - circles[i][2] > height) {
			circles[i][0] = Math.random() * width;
			circles[i][2] = Math.random() * 100;
			circles[i][1] = 0 - circles[i][2];
			circles[i][3] = Math.random() / 2;
		} else {
			circles[i][1] += deltaY;
		}
	}
};

var player = new (function(){
	var that = this;
	
	that.image = new Image();
	that.image.src = "angel.png";
	
	that.width = 65;
	that.height = 95;
	
	that.X = 0;
	that.Y = 0;
	
	that.frames = 1;
	that.actualFrame = 0;
	that.interval = 0;
	
	that.isJumping = 0;
	that.isFalling = 0;
	
	that.jumpSpeed = 0;
	that.fallSpeed = 0;

	that.isMoving = true;
	
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	
	that.jump = function() {
		if(!that.isJumping && !that.isFalling) {
			that.fallSpeed = 0;
			that.isJumping = true;
			that.jumpSpeed = 22;
		}
	}
	
	that.checkJump = function() {
		if(that.Y > height * 0.4) {
			that.setPosition(that.X, that.Y - that.jumpSpeed);
		} else {
			if(that.jumpSpeed > 10) points += 100;
			MoveCircles(that.jumpSpeed * 0.5);
			
			platforms.forEach(function(platform, ind) {
				platform.Y += that.jumpSpeed;
				
				if(platform.Y > height) {
					var type = ~~(Math.random() * 5);
					if(type == 0) type = 1;
					else type = 0;
					platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.Y - height, type);
				}
			});
		}
		
		that.jumpSpeed--;
		if(that.jumpSpeed == 0) {
			that.isJumping = false;
			that.isFalling = true;
			that.fallSpeed = 1;
		}
	}
	
	that.checkFall = function() {
		if(that.Y < height - that.height) {
			that.setPosition(that.X, that.Y + that.fallSpeed);
			that.fallSpeed++;
		} else {
			if(points == 0) that.fallStop();
			else GameOver();
		}
	}
	
	that.fallStop = function() {
		that.isFalling = false;
		that.fallSpeed = 0;
		that.jump();
	}
		
	
	that.moveLeft = function() {
		if((that.X > 0) && that.isMoving) {
			that.setPosition(that.X - 5, that.Y);
		}
	}
	
	that.moveRight = function() {
		if((that.X + that.width < width) && that.isMoving) {
			that.setPosition(that.X + 5, that.Y);
		}
	}
	
	that.update = function() {
		if(that.isJumping) that.checkJump();
		if(that.isFalling) that.checkFall();
		that.draw();
	}
		
	
	that.draw = function(){
		try {
			ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height,
						  that.X, that.Y, that.width, that.height);
		} catch(e) {
		}
		
		if(that.interval == 4) {
			if(that.actualFrame == that.frames) {
				that.actualFrame = 0;
			} else {
				that.actualFrame++;
			}
			that.interval = 0;
		}
		
		that.interval++;
	}
})();

var Platform = function(x, y, type) {
	var that = this;
	
	that.firstColor = '#FF8C00';
	that.secondColor = '#EEEE00';
	
	that.onCollide = function() {
		player.fallStop();
	}
	
	that.isMoving = ~~(Math.random() * 2);
	that.direction = ~~(Math.random() * 2) ? -1 : 1;
	
	that.draw = function() {
		ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		
		var gradient = ctx.createRadialGradient(that.X + (platformWidth / 2), that.Y + (platformHeight / 2), 5, that.X + (platformWidth / 2), that.Y + (platformHeight / 2), 45);
		
		gradient.addColorStop(0, that.firstColor);
		gradient.addColorStop(1, that.secondColor);
		ctx.fillStyle = gradient;
		ctx.fillRect(that.X, that.Y, platformWidth, platformHeight);
	}
	
	if(type == 1) {
		that.firstColor = '#AADD00';
		that.secondColor = '#698B22';
		
		that.onCollide = function() {
			player.fallStop();
			player.jumpSpeed = 50;
		};
	}
	
	that.X = ~~x;
	that.Y = y;
	that.type = type;
	
	return that;
};

var nrOfPlatforms = 7,
	platforms = [],
	platformWidth = 70;
	platformHeight = 20;

var generatePlatforms = function() {
	var position = 0, type;
	
	for(var i = 0; i < nrOfPlatforms; i++) {
		type = ~~(Math.random()*5);
		if(type == 0) type = 1;
		else type = 0;
		
		platforms[i] = new Platform(Math.random()*(width-platformWidth), position,type);
		
		if(position < height - platformHeight) position += ~~(height / nrOfPlatforms);
	}
}();

var checkCollision = function() {
	platforms.forEach(function(e, ind) {
		if((player.isFalling) &&
		   (player.X < e.X + platformWidth) &&
		   (player.X + player.width > e.X) &&
		   (player.Y + player.height > e.Y) &&
		   (player.Y + player.height < e.Y + platformHeight)
		  ) {
			e.onCollide();
		}
	})
}

var GameOver = function() {
	state = false;
	clearTimeout(gLoop);
	setTimeout(function() {
		clear();
		ctx.fillStyle = "Black";
		ctx.font = "10pt Arial";
		ctx.fillText("GAME OVER", width / 2 - 60, height / 2 - 60, height / 2 - 30);
		ctx.fillText("YOUR RESULT:" + points, width / 2 - 80, height / 2 - 30);
	}, 100);
}

document.onmousemove = function(e) {
	if(player.X + c.offsetLeft > e.pageX - 20) {
		player.moveLeft();
	} else if(player.X + c.offsetLeft < e.pageX - 20) {
		player.moveRight();
	}
};

document.onmousedown = function(e) {
	if(state == false) {
		points = 0;
		state = true;
		GameLoop();
	}
}

player.setPosition(~~((width - player.width) / 2), ~~((height - player.height) / 2));
player.jump();

var GameLoop = function() {
	clear();
	
	ctx.fillStyle = "Black";
	ctx.fillText("POINTS:" + points, 10, height - 10);
	
	//MoveCircles(5);
	DrawCircles();
	
	platforms.forEach(function(platform, index){
		if(platform.isMoving) {
			if(platform.X < 0) {
				platform.direction = 1;
			} else if(platform.X > width - platformWidth) {
				platform.direction = -1;
			}
			platform.X += platform.direction * (index / 2) * ~~(points / 10000);
		}
		platform.draw();
	});
	
	checkCollision();
	
	player.update();
	if(state)
		gLoop = setTimeout(GameLoop, 1000 / 50);
}

GameLoop();