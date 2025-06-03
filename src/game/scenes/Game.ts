import Player from '../gameobjects/player/Player';
import { WorldScene } from '../../utils/types';
import World from '../map/World';

export class Game extends WorldScene
{
    camera: Phaser.Cameras.Scene2D.Camera;

    private player1: Player;
    private player2: Player;
    // private bg: Phaser.GameObjects.TileSprite;
    private world: World;

    private mapHeightTiles: number = 128;
    private mapWidthTiles: number = 32;

    constructor ()
    {
        super('Game');
    }

    create ()
    {        
        this.physics.world.setBounds(0, 0, 2304, 1296, true, true, true, false); // size of bg image

        // this.bg = this.add.tileSprite(0, 0, 2304, 1296, 'background1')   
        // this.bg.setScrollFactor(1);
        // this.bg.setOrigin(0, 0);
        // this.bg.setTileScale(0.5, 0.5); // Adjust tile scale to fit the camera view

        this.camera = this.cameras.main;

        this.world = new World(this);

        this.player1 = new Player(this, 100, 200, 'player1', {
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            attack: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            interact: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        }, 0xff0000);

        this.camera.startFollow(this.player1.sprite, true, 0.05, 0.05);
        // this.camera.setBounds(0, 0, this.mapHeightTiles * this.world.getTileSize().height, this.mapWidthTiles * this.world.getTileSize().width, true);
        // this.camera.setBounds(0, 0, 2304, 1296, true);

        this.player2 = new Player(this, 200, 200, 'player2', {
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            attack: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH),
            interact: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
        }, 0x0055ff);

        this.physics.add.collider(this.player1.sprite, this.world.getMineLayer());
        this.physics.add.collider(this.player2.sprite, this.world.getMineLayer());
    }

    update(time: number, delta: number): void {
        this.world.update(time, delta);

        this.player1.update();
        this.player2.update();
    }

    getWorld(): World {
        return this.world;
    }
}
