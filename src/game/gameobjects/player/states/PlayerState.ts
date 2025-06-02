import { ControlKeys } from "../../../../utils/types";
import PlayerController from "../PlayerController";

export default abstract class PlayerState {
    protected sprite: Phaser.Physics.Arcade.Sprite;
    protected keys: ControlKeys;
    protected controller: PlayerController;

    constructor(sprite: Phaser.Physics.Arcade.Sprite, keys: ControlKeys, controller: PlayerController) {
        this.sprite = sprite;
        this.keys = keys;
        this.controller = controller;
    };
    
    abstract enter(): void;

    abstract update(): void;
}