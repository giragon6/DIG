import { ControlKeys } from "../../../utils/types/controlTypes";
import { WorldScene } from "../../../utils/types/sceneTypes";
import { Inventory } from "./inventory/Inventory";
import PlayerAttackState from "./states/PlayerAttackState";
import PlayerIdleState from "./states/PlayerIdleState";
import PlayerInteractState from "./states/PlayerInteractState";
import PlayerJumpState from "./states/PlayerJumpState";
import PlayerRunState from "./states/PlayerRunState";
import PlayerState from "./states/PlayerState";

export enum PlayerStateName {
    IDLE = 'idle',
    RUN = 'run',
    JUMP = 'jump',
    ATTACK = 'attack',
    INTERACT = 'interact'
};

export default class PlayerController {
    private states: { [key: string]: PlayerState };
    private currentState: PlayerState;

    constructor(
        sprite: Phaser.Physics.Arcade.Sprite,
        initialState: PlayerStateName = PlayerStateName.IDLE,
        keys: ControlKeys,
        scene: WorldScene, 
        inventory: Inventory
    ) {
        this.states = {
            idle: new PlayerIdleState(sprite, keys, this, scene),
            run: new PlayerRunState(sprite, keys, this),
            jump: new PlayerJumpState(sprite, keys, this),
            attack: new PlayerAttackState(sprite, keys, this, scene.getWorld(), inventory),
            interact: new PlayerInteractState(sprite, keys, this)
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

}