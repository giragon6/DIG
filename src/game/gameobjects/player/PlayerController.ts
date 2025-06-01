import PlayerIdleState from "./states/PlayerIdleState";
import PlayerJumpState from "./states/PlayerJumpState";
import { PlayerRunLeftState, PlayerRunRightState } from "./states/PlayerRunState";
import PlayerState from "./states/PlayerState";

export enum PlayerStateName {
    IDLE = 'idle',
    RUN_LEFT = 'runLeft',
    RUN_RIGHT = 'runRight',
    JUMP = 'jump'
};

export default class PlayerController {
    private states: { [key: string]: PlayerState };
    private currentState: PlayerState;

    constructor(sprite: Phaser.Physics.Arcade.Sprite, initialState: PlayerStateName = PlayerStateName.IDLE) {
        this.states = {
            idle: new PlayerIdleState(sprite),
            runLeft: new PlayerRunLeftState(sprite),
            runRight: new PlayerRunRightState(sprite),
            jump: new PlayerJumpState(sprite)
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