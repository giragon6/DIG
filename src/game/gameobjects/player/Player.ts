import { ControlKeys } from "../../../utils/types/controlTypes";
import { WorldScene } from "../../../utils/types/sceneTypes";
import { BlockType } from "../../../utils/types/tileTypes";
import PlayerController, { PlayerStateName } from "./PlayerController";
import { Inventory } from "./inventory/Inventory";

export default class Player {
    sprite: Phaser.Physics.Arcade.Sprite;
    private scene: WorldScene;
    private player_key: string;
    private control_keys: ControlKeys;
    private _controller: PlayerController;
    public inventory: Inventory;
    constructor(scene: WorldScene, x: number, y: number, player_key: string, control_keys: ControlKeys, tint: number = 0xffffff) {
        this.scene = scene;
        this.player_key = player_key;
        this.control_keys = control_keys;

        this.sprite = this.scene.physics.add
            .sprite(x, y, this.player_key)
            .setSize(30, 30) 
            .setOrigin(0, 0)
            .setBodySize(14,14,false)
            .setMaxVelocity(300, 400)
            .setBounce(0.2)
            .setScale(4)
            .setCollideWorldBounds(true);

        this.sprite.setTint(tint);
        this.sprite.setData('id', this.player_key);
        this.sprite.data.set('speed', 300);
        this.sprite.data.set('jumpSpeed', 300);

        this.inventory = new Inventory(this.player_key);

        this._controller = new PlayerController(
          this.sprite,
          PlayerStateName.IDLE,
          this.control_keys,
          this.scene,
          this.inventory
        );
        this._controller.getState().enter();
    }

    getControlKeys(): ControlKeys {
        return this.control_keys;
    }

    update() {
        this._controller.getState().update();
    }

    getDamageForMining(): number {
        return this.inventory.getMiningDamage();
    }

    addBlockToInventory(blockType: BlockType, quantity: number = 1): void {
        this.inventory.addBlocks(blockType, quantity);
    }

    setInteracting(isInteracting: boolean): void {
        this._controller.setState(isInteracting ? PlayerStateName.INTERACT : PlayerStateName.IDLE);
    }

    destroy() {
        this.inventory.destroy();
        this.sprite.destroy();
    }
}