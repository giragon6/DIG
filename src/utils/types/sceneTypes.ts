import World from "../../game/map/World";

export abstract class WorldScene extends Phaser.Scene {
    abstract getWorld(): World;
}