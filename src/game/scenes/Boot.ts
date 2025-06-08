import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {

        this.load.image('background1', 'assets/backgrounds/game_bg1.png');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
