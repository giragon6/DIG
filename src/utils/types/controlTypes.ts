export interface ControlKeys {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    attack: Phaser.Input.Keyboard.Key;
    interact: Phaser.Input.Keyboard.Key;
}

export enum Direction {
    UP_LEFT,
    UP,
    UP_RIGHT,
    LEFT,
    RIGHT,
    DOWN_LEFT,
    DOWN,
    DOWN_RIGHT
}