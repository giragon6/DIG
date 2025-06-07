import { ControlKeys } from "../../../utils/types/controlTypes";
import { WorldScene } from "../../../utils/types/sceneTypes";
import { Inventory } from "./inventory/Inventory";
import PlayerAttackState from "./states/PlayerAttackState";
import PlayerClimbState from "./states/PlayerClimbState";
import PlayerIdleState from "./states/PlayerIdleState";
import PlayerInteractState from "./states/PlayerInteractState";
import PlayerJumpState from "./states/PlayerJumpState";
import PlayerRunState from "./states/PlayerRunState";
import PlayerSelectToolState from "./states/PlayerSelectToolState";
import PlayerState from "./states/PlayerState";

export enum PlayerStateName {
    IDLE = 'idle',
    RUN = 'run',
    JUMP = 'jump',
    ATTACK = 'attack',
    INTERACT = 'interact',
    SELECT = 'select',
    WALL_CLIMB = 'wall_climb'
};

export default class PlayerController {
    private states: { [key: string]: PlayerState };
    private currentState: PlayerState;

    private sprite: Phaser.Physics.Arcade.Sprite;
    private scene: WorldScene;

    constructor(
        sprite: Phaser.Physics.Arcade.Sprite,
        initialState: PlayerStateName = PlayerStateName.IDLE,
        keys: ControlKeys,
        scene: WorldScene, 
        inventory: Inventory,
        canClimbWall: () => boolean = () => false
    ) {
        this.sprite = sprite;
        this.scene = scene;
        this.states = {
            idle: new PlayerIdleState(sprite, keys, this),
            run: new PlayerRunState(sprite, keys, this),
            jump: new PlayerJumpState(sprite, keys, this),
            attack: new PlayerAttackState(sprite, keys, this, scene.getWorld(), inventory),
            interact: new PlayerInteractState(sprite, keys, this),
            select: new PlayerSelectToolState(sprite, keys, this, inventory),
            wall_climb: new PlayerClimbState(sprite, keys, this, scene)
        };
        this.setState(initialState);
    }

    setState(state: PlayerStateName): void {
        if (this.currentState == this.states[state]) {
            return;
        }

        this.currentState = this.states[state];
        this.currentState.enter();
    }

    getState(): PlayerState {
        return this.currentState;
    }

    canClimbWall(offset: number = 0): boolean {
        const tileSize = this.scene.getWorld().getTileSize();
        const playerX = this.sprite.x + this.sprite.width / 2;
        const playerY = this.sprite.y + this.sprite.height / 2 + offset;

        console.log(tileSize, playerX, playerY);
        const leftTileX = Math.floor((playerX - this.sprite.width / 2 - 5) / tileSize.width);
        const leftTileY = Math.floor(playerY / tileSize.height);
        const leftTile = this.scene.getWorld().getTilePosition(leftTileX * tileSize.width, leftTileY * tileSize.height);

        const rightTileX = Math.floor((playerX + this.sprite.width / 2 + 5) / tileSize.width);
        const rightTileY = Math.floor(playerY / tileSize.height);
        const rightTile = this.scene.getWorld().getTilePosition(rightTileX * tileSize.width, rightTileY * tileSize.height);

        return (leftTile && leftTile.type !== -1) || (rightTile && rightTile.type !== -1) || false;
    }

}