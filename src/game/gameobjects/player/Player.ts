import { ControlKeys, MineScene } from "../../../utils/types";
import PlayerController, { PlayerStateName } from "./PlayerController";

export default class Player {

    sprite: Phaser.Physics.Arcade.Sprite;
    private scene: MineScene;
    private player_key: string;
    private control_keys: ControlKeys;

    private _controller: PlayerController;
    
    constructor(scene: MineScene, x: number, y: number, player_key: string, control_keys: ControlKeys, tint: number = 0xffffff) {
        this.scene = scene;
        this.player_key = player_key;
        this.control_keys = control_keys;

        this.sprite = this.scene.physics.add
            .sprite(x, y, this.player_key)
            .setBodySize(11,14,false)
            .setOrigin(0.5, 0.5)
            .setMaxVelocity(300, 400)
            .setBounce(0.2)
            .setScale(5)

        this.sprite.setTint(tint);

        this.sprite.setData('id', this.player_key);

        this.sprite.data.set('speed', 300);
        this.sprite.data.set('jumpSpeed', 200);

        this._controller = new PlayerController(this.sprite, PlayerStateName.IDLE, this.control_keys, this.scene);
        this._controller.getState().enter();
    }

    update() {
        this._controller.getState().update();
    }

    destroy() {
    this.sprite.destroy();
    }
}
