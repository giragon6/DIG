import { DepthLayerConfig, TerrainConfig } from "../../utils/configInterfaces";
import { BlockType, PlayerSelectedTile } from "../../utils/types";
import ChunkLoader from "./ChunkLoader";
import Mine from "./Mine";
import SelectionMap from "./SelectionMap";

export default class World {
    private mine: Mine;
    private selectionMap: SelectionMap;
    private chunkLoader: ChunkLoader;
    private scene: Phaser.Scene;
    private map: Phaser.Tilemaps.Tilemap;
    private worldWidthTiles: number;
    private worldHeightTiles: number;  

    private chunkWidthTiles: number = 16; 
    private chunkHeightTiles: number = 16; 

    private timer: number = 0;

    private terrainConfig: TerrainConfig = {
        surfaceLevel: 5,
        layers: [
            { startDepth: 0, endDepth: 1, blockType: BlockType.BT_EMPTY },
            { startDepth: 2, endDepth: 3, blockType: BlockType.BT_DIRT },
            { startDepth: 4, endDepth: 30, blockType: BlockType.BT_LIGHT_STONE },
            { startDepth: 30, endDepth: 50, blockType: BlockType.BT_DARK_STONE },
            { startDepth: 50, endDepth: Infinity, blockType: BlockType.BT_DARK_STONE }
        ]
    };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.worldWidthTiles = 100;
        this.worldHeightTiles = 1000;

        this.map = scene.make.tilemap({
            tileWidth: 64,
            tileHeight: 64,
            width: this.worldWidthTiles,
            height: this.worldHeightTiles
        });

        this.mine = new Mine(this.map, this.terrainConfig);
        this.selectionMap = new SelectionMap(scene, this.map);
        this.chunkLoader = new ChunkLoader(this.map, this.scene.cameras.main, this.mine, this.chunkWidthTiles, this.chunkHeightTiles);

        this.chunkLoader.loadChunks();
    }

    getMap(): Phaser.Tilemaps.Tilemap {
        return this.map;
    }

    getMineLayer(): Phaser.Tilemaps.TilemapLayer {
        return this.mine.getLayer();
    }

    getTilePosition(x: number, y: number): PlayerSelectedTile | null {
        const tile = this.mine.getLayer().getTileAtWorldXY(x, y);
        if (!tile) {
            return null; 
        }
        return { x: tile.x, y: tile.y, type: tile.index };
    }
    getSelectionLayer(): Phaser.Tilemaps.TilemapLayer {
        return this.selectionMap.getLayer();
    }

    digTile(playerId: string): void {
        const selectedTile = this.selectionMap.getSelectedTile(playerId);
        if (!selectedTile) {
            return;
        }
        this.selectionMap.deselectTile(playerId);
        this.mine.removeTile(selectedTile);
    }

    setTerrainConfig(config: TerrainConfig): void {
        this.terrainConfig = config;
    }

    addDepthLayer(layer: DepthLayerConfig): void {
        this.terrainConfig.layers.push(layer);
        this.terrainConfig.layers.sort((a, b) => a.startDepth - b.startDepth);
    }

    selectTile(tileX: number, tileY: number, playerId: string): boolean {
        this.selectionMap.deselectTile(playerId);

        const tile = this.mine.getTileAt(tileX, tileY);
        if (!tile || tile.type === BlockType.BT_EMPTY) {
            return false; 
        }

        this.selectionMap.setSelectedTile({
            x: tileX,
            y: tileY,
            type: tile.type
        }, playerId);

        return true;
    }

    update(time: number, delta: number): void {
        this.timer += delta;
        while (this.timer > 250) {
            if (this.chunkLoader.shouldUpdateChunks()) {
                this.chunkLoader.loadChunks();
            }
            this.timer -= 250;
        }
    }

    getTileSize(): { width: number, height: number } {
        return this.mine.getTileSize();
    }
}