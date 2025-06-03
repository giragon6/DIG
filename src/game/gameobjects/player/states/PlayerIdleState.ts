import { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerIdleState extends PlayerState {
    enter(): void {
        this.sprite.anims.play('playerIdle', true);
        this.sprite.setVelocityX(0);
    }

    update(): void {
        if (this.keys.left.isDown) {
            this.controller.setState(PlayerStateName.RUN);
        } else if (this.keys.right.isDown) {
            this.controller.setState(PlayerStateName.RUN);
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.up) && this.sprite.body!.blocked.down) {
            this.controller.setState(PlayerStateName.JUMP);
        } else if (this.keys.attack.isDown) {
            this.controller.setState(PlayerStateName.ATTACK);
        }
    }
}