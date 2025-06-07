import { ControlKeys, Direction } from "../../../../utils/types/controlTypes";
import { Inventory } from "../inventory/Inventory";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerAttackState extends PlayerState {
    private inventory: Inventory;

    constructor(
        sprite: Phaser.Physics.Arcade.Sprite,
        keys: ControlKeys,
        controller: PlayerController,
        inventory: Inventory
    ) {
        super(sprite, keys, controller);
        this.inventory = inventory;
    }

    enter() {
        this.sprite.setVelocityX(0);
        this.inventory.setUIVisible(true);
    }

    update() {        
        if (Phaser.Input.Keyboard.JustDown(this.keys.right)) {
            this.inventory.selectNextTool();
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.left)) {
            this.inventory.selectPreviousTool();
        } else if (!this.keys.interact.isDown) {
            this.inventory.setUIVisible(false);
            this.controller.setState(PlayerStateName.IDLE);
        }
    }
}