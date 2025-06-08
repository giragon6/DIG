import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.load.image('background1', 'assets/backgrounds/game_bg1.png');

        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        this.load.on('progress', (progress: number) => {

            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        this.load.setPath('assets');

        this.load.image('logo', 'title.png');

        this.load.atlas('run', '/player/run.png', '/player/run.json');

        this.load.atlas('idle', '/player/idle.png', '/player/idle.json');

        this.load.spritesheet('ground_tiles', '/map/tiles.png', { frameWidth: 64 });
        // this.load.image('ground_background_tiles', '/map/darkened-tiles.png');
        this.load.image('selection_tiles', '/selection/selection.png');
        this.load.spritesheet('damage_tiles', '/map/tile-damage.png', {frameWidth: 64, frameHeight: 64});

        this.load.image('dump_truck', '/truck.png');

        this.load.atlas('pickaxes', '/items/pickaxes.png', '/items/pickaxes.json');
        this.load.atlas('backpacks', '/items/backpacks.png', '/items/backpacks.json');
    }

    create ()
    {
        this.anims.create({
            key: 'playerIdle',
            frames: this.anims.generateFrameNames('idle', { prefix: 'idle', start: 0, end: 3 }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.create({
            key: 'playerRun', 
            frames: this.anims.generateFrameNames('run', { prefix: 'run', start: 0, end: 6 }),
            frameRate: 6,
            repeat: -1
        });

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
