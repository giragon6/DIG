import { ControlKeys } from "../../../../utils/types";
import Mine from "../../../map/Mine";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerAttackState extends PlayerState {
    private mine: Mine;
    private playerId: string;
    private tilePosition: { x: number, y: number };
    private initialPosition: { x: number, y: number } | null;

    constructor(sprite: Phaser.Physics.Arcade.Sprite, keys: ControlKeys, controller: PlayerController, mine: Mine) {
        super(sprite, keys, controller);
        this.mine = mine;
        this.playerId = this.sprite.getData('id');
    }

    enter() {
        // this.sprite.anims.play('playerPrepareMine', true);
        this.initialPosition = this.mine.getTilePosition(this.sprite.x, this.sprite.y + this.sprite.height * this.sprite.scaleY);
        if (this.initialPosition == null) {
            this.controller.setState(PlayerStateName.IDLE);
            return;
        }
        this.tilePosition = {
            x: this.initialPosition.x,
            y: this.initialPosition.y
        };
        const success = this.mine.selectTile(this.tilePosition.x, this.tilePosition.y, this.playerId);
        if (!success) {
            this.controller.setState(PlayerStateName.IDLE);
            return;
        }
        this.sprite.setVelocityX(0);
    }

    update() {
        if (this.keys.interact.isDown) {
            this.mine.digTile(this.playerId);
            this.controller.setState(PlayerStateName.IDLE);
        } else if (this.keys.left.isDown && this.tilePosition.x >= this.initialPosition!.x) {
            this.tilePosition.x -= 1
        } else if (this.keys.right.isDown && this.tilePosition.x <= this.initialPosition!.x) {
            this.tilePosition.x += 1;
        }

        this.mine.selectTile(this.tilePosition.x, this.tilePosition.y, this.playerId);

    }
}