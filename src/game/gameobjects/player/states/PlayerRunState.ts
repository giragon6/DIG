import { ControlKeys } from "../../../../utils/types";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerRunState extends PlayerState {
    speed: number;

    constructor(sprite: Phaser.Physics.Arcade.Sprite, keys: ControlKeys, controller: PlayerController) {
        super(sprite, keys, controller);
        this.speed = this.sprite.data.get('speed') || 300;
    }

    enter() {
        this.sprite.anims.play('playerRun', true);
    }

    update() {
        if (this.keys.left.isDown) {
            this.sprite.setVelocityX(-this.speed);
            this.sprite.setFlipX(true);
        } else if (this.keys.right.isDown) {
            this.sprite.setVelocityX(this.speed);
            this.sprite.setFlipX(false);
        } else {
            this.sprite.setVelocityX(0);
            this.controller.setState(PlayerStateName.IDLE);
        }

        if (this.keys.up.isDown && this.sprite.body!.blocked.down) {
            this.controller.setState(PlayerStateName.JUMP);
        }

        if (this.keys.attack.isDown) {
            this.controller.setState(PlayerStateName.ATTACK);
        }
    }
}