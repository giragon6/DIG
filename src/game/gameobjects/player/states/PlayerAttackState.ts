import { BlockType, ControlKeys, Direction, PlayerSelectedTile } from "../../../../utils/types";
import World from "../../../map/World";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerAttackState extends PlayerState {
    private world: World;
    private playerId: string;
    private tilePosition: { x: number, y: number };
    private initialPosition: { x: number, y: number } | null;
    private selectedTile: PlayerSelectedTile | null = null;

    private readonly attackStrength: number = 10; //temp

    constructor(sprite: Phaser.Physics.Arcade.Sprite, keys: ControlKeys, controller: PlayerController, world: World) {
        super(sprite, keys, controller);
        this.world = world;
        this.playerId = this.sprite.getData('id');
    }

    enter() {
        // this.sprite.anims.play('playerPrepareMine', true);
        this.initialPosition = this.world.getTilePosition(this.sprite.x, this.sprite.y + this.sprite.height * this.sprite.scaleY);
        if (this.initialPosition == null) {
            this.controller.setState(PlayerStateName.IDLE);
            return;
        }
        this.tilePosition = {
            x: this.initialPosition.x,
            y: this.initialPosition.y
        };
        this.selectedTile = this.world.selectTile(this.tilePosition.x, this.tilePosition.y, this.playerId);
        if (this.selectedTile == null) {
            this.controller.setState(PlayerStateName.IDLE);
            return;
        }
        this.sprite.setVelocityX(0);
    }

    update() {        
        if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
            const isTileDestroyed = this.world.digTile(this.playerId, this.attackStrength);
            if (isTileDestroyed) this.controller.setState(PlayerStateName.IDLE);
        } else if (
            Phaser.Input.Keyboard.JustDown(this.keys.left) && 
            this.tilePosition.x >= this.initialPosition!.x
        ) {
            this.tilePosition.x -= 1;
            if (this.tilePosition.y === this.initialPosition!.y - 1) {
                this.tilePosition.y += 1;
            } else if (this.selectedTile?.adjacencies?.[Direction.UP_LEFT]) {
                this.tilePosition.y -= 1
            }        
            this.selectedTile = this.world.selectTile(this.tilePosition.x, this.tilePosition.y, this.playerId);
        } else if (
            Phaser.Input.Keyboard.JustDown(this.keys.right) && 
            this.tilePosition.x <= this.initialPosition!.x
        ) {
            console.log('current selected tile position:', this.selectedTile);
            this.tilePosition.x += 1;
            if (this.tilePosition.y === this.initialPosition!.y - 1) {
                this.tilePosition.y += 1;
            } else if (this.selectedTile?.adjacencies?.[Direction.UP_RIGHT]) {
                this.tilePosition.y -= 1
            }
            this.selectedTile = this.world.selectTile(this.tilePosition.x, this.tilePosition.y, this.playerId);
        }
    }
}