import { OreLayerConfig, TerrainConfig } from "../../utils/configInterfaces";
import Random from "../../utils/Random";
import { BlockType, PlayerSelectedTile } from "../../utils/types/tileTypes";
import TerrainGenerator from "./scripts/TerrainGenerator";
import TileDamageMap from "./TileDamageMap";

export default class Mine {
    private map: Phaser.Tilemaps.Tilemap;
    private groundLayer: Phaser.Tilemaps.TilemapLayer; 
    private terrainConfig: TerrainConfig;
    
    private tileDamageMap: TileDamageMap;

    private seed: string;

    constructor(map: Phaser.Tilemaps.Tilemap, terrainConfig: TerrainConfig, seed: string | null = null) {
        if (!seed) {
            seed = `mine_${Math.floor(Math.random() * 1000000)}`;
        }
        this.seed = seed;
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

    getSurfaceAtX(worldX: number): number {
        const tileX = Math.floor(worldX / 64); 
        
        for (let y = 0; y < this.map.height; y++) {
            const tile = this.groundLayer.getTileAt(tileX, y);
            if (tile && tile.index !== BlockType.BT_EMPTY) {
                return y * 64 - 16; 
            }
        }
        
        return this.terrainConfig.surfaceLevel * 64 - 16;
    }

    private generateChunk(chunkWidthTiles: number, chunkHeightTiles: number, x: number, y: number): number[][] {
        const startY = y * chunkHeightTiles;

        let chunk: number[][] = [];

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

        chunk = this.addOreVeins(chunk, x, y);

        return chunk;
    }

    private generateSurfaceHeights(chunkWidth: number, chunkStartY: number): number[] {
        const seed = `${this.seed}_surface_${Math.floor(chunkStartY / 16)}`; 
        
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
            const seed = `${this.seed}_layer_${layerIndex}_${Math.floor(chunkStartY / 16)}`;
            const baseThickness = layer.endDepth - layer.startDepth;
            const maxVariation = Math.max(2, Math.floor(baseThickness * 0.3)); 
            
            const layerVariation = TerrainGenerator.layerBoundaryWalk(
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

    private addOreVeins(chunk: number[][], chunkX: number, chunkY: number): number[][] {
        const seed = `${this.seed}_ore_${chunkX}_${chunkY}`;

        for (let y = 0; y < chunk.length; y++) {
            for (let x = 0; x < chunk[0].length; x++) {
                if (chunk[y][x] === BlockType.BT_EMPTY) {
                    continue;
                }

                const worldY = chunkY * chunk.length + y;
                
                for (const oreLayer of this.terrainConfig.oreLayers || []) {
                    if (worldY >= oreLayer.startDepth && worldY <= oreLayer.endDepth) {
                        const blockSeed = `${seed}_${x}_${y}_${oreLayer.blockType}`;
                        const blockRand = new Random(blockSeed);
                        
                        if (blockRand.float() < oreLayer.chance!) {
                            chunk[y][x] = oreLayer.blockType;
                            break;
                        }
                    }
                }
            }
        }
        
        return chunk;
    }    

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
        const chunk_data = this.generateChunk(chunkWidthTiles, chunkHeightTiles, chunkX, chunkY);
        this.map.putTilesAt(chunk_data, chunkX * chunkWidthTiles, chunkY * chunkHeightTiles, false, this.groundLayer);
    }

    removeChunk(chunkWidthTiles: number, chunkHeightTiles: number, chunkX: number, chunkY: number): void {
        for (let x = 0; x < chunkWidthTiles; x++) {
            for (let y = 0; y < chunkHeightTiles; y++) {
                this.groundLayer.removeTileAt(chunkX * chunkWidthTiles + x, chunkY * chunkHeightTiles + y);
            }
        }
    }
}