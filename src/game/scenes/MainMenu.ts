import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    private numPlayers: number = 1;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'menu_background');

        this.logo = this.add.image(512, 300, 'logo').setScale(3);

        this.title = this.add.text(512, 460, 'PRESS E TO START', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 520, 'Use number keys 1-4 to set player count', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 550, 'P1: WASD+QE | P2: Arrows+/Shift | P3: TFGH+RY | P4: IJKL+UO', {
            fontFamily: 'Arial Black', fontSize: 16, color: '#ffffff',
            stroke: '#000000', strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard?.on('keydown-ONE', () => {
            this.numPlayers = 1;
            this.title.setText('1 PLAYER SELECTED');
        }
        );
        this.input.keyboard?.on('keydown-TWO', () => {
            this.numPlayers = 2;
            this.title.setText('2 PLAYERS SELECTED');
        }
        );
        this.input.keyboard?.on('keydown-THREE', () => {
            this.numPlayers = 3;
            this.title.setText('3 PLAYERS SELECTED');
        }
        );
        this.input.keyboard?.on('keydown-FOUR', () => {
            this.numPlayers = 4;
            this.title.setText('4 PLAYERS SELECTED');
        }
        );

        this.input.keyboard?.on('keydown-E', () => {
            this.scene.start('Game', {numPlayers: this.numPlayers});
        })
        
    }
}
