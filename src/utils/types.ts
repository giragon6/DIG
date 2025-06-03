import World from "../game/map/World";

export interface ControlKeys {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    attack: Phaser.Input.Keyboard.Key;
    interact: Phaser.Input.Keyboard.Key;
}

export enum BlockType {
    BT_EMPTY = -1,
    BT_DIRT,
    BT_COBBLED_STONE, // legally distinct
    BT_BEDROCK,
    BT_LIGHT_STONE,
    BT_DIAMOND,
    BT_DARK_STONE,
    BT_RUBY,
    BT_SODALITE,
    BT_BERYL
}

export enum SelectionType {
    ST_NONE = -1,
    ST_BLOCK_WO // White outline
}

export interface PlayerSelectedTile {
    x: number;
    y: number;
    type: BlockType;
}

export abstract class WorldScene extends Phaser.Scene {
    abstract getWorld(): World;
}