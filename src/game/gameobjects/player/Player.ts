import { ControlKeys } from "../../../utils/types";
import PlayerController, { PlayerStateName } from "./PlayerController";

export default class Player {

    sprite: Phaser.Physics.Arcade.Sprite;
    private scene: Phaser.Scene;
    private player_key: string;
    private control_keys: ControlKeys;

    private _controller: PlayerController;
    
    constructor(scene: Phaser.Scene, x: number, y: number, player_key: string, control_keys: ControlKeys, tint: number = 0xffffff) {
        this.scene = scene;
        this.player_key = player_key;
        this.control_keys = control_keys;

        this.sprite = scene.physics.add
            .sprite(x, y, player_key)
            .setMaxVelocity(300, 400)
            .setBounce(0.2)
            .setScale(5)
            .setCollideWorldBounds(true);

        this.sprite.setTint(tint);
        
        this._controller = new PlayerController(this.sprite, PlayerStateName.IDLE);
    }

    update() {
        const keys = this.control_keys;
        const sprite = this.sprite;
        const onGround = sprite.body!.blocked.down;

        if (keys.left.isDown) {
            this._controller.setState(PlayerStateName.RUN_LEFT);
        } else if (keys.right.isDown) {
            this._controller.setState(PlayerStateName.RUN_RIGHT);
        } else {
            this._controller.setState(PlayerStateName.IDLE);
        }

        if (keys.up.isDown && onGround) {
            this._controller.setState(PlayerStateName.JUMP);
        }
    }

    destroy() {
    this.sprite.destroy();
    }
}
