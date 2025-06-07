import { ControlKeys } from "../../../../utils/types/controlTypes";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerIdleState extends PlayerState {
    private canClimbWall: () => boolean;

    constructor(
        sprite: Phaser.Physics.Arcade.Sprite,
        keys: ControlKeys,
        controller: PlayerController,
    ) {
        super(sprite, keys, controller);
    }

    enter(): void {
        this.sprite.anims.play('playerIdle', true);
        this.sprite.setVelocityX(0);
    }

    update(): void {
        if (this.keys.left.isDown || this.keys.right.isDown) {
            this.controller.setState(PlayerStateName.RUN);
        } else if (this.keys.up.isDown && this.sprite.body!.blocked.down) {
            this.controller.setState(PlayerStateName.JUMP);
        } else if (this.keys.attack.isDown) {
            this.controller.setState(PlayerStateName.ATTACK);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.interact) && this.controller.canClimbWall()) {
            this.controller.setState(PlayerStateName.WALL_CLIMB);
        }
    }
}