"use strict";
//EdSv 2017 Star Galaxy - test task
document.addEventListener("DOMContentLoaded", ready);   
function ready () { 
var gameEl = document.getElementById("game");
var GAME = {};
GAME.width = gameEl.offsetWidth;
GAME.height = gameEl.offsetHeight;
GAME.velosityHero = 3;
GAME.velosityShots = 6;
GAME.velosityEnemy = 2;

var renderer = PIXI.autoDetectRenderer(gameEl.offsetWidth, gameEl.offsetHeight,
    { antialias: false, transparent: true });//, resolution: 1
gameEl.appendChild(renderer.view);

var hero;
var stage = new PIXI.Container();
var fire = false;
var score = 0;
var scoreMessage;
//arrays for bomb, explosions, spaceships
var fireBombs = [];
var explosions = [];
var enemySpaceships = [];

PIXI.loader.add("images/spaceships.json")
    .add("shot", "images/fire_bomb.json")
    .add("images/explosion.json")
    .load(initGame);

function initGame() {
    hero = new PIXI.Sprite(PIXI.utils.TextureCache["sp_your.png"]);
    initHero();
    initEnemies();
    initScoreMessage();
    attachHandlers(renderer.view);

    renderer.render(stage);
    gameLoop();
}

function initHero() {
    hero.anchor.x = 0.5;
    hero.x = GAME.width / 2 | 2;
    hero.y = GAME.height - hero.height - 10;
    currentX = targetX = hero.x;
    stage.addChild(hero);
}

function initEnemies() {
    enemySpaceships.push(new Enemy({ type: "spship1.png" }));
    enemySpaceships.push(new Enemy({ type: "spship2.png" }));
    enemySpaceships.push(new Enemy({ type: "spship3.png" }));
    enemySpaceships.push(new Enemy({ type: "spship4.png" }));
    enemySpaceships.push(new Enemy({ type: "spship6.png" }));
    enemySpaceships.push(new Enemy({ type: "spship7.png" }));
}

function initScoreMessage() {
    score = 0;
    scoreMessage = new PIXI.Text("score: 000", { fontFamily: "Arial", fontSize: 18, fill: "white", align: "right" });
    scoreMessage.position.set(GAME.width - 100, 0);
    stage.addChild(scoreMessage);
}

function attachHandlers(el) {
    el.addEventListener("touchstart", touchstartHandler, false);
    el.addEventListener("mousedown", mousedownHandler, false);
}

function touchstartHandler(event) {
    event.preventDefault();
    fire = true;
    targetX = Math.floor(event.targetTouches[0].pageX);
}

function mousedownHandler(event) {
    event.preventDefault();
    fire = true;
    targetX = Math.floor(event.pageX);
}

var currentX, targetX;

function gameLoop() {
    refreshStateHero();
    refreshStateEnemies();
    checkColisionBombEnemiesHero();
    refreshBombsState();
    refreshExplosionsState();

    renderer.render(stage);
    requestAnimationFrame(gameLoop);
}



function fireShot(x) {
    var spriteFireBomb = new PIXI.Sprite(PIXI.utils.TextureCache["frame6.png"]);
    spriteFireBomb.x = x;
    spriteFireBomb.y = GAME.height - hero.height - 15;
    spriteFireBomb.anchor.x = 0.5;
    spriteFireBomb.anchor.y = 0.5;
    spriteFireBomb.scale.set(0.3, 0.3);
    stage.addChild(spriteFireBomb);
    fire = false;
    fireBombs.push(spriteFireBomb);
}


function explodeNow(spaceship, callback) {
    var exp = new PIXI.Container();
    exp.position.set(spaceship.x, spaceship.y);
    stage.addChild(exp);
    explosions.push({ obj: exp, state: 0, getSprite, qntState: 7, postEffect: callback });
}

var animap = {
    0: "explosion0.png", 1: "explosion1.png", 2: "explosion2.png", 3: "explosion3.png",
    4: "explosion4.png", 5: "explosion5.png", 6: "explosion6.png",
};

function getSprite(state) {
    return new PIXI.Sprite(PIXI.utils.TextureCache[animap[state]]);
}

function hitTestRectangle(r1, r2) {
    //Define the variables we'll need to calculate
    var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
    //hit will determine whether there's a collision
    hit = false;
    //Find the center points of each sprite
    r1.centerX = r1.x; //+ r1.width / 2;
    r1.centerY = r1.y; //+ r1.height / 2;
    r2.centerX = r2.x; //+ r2.width / 2;
    r2.centerY = r2.y;// + r2.height / 2;
    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;
    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        //A collision might be occuring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {
            //There's definitely a collision happening
            hit = true;
        } else {
            //There's no collision on the y axis
            hit = false;
        }
    } else {
        //There's no collision on the x axis
        hit = false;
    }
    //`hit` will be either `true` or `false`
    return hit;
};


Enemy.bposition = GAME.width * 2 / 3 | 0;
Enemy.maxSize = { w: 0, h: 0 };
Enemy.step = 0;
Enemy.delay = 0;// in units of  step
Enemy.ready = true;
Enemy.beforeStart;
Enemy.counter = 0;
function Enemy(options) {
    var stepPx = GAME.velosityEnemy;
    var stepStategy = [{ x: 0, y: stepPx }, { x: -stepPx, y: 0 }, { x: -stepPx, y: 0 },
    { x: 0, y: stepPx }, { x: stepPx, y: 0 }, { x: stepPx, y: 0 }];
    var currentstrategy = 0;
    this.spaceship = new PIXI.Sprite(PIXI.utils.TextureCache[options.type]);
    Enemy.counter += 1;
    if (Enemy.counter % 2)
        Enemy.bposition += Enemy.step;
    else
        Enemy.bposition -= Enemy.step;
    this.spaceship.position.set(Enemy.bposition, 0);
    this.spaceship.scale.set(0.5, 0.5);
    this.spaceship.anchor.set(0.5, 0.5);
    this.spaceship.rotation = 3.14;

    Enemy.maxSize.w = this.spaceship.width > Enemy.maxSize.w ? this.spaceship.width : Enemy.maxSize.w;
    Enemy.maxSize.h = this.spaceship.height > Enemy.maxSize.h ? this.spaceship.height : Enemy.maxSize.h;
    Enemy.step = Enemy.maxSize.w > Enemy.maxSize.h ? Enemy.maxSize.w : Enemy.maxSize.h;
    Enemy.beforeStart = 2 * Enemy.step;
    this.live = false;
    var passedDistanceStep = 0;
    this.resetState = function () {
        this.live = false;
        passedDistanceStep = 0;
        this.spaceship.position.set(Enemy.bposition, 0);
        currentstrategy = 0;
        stage.removeChild(this.spaceship);
    };

    this.doStep = function () {
        if (this.live) {
            var index = currentstrategy % stepStategy.length;
            var xy = stepStategy[index];
            this.spaceship.x += xy.x;
            this.spaceship.y += xy.y;
            passedDistanceStep += GAME.velosityEnemy;

            if (this.spaceship.y + this.spaceship.height / 2 > GAME.height) {
                this.resetState();
            }

            if (passedDistanceStep > Enemy.step) {
                currentstrategy++;
                passedDistanceStep = 0;
            }
            return;
        }

        if (Enemy.ready) {
            Enemy.ready = false;
            this.live = true;
            stage.addChild(this.spaceship);
        }
    };

}

function refreshStateHero() {
    if (currentX === targetX || Math.abs(currentX - targetX) < Math.abs(hero.vx)) {
        hero.vx = 0;
        targetX = currentX;
        //console.log(fire);
        if (fire)
            fireShot(hero.x);//
    } else if (currentX > targetX) {
        hero.vx = -GAME.velosityHero;
    } else {
        hero.vx = GAME.velosityHero;
    }
    hero.x += hero.vx;
    currentX = hero.x;
}

function refreshStateEnemies() {
    if (!Enemy.ready) {
        Enemy.beforeStart--;
        if (Enemy.beforeStart === 0) {
            Enemy.ready = true;
            Enemy.beforeStart = Enemy.step * 2;
        }
    }
    for (var i = 0; i < enemySpaceships.length; i++) {
        var enemy = enemySpaceships[i];
        enemy.doStep();
    }
}
function reset() {
    stage.removeChildren(0, stage.children.length);
    enemySpaceships = [];
    initHero();
    initEnemies();
    initScoreMessage();
}
function checkColisionBombEnemiesHero() {
    //hit test--------------------------------------------------------
    for (var i = 0; i < enemySpaceships.length; i++) {
        var enemys = enemySpaceships[i];
        if (enemys.live) {
            for (var j = 0; j < fireBombs.length; j++) {
                var bomb = fireBombs[j];
                if (hitTestRectangle(enemys.spaceship, bomb)) {
                    score++;
                    scoreMessage.text = "score: " + score;
                    explodeNow(enemys.spaceship);
                    stage.removeChild(enemys.spaceship);
                    stage.removeChild(bomb);
                    fireBombs.splice(fireBombs.indexOf(bomb), 1);
                    enemys.resetState();
                }
            }
            if (enemys.spaceship.y > GAME.height - hero.height) {
                //console.log("CHECK HIT with hero");
                if (hitTestRectangle(enemys.spaceship, hero)) {
                    explodeNow(hero, function () {
                        stage.removeChildren(0, stage.children.length);
                        enemySpaceships = [];
                        initHero();
                        initEnemies();
                        initScoreMessage();
                    });
                    break;
                }
            }
        }
    }
}

function refreshBombsState() {
    var temp0 = [];
    for (var i = 0; i < fireBombs.length; i++) {
        var fbomb = fireBombs[i];
        fbomb.y += -GAME.velosityShots;
        if (fbomb.y > 0)
            temp0.push(fbomb);
        else
            stage.removeChild(fbomb);
    }
    fireBombs = temp0;
}

function refreshExplosionsState() {
    var temp = [];
    for (var i = 0; i < explosions.length; i++) {
        if (explosions[i].state > explosions[i].qntState) {
            if (typeof (explosions[i].postEffect) != "undefined") {
                explosions[i].postEffect();
                break;
            } else {
                stage.removeChild(explosions[i].obj);
                continue;
            }
        }
        var t = explosions[i].state;
        explosions[i].obj.removeChildren(0, explosions[i].obj.children.length);
        explosions[i].obj.addChild(getSprite(t));
        explosions[i].state += 1;
        temp.push(explosions[i]);
    }
    explosions = temp;
}

};//onload ready