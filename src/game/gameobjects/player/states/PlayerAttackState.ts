import { ControlKeys, Direction } from "../../../../utils/types/controlTypes";
import { PlayerSelectedTile } from "../../../../utils/types/tileTypes";
import World from "../../../map/World";
import { Inventory } from "../inventory/Inventory";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerAttackState extends PlayerState {
    private world: World;
    private playerId: string;
    private tilePosition: { x: number, y: number };
    private initialPosition: { x: number, y: number } | null;
    private selectedTile: PlayerSelectedTile | null = null;
    private inventory: Inventory;

    private attackStrength: number; //temp

    constructor(
        sprite: Phaser.Physics.Arcade.Sprite,
        keys: ControlKeys,
        controller: PlayerController,
        world: World,
        inventory: Inventory
    ) {
        super(sprite, keys, controller);
        this.world = world;
        this.playerId = this.sprite.getData('id');
        this.inventory = inventory;
        this.attackStrength = inventory.getMiningDamage();
    }

    enter() {
        // this.sprite.anims.play('playerPrepareMine', true);
        this.initialPosition = this.world.getTilePosition(this.sprite.x + this.sprite.width, this.sprite.y + this.sprite.height * this.sprite.scaleY * 2);
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
            if(!this.inventory.isAtCapacity()) {
                const isTileDestroyed = this.world.digTile(this.playerId, this.attackStrength);
                if (isTileDestroyed) {
                    if (this.selectedTile) this.inventory.addBlocks(this.selectedTile!.type, 1);
                    this.controller.setState(PlayerStateName.IDLE);
                }
            }
        } // Confirm attack/dig
        
        else if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
            console.log("up key pressed");
            this.world.deselectTile(this.playerId);
            this.controller.setState(PlayerStateName.IDLE);
        } // Cancel attack/dig
        
        else if (Phaser.Input.Keyboard.JustDown(this.keys.left)) {

            if (this.tilePosition.x >= this.initialPosition!.x) {
                if (this.tilePosition.y === this.initialPosition!.y - 2) {
                    this.tilePosition.y += 1;
                } else {
                    this.tilePosition.x -= 1;
                    if (this.tilePosition.y === this.initialPosition!.y - 1) {
                        this.tilePosition.y += 1;
                    } else if (this.selectedTile?.adjacencies?.[Direction.UP_LEFT]) {
                        this.tilePosition.y -= 1
                    }
                }
            } 
            
            else if (
              this.tilePosition.x == this.initialPosition!.x - 1 &&
              this.tilePosition.y == this.initialPosition!.y - 1 &&
              this.selectedTile?.adjacencies?.[Direction.UP]
            ) {
                console.log(this.selectedTile.adjacencies)
                this.tilePosition.y -= 1;
            } // Go up if already at left edge

            this.selectedTile = this.world.selectTile(this.tilePosition.x, this.tilePosition.y, this.playerId);
        } 
        
        else if (Phaser.Input.Keyboard.JustDown(this.keys.right)) {

            if (this.tilePosition.x <= this.initialPosition!.x) {
                if (this.tilePosition.y === this.initialPosition!.y - 2) {
                    this.tilePosition.y += 1;
                } else {
                    this.tilePosition.x += 1;
                    if (this.tilePosition.y === this.initialPosition!.y - 1) {
                        this.tilePosition.y += 1;
                    } else if (this.selectedTile?.adjacencies?.[Direction.UP_RIGHT]) {
                        this.tilePosition.y -= 1
                    }
                }
            } 
            
            else if (
              this.tilePosition.x == this.initialPosition!.x + 1 &&
              this.tilePosition.y == this.initialPosition!.y - 1 &&
              this.selectedTile?.adjacencies?.[Direction.UP]
            ) {
              this.tilePosition.y -= 1;
            } // Go up if already at right edge

            this.selectedTile = this.world.selectTile(this.tilePosition.x, this.tilePosition.y, this.playerId);
        } 
    }
}