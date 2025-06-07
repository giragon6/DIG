import { ControlKeys } from "../../../../utils/types/controlTypes";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerInteractState extends PlayerState {
    constructor(
        sprite: Phaser.Physics.Arcade.Sprite,
        keys: ControlKeys,
        controller: PlayerController
    ) {
        super(sprite, keys, controller);
    }

    enter(): void {
        this.sprite.anims.play('playerIdle', true);
        this.sprite.setVelocityX(0);
    }

    update(): void {}
}