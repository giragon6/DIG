import Mine from "../game/map/Mine";

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
    BT_STONE,
    BT_BEDROCK,
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

export abstract class MineScene extends Phaser.Scene {
    abstract getMine(): Mine;
}