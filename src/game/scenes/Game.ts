import { Scene } from 'phaser';
import Mine from '../map/Mine';
import Player from '../gameobjects/player/Player';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;

    private player1: Player;
    private player2: Player;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        // const mine = new Mine(this, 'mine_map');

        // mine.loadChunks(16);

        this.add.image(0, -200, "background1")
            .setOrigin(0, 0);

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.anims.create({
            key: 'playerIdle',
            frames: this.anims.generateFrameNames('idle', { prefix: 'idle', start: 1, end: 4 }),
            frameRate: 3,
            repeat: -1,
            
        });
        this.anims.create({
            key: 'playerRun',
            frames: this.anims.generateFrameNames('run', { prefix: 'run', start: 1, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        this.player1 = new Player(this, 100, 450, 'player1', {
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            attack: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            interact: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        }, 0xff0000);
        this.player2 = new Player(this, 200, 450, 'player2', {
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            attack: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH),
            interact: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
        }, 0x0055ff);
        // this.physics.add.collider(this.player1.sprite, mine.getLayer());
        // this.physics.add.collider(this.player2.sprite, mine.getLayer());

    }

    update(time: number, delta: number): void {
        this.player1.update();
        this.player2.update();
    }
}
