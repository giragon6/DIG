abstract class PlayerRunState {
    sprite: Phaser.Physics.Arcade.Sprite;

    constructor(sprite: Phaser.Physics.Arcade.Sprite) {
        this.sprite = sprite;
    }

    enter() {
        this.sprite.anims.play('playerRun', true);

        const speed = 600;
        this.sprite.setVelocityX(this.sprite.flipX ? -speed : speed);
    }
}

export class PlayerRunLeftState extends PlayerRunState {
    enter() {
        this.sprite.setFlipX(true);
        super.enter();
    }
}

export class PlayerRunRightState extends PlayerRunState {
    enter() {
        this.sprite.setFlipX(false);
        super.enter();
    }
}