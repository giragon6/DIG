import { ControlKeys } from "../../../../utils/types";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerJumpState extends PlayerState {
    jump_speed: number;

    constructor(sprite: Phaser.Physics.Arcade.Sprite, keys: ControlKeys, controller: PlayerController) {
        super(sprite, keys, controller);
        this.jump_speed = sprite.data.get('jump_speed') || 200;
    }

    enter() {
        // this.sprite.anims.play('playerJump', true);
        this.sprite.setVelocityY(-this.jump_speed);
    }

    update() {
        if (this.sprite.body!.blocked.down) {
            this.controller.setState(PlayerStateName.IDLE);
        } else if (this.keys.left.isDown) {
            this.sprite.setVelocityX(-this.jump_speed);
        } else if (this.keys.right.isDown) {
            this.sprite.setVelocityX(this.jump_speed);
        } else {
            this.sprite.setVelocityX(0);
        }
    }
}