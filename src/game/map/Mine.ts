import { generateChunk } from "../../utils/generateChunk";

export default class Mine {
    private scene: Phaser.Scene;
    private map: Phaser.Tilemaps.Tilemap;
    private layer: Phaser.Tilemaps.TilemapLayer;

    constructor(scene: Phaser.Scene, mapKey: string) {
        this.scene = scene;
        this.map = scene.make.tilemap({ key: mapKey, tileWidth: 16, tileHeight: 16 });
        const tileset = this.map.addTilesetImage('ground_tiles', 'ground_tiles');
        this.layer = this.map.createBlankLayer('layer1', tileset!, 0, 0)!;
        this.layer.setCollisionByProperty({ collides: true });
    }

    loadChunks(chunkSize: number): void {
        const camera = this.scene.cameras.main;
        const startX = Math.floor(camera.scrollX / chunkSize) * chunkSize;
        const startY = Math.floor(camera.scrollY / chunkSize) * chunkSize;
        const endX = Math.ceil((camera.scrollX + camera.width) / chunkSize) * chunkSize;
        const endY = Math.ceil((camera.scrollY + camera.height) / chunkSize) * chunkSize;
        for (let x = startX; x < endX; x += chunkSize) {
            for (let y = startY; y < endY; y += chunkSize) {
                const chunk_data = generateChunk(chunkSize, y);
                this.map.putTilesAt(chunk_data, x, y);

            }
        }
    }

    getLayer(): Phaser.Tilemaps.TilemapLayer {
        return this.layer;
    }

    getMap(): Phaser.Tilemaps.Tilemap {
        return this.map;
    }
}