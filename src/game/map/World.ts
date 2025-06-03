import { DepthLayerConfig, TerrainConfig } from "../../utils/configInterfaces";
import { BlockType, Direction, PlayerSelectedTile } from "../../utils/types";
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
        ],
        oreLayers: [
            { startDepth: 10, endDepth: 20, blockType: BlockType.BT_DIAMOND, chance: 0.05 },
            { startDepth: 15, endDepth: 25, blockType: BlockType.BT_RUBY, chance: 0.1 },
            { startDepth: 20, endDepth: 30, blockType: BlockType.BT_SODALITE, chance: 0.15 },
            { startDepth: 25, endDepth: 40, blockType: BlockType.BT_BERYL, chance: 0.2 }
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
        this.chunkLoader = new ChunkLoader(this.map, this.scene.cameras.main, this.mine, this.chunkWidthTiles, this.chunkHeightTiles, this.worldWidthTiles);

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

    digTile(playerId: string, damage: number, autoDestroy: boolean = false): boolean {
        const selectedTile = this.selectionMap.getSelectedTile(playerId);
        if (!selectedTile) {
            return true; // No tile selected
        }
        if (autoDestroy) {
            this.mine.removeTile(selectedTile);
            this.selectionMap.deselectTile(playerId);
            return true;
        }
        const isTileDestroyed = this.mine.damageTile(selectedTile, damage);
        if (isTileDestroyed) {
            this.selectionMap.deselectTile(playerId);
            return true
        }
        return false;
    }

    setTerrainConfig(config: TerrainConfig): void {
        this.terrainConfig = config;
    }

    addDepthLayer(layer: DepthLayerConfig): void {
        this.terrainConfig.layers.push(layer);
        this.terrainConfig.layers.sort((a, b) => a.startDepth - b.startDepth);
    }

    selectTile(tileX: number, tileY: number, playerId: string): PlayerSelectedTile | null {
        this.selectionMap.deselectTile(playerId);

        const tile = this.mine.getTileAt(tileX, tileY);
        if (!tile || tile.type === BlockType.BT_EMPTY) {
            return null; 
        }

        const adjacentTiles = {
            [Direction.UP_LEFT]: this.mine.getTileAt(tileX - 1, tileY - 1), 
            [Direction.UP]: this.mine.getTileAt(tileX, tileY - 1), 
            [Direction.UP_RIGHT]: this.mine.getTileAt(tileX + 1, tileY - 1), 
            [Direction.LEFT]: this.mine.getTileAt(tileX - 1, tileY), 
            [Direction.RIGHT]: this.mine.getTileAt(tileX + 1, tileY),
            [Direction.DOWN_LEFT]: this.mine.getTileAt(tileX - 1, tileY + 1),
            [Direction.DOWN]: this.mine.getTileAt(tileX, tileY + 1),
            [Direction.DOWN_RIGHT]: this.mine.getTileAt(tileX + 1, tileY + 1)
        }

        const adjacencies: { [key in Direction]?: boolean } = {
            [Direction.UP_LEFT]: adjacentTiles[Direction.UP_LEFT] ? adjacentTiles[Direction.UP_LEFT].type !== BlockType.BT_EMPTY : false,
            [Direction.UP]: adjacentTiles[Direction.UP] ? adjacentTiles[Direction.UP].type !== BlockType.BT_EMPTY : false,
            [Direction.UP_RIGHT]: adjacentTiles[Direction.UP_RIGHT] ? adjacentTiles[Direction.UP_RIGHT].type !== BlockType.BT_EMPTY : false,
            [Direction.LEFT]: adjacentTiles[Direction.LEFT] ? adjacentTiles[Direction.LEFT].type !== BlockType.BT_EMPTY : false,
            [Direction.RIGHT]: adjacentTiles[Direction.RIGHT] ? adjacentTiles[Direction.RIGHT].type !== BlockType.BT_EMPTY : false,
            [Direction.DOWN_LEFT]: adjacentTiles[Direction.DOWN_LEFT] ? adjacentTiles[Direction.DOWN_LEFT].type !== BlockType.BT_EMPTY : false,
            [Direction.DOWN]: adjacentTiles[Direction.DOWN] ? adjacentTiles[Direction.DOWN].type !== BlockType.BT_EMPTY : false,
            [Direction.DOWN_RIGHT]: adjacentTiles[Direction.DOWN_RIGHT] ? adjacentTiles[Direction.DOWN_RIGHT].type !== BlockType.BT_EMPTY : false
        };

        const selectedTile = {
            x: tileX,
            y: tileY,
            type: tile.type,
            adjacencies: adjacencies
        }

        this.selectionMap.setSelectedTile(selectedTile, playerId);

        return selectedTile;
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