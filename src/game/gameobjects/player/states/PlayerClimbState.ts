import { ControlKeys } from "../../../../utils/types/controlTypes";
import { WorldScene } from "../../../../utils/types/sceneTypes";
import { BlockType } from "../../../../utils/types/tileTypes";
import PlayerController, { PlayerStateName } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class PlayerClimbState extends PlayerState {
    private scene: WorldScene;
    private climbSpeed: number;
    private wallSide: 'left' | 'right';
    private canClimbWall: () => boolean;

    constructor(
        sprite: Phaser.Physics.Arcade.Sprite, 
        keys: ControlKeys, 
        controller: PlayerController, 
        scene: WorldScene,
    ) {
        super(sprite, keys, controller);
        this.scene = scene;
        this.climbSpeed = 150;
        this.wallSide = 'right';
    }

    enter(): void {
        this.sprite.setVelocityX(0);
        this.sprite.setVelocityY(0);
        
        // Store original gravity and disable it
        if (!this.sprite.data.get('originalGravityY')) {
            this.sprite.data.set('originalGravityY', this.sprite.body!.gravity.y);
        }
        this.sprite.data.set('originalGravityY', this.sprite.body!.gravity.y);
        this.sprite.setGravityY(0);
        
        this.wallSide = this.determineWallSide();
        
        console.log(`Started wall climbing on ${this.wallSide} side`);
    }

    update(): void {
        if (!this.controller.canClimbWall(32)) {
            this.exitWallClimbing();
            return;
        }

        if (this.keys.up.isDown) {
            this.sprite.setVelocityY(-this.climbSpeed);
        } else if (this.keys.down.isDown) {
            this.sprite.setVelocityY(this.climbSpeed);
        } else {
            this.sprite.setVelocityY(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
            this.exitWallClimbing();
            return;
        }

        if (this.wallSide === 'right' && this.keys.left.isDown) {
            this.exitWallClimbing();
            this.sprite.setVelocityX(-200);
        } else if (this.wallSide === 'left' && this.keys.right.isDown) {
            this.exitWallClimbing();
            this.sprite.setVelocityX(200);
        }

        if (this.keys.up.isDown && (this.keys.left.isDown || this.keys.right.isDown)) {
            this.exitWallClimbing();
            this.sprite.setVelocityY(-250); 
            if (this.keys.left.isDown) {
                this.sprite.setVelocityX(-200);
            } else if (this.keys.right.isDown) {
                this.sprite.setVelocityX(200);
            }
        }
    }

    private determineWallSide(): 'left' | 'right' {
        const tileSize = this.scene.getWorld().getTileSize();
        const playerX = this.sprite.x + this.sprite.width / 2;
        const playerY = this.sprite.y + this.sprite.height / 2;
        
        const rightTileX = Math.floor((playerX + this.sprite.width / 2 + 5) / tileSize.width);
        const rightTileY = Math.floor(playerY / tileSize.height);
        const rightTile = this.scene.getWorld().getTilePosition(rightTileX * tileSize.width, rightTileY * tileSize.height);
        
        if (rightTile && rightTile.type !== BlockType.BT_EMPTY) {
            return 'right';
        }
        
        return 'left';
    }

    private exitWallClimbing(): void {
        const originalGravity = this.sprite.data.get('originalGravityY') || 0;
        this.sprite.setGravityY(originalGravity);
        
        console.log('Exited wall climbing');
        this.controller.setState(PlayerStateName.IDLE);
    }
}
