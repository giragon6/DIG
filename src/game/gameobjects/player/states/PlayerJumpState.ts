export default class PlayerJumpState {
    sprite: Phaser.Physics.Arcade.Sprite;

    constructor(sprite: Phaser.Physics.Arcade.Sprite) {
        this.sprite = sprite;
    }

    enter() {
        // this.sprite.anims.play('playerJump', true);
        this.sprite.setVelocityY(-300);
    }
}