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

export interface Chunk {
    size: number;
    x: number;
    y: number;
    data: BlockType[][];
}