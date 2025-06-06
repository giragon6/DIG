import { ControlKeys } from "../../../../utils/types/controlTypes";
import { WorldScene } from "../../../../utils/types/sceneTypes";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerIdleState extends PlayerState {
    constructor(
        sprite: Phaser.Physics.Arcade.Sprite,
        keys: ControlKeys,
        controller: PlayerController,
        private scene: WorldScene
    ) {
        super(sprite, keys, controller);
    }

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
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
            this.scene.handleDumpTruckInteraction(this.sprite.getData('id'));
            this.controller.setState(PlayerStateName.INTERACT);
        }
    }
}