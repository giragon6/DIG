export default class PlayerIdleState {
    sprite: Phaser.Physics.Arcade.Sprite;

    constructor(sprite: Phaser.Physics.Arcade.Sprite) {
        this.sprite = sprite;
    }

    enter() {
        this.sprite.anims.play('playerIdle', true);
        this.sprite.setVelocityX(0);
    }
}