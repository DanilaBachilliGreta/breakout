
//Select canvas element
const cvs = document.getElementById('breakout')
const ctx = cvs.getContext('2d')

//add borders
cvs.style.border = '1px solid #0ff'

//make line thick when drawing 
ctx.lineWidth = 3

//game vars and consts
const PADDLE_WIDTH = 100
const PADDLE_MARGIN_BOTTOM = 50
const PADDLE_HEIGHT = 20
const BALL_RADIUS = 8
let LIFE = 3   //3 lives
let SCORE = 0
const SCORE_UNIT = 10
let LEVEL = 1
const MAX_LEVEL = 3
let GAME_OVER = false
//set false= not pressed
let leftArrow = false
let rightArrow = false

//my objs
let paddle
let ball
let brick

//control the paddle
document.addEventListener('keydown', (e) => {
    if (e.keyCode == 37) {
        leftArrow = true
    } else if (e.keyCode == 39) {
        rightArrow = true
    }
})
document.addEventListener('keyup', (e) => {
    if (e.keyCode == 37) {
        leftArrow = false
    } else if (e.keyCode == 39) {
        rightArrow = false
    }
})


// create paddle obj
class Paddle {
    cvs = document.getElementById('breakout')
    ctx = cvs.getContext('2d')
    PADDLE_WIDTH = 100
    PADDLE_MARGIN_BOTTOM = 50
    PADDLE_HEIGHT = 20
    x = cvs.width / 2 - PADDLE_WIDTH / 2
    y = cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT
    width = PADDLE_WIDTH
    height = PADDLE_HEIGHT
    dx = 5
    leftArrow = false
    rightArrow = false

    constructor(cvs, ctx, PADDLE_WIDTH, PADDLE_MARGIN_BOTTOM, PADDLE_HEIGHT, x, y, width, height, dx, leftArrow, rightArrow) {
        this.cvs = cvs
        this.ctx = ctx
        this.PADDLE_WIDTH = PADDLE_WIDTH
        this.PADDLE_MARGIN_BOTTOM = PADDLE_MARGIN_BOTTOM
        this.PADDLE_HEIGHT = PADDLE_HEIGHT
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.dx = dx
        this.leftArrow = leftArrow
        this.rightArrow = rightArrow
    }
    //draw paddle
    drawPaddle(ctx) {
        this.ctx.fillStyle = '#2e3548'
        this.ctx.fillRect(this.x, this.y, this.width, this.height)
        this.ctx.strokeStyle = '#ffcd05'
        this.ctx.strokeRect(this.x, this.y, this.width, this.height)
    }


    //move paddle
    movePaddle() {
        document.addEventListener('keydown', (e) => {
            if (e.keyCode == 37) {
                this.leftArrow = true
            } else if (e.keyCode == 39) {
                this.rightArrow = true
            }
        })
        document.addEventListener('keyup', (e) => {
            if (e.keyCode == 37) {
                this.leftArrow = false
            } else if (e.keyCode == 39) {
                this.rightArrow = false
            }
        })


        if (this.rightArrow && this.x + this.width < this.cvs.width) {
            this.x += this.dx
        } else if (this.leftArrow && this.x > 0) {
            this.x -= this.dx
        }
    }


}

paddle = new Paddle()



//create the ball obj
class Ball {
    cvs = document.getElementById('breakout')
    ctx = cvs.getContext('2d')
    paddle = new Paddle()
    BALL_RADIUS = 8
    x = cvs.width / 2
    y = paddle.y - BALL_RADIUS
    radius = BALL_RADIUS
    speed = 4
    dx = 3 * (Math.random() * 2 - 1) //to make the dir random
    dy = -3


    constructor(cvs, ctx, paddle, BALL_RADIUS, x, y, radius, speed, dx, dy) {
        this.cvs = cvs
        this.ctx = ctx
        this.paddle = paddle
        this.BALL_RADIUS = BALL_RADIUS
        this.x = x
        this.y = y
        this.radius = radius
        this.speed = speed
        this.dx = dx
        this.dy = dy
    }

    //draw the ball
    drawBall() {
        this.ctx.beginPath()

        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        this.ctx.fillStyle = '#ffcd05'
        this.ctx.fill()

        this.ctx.strokeStyle = '#2e3548'
        this.ctx.stroke()

        this.ctx.closePath()
    }

    //move the ball
    moveBall() {
        this.x += this.dx
        this.y += this.dy
    }
    // reset the ball
    resetBall() {
        this.x = this.cvs.width / 2
        this.y = this.y - BALL_RADIUS
        this.dx = 3 * (Math.random() * 2 - 1) //to make the dir random
        this.dy = -3
    }

    // ball & paddle collision
    ballPaddleCollision() {
        if (this.x < this.paddle.x + this.paddle.width && this.x > this.paddle.x && this.paddle.y < this.paddle.y + this.paddle.height && this.y > this.paddle.y) {
            //play sound
            PADDLE_HIT.play()

            //check where the ball hit the paddle
            let collidePoint = this.x - (this.paddle.x + this.paddle.width / 2)

            //normalize the values
            collidePoint = collidePoint / (this.paddle.width / 2)

            //calculate the angle
            let angle = collidePoint * Math.PI / 3


            this.dx = this.speed * Math.sin(angle)
            this.dy = - this.speed * Math.cos(angle)

        }
    }

    //ball & wall collision
    ballWallCollision() {
        //collision to the right || the left
        if (this.x + this.radius > this.cvs.width || this.x - this.radius < 0) {
            this.dx = -this.dx
            WALL_HIT.play()
        }
        //collision to the top
        if (this.y - this.radius < 0) {
            this.dy = -this.dy
            WALL_HIT.play()
        }
        //the ball fall down
        if (this.y + this.radius > this.cvs.height) {
            LIFE--   //loose life
            LIFE_LOST.play()
            this.resetBall()
        }

    }


}
ball = new Ball()




//create bricks obj
class Brick {
    ball = new Ball()
    cvs = document.getElementById('breakout')
    ctx = cvs.getContext('2d')
    row = 1
    column = 5
    width = 55
    height = 20
    offSetLeft = 20
    offSetTop = 20
    marginTop = 40
    fillColor = '#2e3548'
    strokeColor = '#fff'
    bricks = [] //bi-dimensional array (rows & columns)

    constructor(ball, cvs, ctx, row, column, width, height, offSetLeft, offSetTop, marginTop, fillColor, strokeColor, bricks) {
        this.ball = ball
        this.cvs = cvs
        this.ctx = ctx
        this.row = row
        this.column = column
        this.width = width
        this.height = height
        this.offSetLeft = offSetLeft
        this.offSetTop = offSetTop
        this.marginTop = marginTop
        this.fillColor = fillColor
        this.strokeColor = strokeColor
        this.bricks = bricks
    }

    createBricks() {
        for (let r = 0; r < this.row; r++) {
            this.bricks[r] = []
            for (let c = 0; c < this.column; c++) {
                this.bricks[r][c] = {
                    x: c * (this.offSetLeft + this.width) + this.offSetLeft,
                    y: r * (this.offSetTop + this.height) + this.offSetTop + this.marginTop,
                    status: true
                }
            }
        }
    }

    //draw bricks
    drawBricks() {
        for (let r = 0; r < this.row; r++) {
            for (let c = 0; c < this.column; c++) {
                let b = this.bricks[r][c]
                //if brick is not broken
                if (b.status) {
                    this.ctx.fillStyle = this.fillColor
                    this.ctx.fillRect(b.x, b.y, this.width, this.height)

                    this.ctx.strokeStyle = this.strokeColor
                    this.ctx.strokeRect(b.x, b.y, this.width, this.height)
                }
            }
        }
    }

    //ball & brick collision
    ballBrickCollision() {
        for (let r = 0; r < this.row; r++) {
            for (let c = 0; c < this.column; c++) {
                let b = bricks[r][c]
                //if brick is not broken
                if (b.status) {
                    if (this.ball.x + this.ball.radius > b.x && this.ball.x - this.ball.radius < b.x + this.width && this.ball.y + this.ball.radius > b.y && this.ball.y - this.ball.radius < b.y + this.height) {
                        BRICK_HIT.play()
                        this.ball.dy = - this.ball.dy
                        b.status = false //brick is broken
                        SCORE += SCORE_UNIT
                    }

                }
            }
        }
    }
}

brick = new Brick




// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY) {
    //draw text
    ctx.fillStyle = '#fff'
    ctx.font = '25px  Germania One'
    ctx.fillText(text, textX, textY)

    //draw image
    ctx.drawImage(img, imgX, imgY, width = 25, height = 25)
}


//draw function
function draw() {
    paddle = new Paddle()
    paddle.drawPaddle()
    ball = new Ball()
    ball.drawBall()
    brick = new Brick()
    brick.drawBricks()
    //show score
    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5)
    //show lives
    showGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width - 55, 5)
    //show level
    showGameStats(LEVEL, cvs.width / 2, 25, LEVEL_IMG, cvs.width / 2 - 30, 5)

}

//game over
function gameOver() {
    if (LIFE <= 0) {
        showYouLost()
        GAME_OVER = true
    }
}

//level upgrade
function levelUp() {
    let isLevelDone = true

    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            isLevelDone = isLevelDone && !bricks[r][c].status
        }
    }
    if (isLevelDone) {
        WIN.play()
        if (LEVEL >= MAX_LEVEL) {
            showYouWon()
            GAME_OVER = true
            return
        }
        brick.row++
        brick.createBricks()
        ball.speed += 0.5
        ball.resetBall()
        LEVEL++



    }
}

// update game function
function update() {

    paddle.movePaddle()

    ball.moveBall()

    ballWallCollision()

    ball.ballPaddleCollision()

    brick.ballBrickCollision()

    gameOver()

    levelUp()

}


//game loop
function loop() {
    //clear canvas
    ctx.drawImage(BG_IMG, 0, 0)

    draw()

    update()

    if (!GAME_OVER) {
        requestAnimationFrame(loop)
    }


}
loop()

//sound element
const soundElement = document.getElementById('sound')

soundElement.addEventListener('click', audioMenager)

function audioMenager() {
    //change img sound on/off
    let imgSrc = soundElement.getAttribute('src')
    let SOUND_IMG = imgSrc == 'img/SOUND_ON.png' ? 'img/SOUND_OFF.png' : 'img/SOUND_ON.png'

    soundElement.setAttribute('src', SOUND_IMG)

    //mute & unmute sounds
    WALL_HIT.muted = WALL_HIT.muted ? false : true
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true
    WIN.muted = WIN.muted ? false : true
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true
}

//show game over massage
const gameover = document.getElementById('gameover')
const youwon = document.getElementById('youwon')
const youlost = document.getElementById('youlost')
const restart = document.getElementById('restart')

//click restart
restart.addEventListener('click', (e) => {
    location.reload()//reload page
})

//show winner
function showYouWon() {
    gameover.style.display = 'block'
    youwon.style.display = 'block'
}

//show looser
function showYouLost() {
    gameover.style.display = 'block'
    youlost.style.display = 'block'
}