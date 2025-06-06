import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.add.image(512, 384, 'menu_background');

        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        this.load.on('progress', (progress: number) => {

            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');

        this.load.image('background1', '/backgrounds/game_bg1.png');

        this.load.atlas('run', '/player/run.png', '/player/run.json');

        this.load.atlas('idle', '/player/idle.png', '/player/idle.json');

        this.load.spritesheet('ground_tiles', '/map/tiles.png', { frameWidth: 64 });
        // this.load.image('ground_background_tiles', '/map/darkened-tiles.png');
        this.load.image('selection_tiles', '/selection/selection.png');
        this.load.image('damage_tiles', '/map/tile-damage.png');
    }

    create ()
    {
        this.anims.create({
            key: 'playerIdle',
            frames: this.anims.generateFrameNames('idle', { prefix: 'idle', start: 1, end: 4 }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.create({
            key: 'playerRun',
            frames: this.anims.generateFrameNames('run', { prefix: 'run', start: 1, end: 8 }),
            frameRate: 6,
            repeat: -1
        });

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
