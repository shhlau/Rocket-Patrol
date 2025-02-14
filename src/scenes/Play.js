class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        //load images/tile sprite
        this.load.image('rocket', './assets/rocket2.png');
        this.load.image('spaceship', './assets/spaceship2.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.image('spaceflight', './assets/spaceflight.gif');
        //load spritesheet
      
        this.load.spritesheet('explosion', './assets/explosion1.png', { frameWidth: 64, frameheight: 32, startFrame: 0,
        endFrame: 9});
    }

    create() {
        //place tile
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);

        //white rectangle borders
        this.add.rectangle(5, 5, 630, 32, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(5, 443, 630, 32, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(5, 5, 32, 455, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(603, 5, 32, 455, 0xFFFFFF).setOrigin(0, 0);
        //green ui background
        this.add.rectangle(37, 42, 566, 64, 0x00FF00).setOrigin(0,0);

        //add rocket(p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, 431, 'rocket').setScale(0.5, 0.5).setOrigin(0, 0);

        this.ship01 = new Spaceship(this, game.config.width + 92, Math.floor(Math.random()*150)+100, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + 96, Math.floor(Math.random()*150)+100, 'spaceship', 0, 20).setOrigin(0, 0);
        this.ship03 = new Spaceship(this, game.config.width,  Math.floor(Math.random()*150)+100, 'spaceship', 0, 10).setOrigin(0, 0);

        this.ship04 = new smallship(this, game.config.width, Math.floor(Math.random()*150)+100, 'spaceflight', 0, 15).setOrigin(0, 0);

        //define keyboard keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        //animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        //score
        this.p1Score = 0;
        //score display
        let scoreConfig  = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor:  '#F3B141',
            color:  '#843605',  
            allign: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(69, 54, this.p1Score, scoreConfig);
        //game over flag
        this.gameOver = false;

        //60 seconds clock
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'Game Over', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, '(F)ire to Restart or ← for Menu',
        scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);
    }

    update() {
        //check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyF)) {
            this.scene.restart(this.p1Score);
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLeft)) {
            this.scene.start("menuScene");
        }
        //scroll stars
        this.starfield.tilePositionX -= 4;

        //diagonal
        //this.starfield.tilePositionY -= 4;

        if (!this.gameOver) {
            //update rocket
            this.p1Rocket.update();
            //update ship
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
            this.ship04.update();
        }


        //check collisions
        if(this.checkCollision(this.p1Rocket, this.ship04)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship04);
        }
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if(this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if(this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
    }

    checkCollision(rocket, ship) {
        //simple AABB checking
        if (rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y) {
                return true;
            } else {
                return false;
            }
        }
        
    shipExplode(ship) {
        ship.alpha = 0;
            //create explosion at ship position
        let boom = this.add.sprite(ship.x, ship.y,'explosion').setOrigin(0, 0);
        boom.anims.play('explode');             //explode 
        boom.on('animationcomplete', () => {    //call back after animation completes
            ship.reset();                       //reset ship position
            ship.alpha = 1;                     //make ship visible again
            boom.destroy();                     //remove explosion
        });
        //score increment and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;
        //sound
        this.sound.play('sfx_explosion');
    }
}