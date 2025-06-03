import { TerrainConfig } from "../../utils/configInterfaces";
import { BlockType, PlayerSelectedTile } from "../../utils/types";
import TerrainGenerator from "./scripts/TerrainGenerator";
import TileDamageMap from "./TileDamageMap";

export default class Mine {
    private map: Phaser.Tilemaps.Tilemap;
    private groundLayer: Phaser.Tilemaps.TilemapLayer; 
    private terrainConfig: TerrainConfig;
    
    private tileDamageMap: TileDamageMap;

    constructor(map: Phaser.Tilemaps.Tilemap, terrainConfig: TerrainConfig) {
        this.map = map;
        this.terrainConfig = terrainConfig;

        const tileset = this.map.addTilesetImage('ground_tiles', 'ground_tiles');
        this.groundLayer = this.map.createBlankLayer('groundLayer', tileset!, 0, 0)!;
        
        for (let key in BlockType) {
            if (key !== 'BT_EMPTY') {
                this.groundLayer.setCollision(BlockType[key as keyof typeof BlockType]);
            }
        }

        const damageTileset = this.map.addTilesetImage('damage_tiles', 'damage_tiles');
        this.tileDamageMap = new TileDamageMap(this.map, damageTileset!);

    }

    private generateChunk(chunkWidthTiles: number, chunkHeightTiles: number, startY: number): number[][] {
        const chunk: number[][] = [];

        const surfaceHeights = this.generateSurfaceHeights(chunkWidthTiles, startY);
        
        const layerVariations = this.generateLayerVariations(chunkWidthTiles, startY);

        for (let y = startY; y < chunkHeightTiles + startY; y++) {
            const row: number[] = [];
            for (let x = 0; x < chunkWidthTiles; x++) {
                const localSurfaceLevel = surfaceHeights[x];
                const depth = y - localSurfaceLevel;
                const blockType = this.getBlockTypeAtDepthWithVariation(depth, x, layerVariations);
                row.push(blockType);
            }
            chunk.push(row);
        }

        return chunk;
    }

    private generateSurfaceHeights(chunkWidth: number, chunkStartY: number): number[] {
        const seed = `surface_${Math.floor(chunkStartY / 16)}`; // Consistent seed per chunk row
        
        return TerrainGenerator.randomWalkSmooth(
            chunkWidth,
            10, // Height variation range
            this.terrainConfig.surfaceLevel + 3, // Max surface height
            this.terrainConfig.surfaceLevel - 3, // Min surface height
            2, // Minimum section size for smoother terrain
            seed
        ).map(column => column.findIndex(block => block === BlockType.BT_EMPTY) || this.terrainConfig.surfaceLevel);
    }

    private generateLayerVariations(chunkWidth: number, chunkStartY: number): number[][] {
        const variations: number[][] = [];
        
        this.terrainConfig.layers.forEach((layer, layerIndex) => {
            const seed = `layer_${layerIndex}_${Math.floor(chunkStartY / 16)}`;
            const baseThickness = layer.endDepth - layer.startDepth;
            const maxVariation = Math.max(2, Math.floor(baseThickness * 0.3)); 
            
            const layerVariation = TerrainGenerator.layerBoundaryWalk(  // <-- HERE
                chunkWidth,
                maxVariation * 2,
                maxVariation,
                3, 
                seed
            );
            
            variations.push(layerVariation);
        });
        
        return variations;
    }

    private getBlockTypeAtDepthWithVariation(depth: number, x: number, layerVariations: number[][]): BlockType {
        let adjustedDepth = 0;
        
        for (let i = 0; i < this.terrainConfig.layers.length; i++) {
            const layer = this.terrainConfig.layers[i];
            const variation = layerVariations[i] ? layerVariations[i][x] || 0 : 0;
            
            const layerStart = adjustedDepth;
            const layerThickness = (layer.endDepth - layer.startDepth) + variation;
            const layerEnd = layerStart + layerThickness;
            
            if (depth >= layerStart && depth < layerEnd) {
                return layer.blockType;
            }
            
            adjustedDepth = layerEnd;
        }
        
        return this.terrainConfig.layers[this.terrainConfig.layers.length - 1].blockType;
    }

    // private addOreVeins(chunk: number[][], chunkX: number, chunkY: number): number[][] {
    //     const seed = `ore_${chunkX}_${chunkY}`;
    //     const rand = new Random(seed);
    //     const ore = rand.range(BlockType.BT_RUBY, BlockType.BT_BERYL + 1);
        
    //     if (rand.float() < 0.1) {
    //         const veinPath = TerrainGenerator.randomWalkSmooth(
    //             chunk[0].length,
    //             chunk.length,
    //             chunk.length - 1,
    //             Math.floor(chunk.length * 0.3), 
    //             1, 
    //             seed + "_vein"
    //         );
            
    //         for (let x = 0; x < chunk[0].length; x++) {
    //             for (let y = 0; y < chunk.length; y++) {
    //                 if (veinPath[y] && veinPath[y][x] === ore && 
    //                     chunk[y][x] !== BlockType.BT_EMPTY) {
    //                     chunk[y][x] = ore;
    //                 }
    //             }
    //         }
    //     }
        
    //     return chunk;
    // }    

    damageTile(selectedTile: PlayerSelectedTile, damage: number): boolean {
        const tileX = selectedTile.x;
        const tileY = selectedTile.y;
        const tile = this.groundLayer.getTileAt(tileX, tileY);
        if (!tile || tile.index === BlockType.BT_EMPTY) {
            return false; 
        }
        return this.tileDamageMap.applyDamage(tileX, tileY, damage, this.groundLayer);
    }

    removeTile(selectedTile: PlayerSelectedTile): boolean {
        const tileX = selectedTile.x;
        const tileY = selectedTile.y;

        const tile = this.groundLayer.getTileAt(tileX, tileY);
        if (tile && tile.index !== BlockType.BT_EMPTY) {
            this.groundLayer.removeTileAt(tileX, tileY);
            return true;
        }
        return false;
    }

    getLayer(): Phaser.Tilemaps.TilemapLayer {
        return this.groundLayer; 
    }
    
    getTileAt(x: number, y: number): PlayerSelectedTile | null {
        const tile = this.groundLayer.getTileAt(x, y);
        if (!tile) {
            return null; 
        }
        return { x: tile.x, y: tile.y, type: tile.index };
    }

    addChunk(chunkWidthTiles: number, chunkHeightTiles: number, chunkX: number, chunkY: number): void {
        const chunk_data = this.generateChunk(chunkWidthTiles, chunkHeightTiles, chunkY * chunkHeightTiles);
        this.map.putTilesAt(chunk_data, chunkX * chunkWidthTiles, chunkY * chunkHeightTiles, false, this.groundLayer);
    }

    removeChunk(chunkWidthTiles: number, chunkHeightTiles: number, chunkX: number, chunkY: number): void {
        for (let x = 0; x < chunkWidthTiles; x++) {
            for (let y = 0; y < chunkHeightTiles; y++) {
                this.groundLayer.removeTileAt(chunkX * chunkWidthTiles + x, chunkY * chunkHeightTiles + y);
            }
        }
    }

    getTileSize(): { width: number, height: number } {
        const tile = this.groundLayer.getTileAt(0, 0);
        if (tile) {
            return { width: tile.width, height: tile.height };
        }
        return { width: 0, height: 0 }; 
    }
}