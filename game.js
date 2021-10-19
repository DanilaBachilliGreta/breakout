
//Select canvas element
const cvs = document.getElementById('breakout')
const ctx = cvs.getContext('2d')

//add borders
cvs.style.border ='1px solid #0ff' 

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

// create paddle obj
const paddle = {
    x: cvs.width/2 - PADDLE_WIDTH/2,
    y: cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 5
}

//draw paddle
function drawPaddle(){
    ctx.fillStyle = '#2e3548'
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
    ctx.strokeStyle = '#ffcd05'
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height)
}
//control the paddle
document.addEventListener('keydown', (e)=>{
    if(e.keyCode == 37){
        leftArrow=true
    }else if (e.keyCode == 39){
        rightArrow =true
    }
})
document.addEventListener('keyup', (e)=>{
    if(e.keyCode == 37){
        leftArrow=false
    }else if (e.keyCode == 39){
        rightArrow =false
    }
})

//move paddle
function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < cvs.width) {
        paddle.x += paddle.dx
    }else if (leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx
    }
}
//create the ball obj
const ball = {
    x: cvs.width/2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 4,
    dx: 3* (Math.random() *2 - 1), //to make the dir random
    dy: -3
}

//draw the ball
function drawBall(){
    ctx.beginPath()

    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2)
    ctx.fillStyle ='#ffcd05'
    ctx.fill()

    ctx.strokeStyle ='#2e3548'
    ctx.stroke()

    ctx.closePath()
}

//move the ball
function moveBall(){
    ball.x += ball.dx
    ball.y += ball.dy
}




//ball & wall collision
function ballWallCollision(){
    //collision to the right || the left
    if(ball.x + ball.radius > cvs.width || ball.x - ball.radius <0){
        ball.dx = -ball.dx
        WALL_HIT.play()
    }
    //collision to the top
    if(ball.y - ball.radius < 0){
        ball.dy = -ball.dy
        WALL_HIT.play()
    }
    //the ball fall down
    if(ball.y + ball.radius > cvs.height){
        LIFE --   //loose life
        LIFE_LOST.play()
        resetBall()
    }

}
// reset the ball
function resetBall() {
    ball.x= cvs.width/2
    ball.y= paddle.y - BALL_RADIUS
    ball.dx= 3 * (Math.random() *2 - 1) //to make the dir random
    ball.dy= -3
}

// ball & paddle collision
function ballPaddleCollision(){
    if(ball.x < paddle.x + paddle.width && ball.x >paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y ){
        //play sound
        PADDLE_HIT.play()

        //check where the ball hit the paddle
        let collidePoint = ball.x - (paddle.x + paddle.width/2)

        //normalize the values
        collidePoint = collidePoint/ (paddle.width/2)

        //calculate the angle
        let angle = collidePoint * Math.PI/3


        ball.dx = ball.speed * Math.sin(angle)
        ball.dy = - ball.speed * Math.cos(angle)

    }
}

//create bricks obj
const brick = {
    row: 1,
    column: 5,
    width: 55,
    height: 20,
    offSetLeft: 20,
    offSetTop: 20,
    marginTop: 40, 
    fillColor: '#2e3548',
    strokeColor: '#fff'
}
let bricks =[] //bi-dimensional array (rows & columns)

function createBricks(){
    for(let r=0; r < brick.row; r++){
        bricks[r] = []
        for(let c= 0; c < brick.column; c++){
            bricks[r][c]= {
                x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
                y: r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop,
                status: true
            }
        }
    }
}
createBricks()

//draw bricks
function drawBricks(){
    for(let r= 0; r < brick.row; r++){
        for(let c= 0; c < brick.column; c++){
            let b = bricks[r][c]
            //if brick is not broken
            if(b.status){
                ctx.fillStyle = brick.fillColor
                ctx.fillRect(b.x, b.y, brick.width, brick.height)

                ctx.strokeStyle = brick.strokeColor
                ctx.strokeRect(b.x, b.y, brick.width, brick.height)
            }
        }
    }
}
//ball & brick collision
function ballBrickCollision(){
    for(let r= 0; r < brick.row; r++){
        for(let c= 0; c < brick.column; c++){
            let b = bricks[r][c]
            //if brick is not broken
            if(b.status){
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    BRICK_HIT.play()
                    ball.dy = - ball.dy
                    b.status = false //brick is broken
                    SCORE += SCORE_UNIT
                }
                
            }
        }
    }
}

// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY){
    //draw text
    ctx.fillStyle = '#fff'
    ctx.font = '25px  Germania One'
    ctx.fillText(text, textX, textY)

    //draw image
    ctx.drawImage(img, imgX, imgY, width=25, height=25)
}


//draw function
function draw() {
    drawPaddle()
    drawBall()
    drawBricks()
    //show score
    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5)
    //show lives
    showGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width -55, 5)
    //show level
    showGameStats(LEVEL, cvs.width/2, 25, LEVEL_IMG, cvs.width/2- 30, 5)

}

//game over
function gameOver(){
    if(LIFE <= 0){
        showYouLost()
        GAME_OVER = true
    }
}

//level upgrade
function levelUp(){
    let isLevelDone = true

    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            isLevelDone = isLevelDone && ! bricks[r][c].status
        }
    }
    if(isLevelDone){
        WIN.play()
        if(LEVEL >= MAX_LEVEL){
            showYouWon()
            GAME_OVER = true
            return
        }
        brick.row++
        createBricks()
        ball.speed += 0.5
        resetBall()
        LEVEL++



    }
}

// update game function
function update(){

    movePaddle()

    moveBall()

    ballWallCollision()

    ballPaddleCollision()

    ballBrickCollision()

    gameOver()

    levelUp()

}


//game loop
function loop(){
    //clear canvas
    ctx.drawImage(BG_IMG, 0, 0)

    draw()

    update()

    if (! GAME_OVER){
        requestAnimationFrame(loop)
    }

    
}
loop()

//sound element
const soundElement = document.getElementById('sound')

soundElement.addEventListener('click', audioMenager)

function audioMenager(){
    //change img sound on/off
    let imgSrc = soundElement.getAttribute('src')
    let SOUND_IMG = imgSrc == 'img/SOUND_ON.png'? 'img/SOUND_OFF.png': 'img/SOUND_ON.png'

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
restart.addEventListener('click', (e)=>{
    location.reload()//reload page
})

//show winner
function showYouWon(){
    gameover.style.display ='block'
    youwon.style.display = 'block'
}

//show looser
function showYouLost(){
    gameover.style.display ='block'
    youlost.style.display = 'block'
}