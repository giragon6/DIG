import { DepthLayerConfig, TerrainConfig } from "../../utils/configInterfaces";
import { Direction } from "../../utils/types/controlTypes";
import { BlockType, PlayerSelectedTile } from "../../utils/types/tileTypes";
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

    private readonly tileWidth: number = 64;
    private readonly tileHeight: number = 64;

    private timer: number = 0;

    private terrainConfig: TerrainConfig = {
        surfaceLevel: 5,
        layers: [],
        oreLayers: [
            { startDepth: 10, endDepth: 20, blockType: BlockType.BT_DIAMOND, chance: 0.005 },
            { startDepth: 15, endDepth: 25, blockType: BlockType.BT_RUBY, chance: 0.01 },
            { startDepth: 20, endDepth: 30, blockType: BlockType.BT_SODALITE, chance: 0.015 },
            { startDepth: 25, endDepth: 40, blockType: BlockType.BT_BERYL, chance: 0.02 }
        ]
    };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.worldWidthTiles = 100;
        this.worldHeightTiles = 1000;

        this.addDepthLayerByIndex(0, 5, BlockType.BT_EMPTY);
        this.addDepthLayerByIndex(1, 5, BlockType.BT_DIRT);
        this.addDepthLayerByIndex(2, 5, BlockType.BT_LIGHT_STONE);
        this.addDepthLayerByIndex(3, 5, BlockType.BT_DARK_STONE);
        this.addDepthLayerByIndex(4, 5, BlockType.BT_BEDROCK);

        this.map = scene.make.tilemap({
            tileWidth: this.tileWidth,
            tileHeight: this.tileHeight,
            width: this.worldWidthTiles,
            height: this.worldHeightTiles
        });

        this.mine = new Mine(this.map, this.terrainConfig);
        this.selectionMap = new SelectionMap(scene, this.map);
        this.chunkLoader = new ChunkLoader(
            this.map,
            this.scene.cameras.main,
            this.mine,
            this.chunkWidthTiles,
            this.chunkHeightTiles,
            this.worldWidthTiles
        );

        this.chunkLoader.loadChunks();
    }

        getSurfaceY(x: number): number {
        const tileX = Math.floor(x / this.map.tileWidth);
        const startY = 0;
        const maxY = this.worldHeightTiles;

        for (let tileY = startY; tileY < maxY; tileY++) {
            const tile = this.mine.getLayer().getTileAt(tileX, tileY);
            
            if (tile && tile.index !== BlockType.BT_EMPTY) {
                return (tileY * this.map.tileHeight); 
            }
        }

        return this.terrainConfig.surfaceLevel * this.map.tileHeight;
    }

    getValidSpawnPosition(preferredX?: number): { x: number, y: number } {
        const x = preferredX || this.getRandomSpawnX();
        const y = this.getSurfaceY(x) - 64;

        return { x, y };
    }

    private getRandomSpawnX(): number {
        const margin = 100; 
        const minX = margin;
        const maxX = this.worldWidthTiles * this.map.tileWidth - margin;
        
        return Phaser.Math.Between(minX, maxX);
    }

    isValidSpawnPosition(x: number, y: number, width: number = 32, height: number = 32): boolean {
        const tileWidth = this.map.tileWidth;
        const tileHeight = this.map.tileHeight;
        
        const startTileX = Math.floor(x / tileWidth);
        const endTileX = Math.floor((x + width) / tileWidth);
        const startTileY = Math.floor(y / tileHeight);
        const endTileY = Math.floor((y + height) / tileHeight);

        for (let tileX = startTileX; tileX <= endTileX; tileX++) {
            for (let tileY = startTileY; tileY <= endTileY; tileY++) {
                const tile = this.mine.getLayer().getTileAt(tileX, tileY);
                if (tile && tile.index !== BlockType.BT_EMPTY) {
                    return false; 
                }
            }
        }

        return true; 
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

    addDepthLayerByIndex(layerIndex: number, layerHeight: number, blockType: BlockType): void {
        if (layerIndex < 0 || layerIndex > this.terrainConfig.layers.length) {
            console.error("Invalid layer index");
            return;
        }
        const newLayer: DepthLayerConfig = {
            startDepth: this.terrainConfig.layers[layerIndex - 1]?.endDepth || 0,
            endDepth: this.terrainConfig.layers[layerIndex - 1]?.endDepth + layerHeight || layerHeight,
            blockType: blockType 
        };

        this.terrainConfig.layers.splice(layerIndex, 0, newLayer);
        this.terrainConfig.layers.sort((a, b) => a.startDepth - b.startDepth);

        console.log(this.terrainConfig.layers)
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

    deselectTile(playerId: string): void {
        this.selectionMap.deselectTile(playerId);
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
        return {width: this.tileWidth, height: this.tileHeight};
    }
}