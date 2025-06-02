import { Scene } from 'phaser';
import Mine from '../map/Mine';
import Player from '../gameobjects/player/Player';
import { MineScene } from '../../utils/types';

export class Game extends MineScene
{
    camera: Phaser.Cameras.Scene2D.Camera;

    private player1: Player;
    private player2: Player;
    private mine: Mine;

    constructor ()
    {
        super('Game');
    }

    create ()
    {        
        this.add.image(0, -200, "background1")
            .setOrigin(0, 0);

        this.camera = this.cameras.main;

        this.mine = new Mine(this);

        this.mine.loadChunks(16, 16);

        this.player1 = new Player(this, 100, 200, 'player1', {
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            attack: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            interact: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        }, 0xff0000);
        this.camera.startFollow(this.player1.sprite, true, 0.05, 0.05);

        this.player2 = new Player(this, 200, 200, 'player2', {
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            attack: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH),
            interact: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
        }, 0x0055ff);

        this.physics.add.collider(this.player1.sprite, this.mine.getLayer());
        this.physics.add.collider(this.player2.sprite, this.mine.getLayer());
    }

    update(): void {
        this.player1.update();
        this.player2.update();
    }

    getMine(): Mine {
        return this.mine;
    }
}
