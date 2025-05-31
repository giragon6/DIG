import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    
    private player1: Phaser.Physics.Arcade.Sprite;
    private p1Speed = 160;
    private player2: Phaser.Physics.Arcade.Sprite;
    private p2Speed = 160;
    private ground: Phaser.Physics.Arcade.StaticGroup;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys: any;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.ground = this.physics.add.staticGroup();
        this.ground.create(512, 700, 'ground').setScale(2).refreshBody();

        this.player1 = this.physics.add.sprite(100, 450, 'player1');
        this.player2 = this.physics.add.sprite(200, 450, 'player2');

        this.player1.setBounce(0.2);
        this.player1.setCollideWorldBounds(true);
        this.player2.setBounce(0.2);
        this.player2.setCollideWorldBounds(true);

        this.physics.add.collider(this.player1, this.ground);
        this.physics.add.collider(this.player2, this.ground);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys({
            up: 'W',
            left: 'A',
            down: 'S',
            right: 'D'
        });
    }

    update(time: number, delta: number): void {
        if (this.wasdKeys.left.isDown) {
            this.player1.setVelocityX(this.p1Speed * -1);
        } else if (this.wasdKeys.right.isDown) {
            this.player1.setVelocityX(this.p1Speed);
        }
        else {
            this.player1.setVelocityX(0);
        }
        if (this.wasdKeys.up.isDown && this.player1.body.touching.down) {
            this.player1.setVelocityY(-330);
        }

        if (this.cursors.left.isDown) {
            this.player2.setVelocityX(this.p2Speed * -1);
        } else if (this.cursors.right.isDown) {
            this.player2.setVelocityX(this.p2Speed);
        }
        else {
            this.player2.setVelocityX(0);
        }
        if (this.cursors.up.isDown && this.player2.body.touching.down) {
            this.player2.setVelocityY(-330);
        }
        if (this.cursors.down.isDown) {
            this.player2.setVelocityY(330);
        }
        
    }
}
