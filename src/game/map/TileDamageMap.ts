import { BlockType, DamageType } from "../../utils/types/tileTypes";

interface DamageData {
    damage: number;
    maxHealth: number;
}

export default class TileDamage {
    private map: Phaser.Tilemaps.Tilemap;
    private damageLayer: Phaser.Tilemaps.TilemapLayer;
    private damageMap: Map<string, DamageData> = new Map();

    private readonly BLOCK_HEALTH: Record<BlockType, number> = {
        [BlockType.BT_EMPTY]: 0,
        [BlockType.BT_COBBLED_STONE]: 40,
        [BlockType.BT_DIRT]: 20,
        [BlockType.BT_LIGHT_STONE]: 50,
        [BlockType.BT_DIAMOND]: 120,
        [BlockType.BT_DARK_STONE]: 80,
        [BlockType.BT_RUBY]: 100,
        [BlockType.BT_SODALITE]: 60,
        [BlockType.BT_BERYL]: 70,
        [BlockType.BT_BEDROCK]: 999 // Indestructible
    };

    /**
     * TileDamage constructor
     * @param map The tilemap to manage damage on (the world tilemap)
     * @param tileset The tileset containing damage overlay tiles
     */
    constructor(map: Phaser.Tilemaps.Tilemap, tileset: Phaser.Tilemaps.Tileset) {
        this.map = map;
        
        this.damageLayer = this.map.createBlankLayer('damageLayer', tileset, 0, 0)!;
        this.damageLayer.setDepth(10); 
        this.damageLayer.setAlpha(0.8); 
    }

    /**
     * Apply damage to a tile
     * @param tileX Tile X coordinate
     * @param tileY Tile Y coordinate
     * @param damage Amount of damage to apply
     * @param groundLayer The ground layer to check/remove tiles from
     * @returns true if tile was destroyed, false otherwise
     */
    applyDamage(tileX: number, tileY: number, damage: number, groundLayer: Phaser.Tilemaps.TilemapLayer): boolean {
        const tileKey = `${tileX},${tileY}`;
        const groundTile = groundLayer.getTileAt(tileX, tileY);
        
        if (!groundTile || groundTile.index === BlockType.BT_EMPTY) {
            return false;
        }

        const blockType = groundTile.index as BlockType;
        const maxHealth = this.BLOCK_HEALTH[blockType] || 30;

        let damageData = this.damageMap.get(tileKey);
        if (!damageData) {
            damageData = { damage: 0, maxHealth };
            this.damageMap.set(tileKey, damageData);
        }

        damageData.damage += damage;
        
        if (damageData.damage >= damageData.maxHealth) {
            this.destroyTile(tileX, tileY, groundLayer);
            return true;
        }

        this.updateDamageOverlay(tileX, tileY, damageData);
        return false;
    }

    /**
     * Destroy a tile and remove it from the damage map
     * @param tileX Tile X coordinate
     * @param tileY Tile Y coordinate
     * @param groundLayer The ground layer to remove the tile from
     */
    private destroyTile(tileX: number, tileY: number, groundLayer: Phaser.Tilemaps.TilemapLayer): void {
        const tileKey = `${tileX},${tileY}`;
        
        groundLayer.removeTileAt(tileX, tileY);
        
        this.damageLayer.removeTileAt(tileX, tileY);
        
        this.damageMap.delete(tileKey);
        
        console.log(`Tile (${tileX}, ${tileY}) destroyed!`);
    }

    /**
     * Update the damage overlay for a tile based on its damage percentage
     * @param tileX Tile X coordinate
     * @param tileY Tile Y coordinate
     * @param damageData The damage data for the tile
     */
    private updateDamageOverlay(tileX: number, tileY: number, damageData: DamageData): void {
        const damagePercent = (damageData.damage / damageData.maxHealth);
        let overlayTile: number | null = null;

        if (damagePercent >= 0.9) {
            overlayTile = DamageType.DT_CRITICAL;
        } else if (damagePercent >= 0.75) {
            overlayTile = DamageType.DT_HEAVY;
        } else if (damagePercent >= 0.5) {
            overlayTile = DamageType.DT_MEDIUM;
        } else if (damagePercent >= 0.25) {
            overlayTile = DamageType.DT_LIGHT;
        }

        if (overlayTile) {
            this.damageLayer.putTileAt(overlayTile, tileX, tileY);
        } else {
            this.damageLayer.removeTileAt(tileX, tileY);
        }
    }

    /**
     * Repair a tile by reducing its damage
     * @param tileX Tile X coordinate
     * @param tileY Tile Y coordinate
     * @param repairAmount Amount of health to restore
     */
    repairTile(tileX: number, tileY: number, repairAmount: number): void {
        const tileKey = `${tileX},${tileY}`;
        const damageData = this.damageMap.get(tileKey);
        
        if (damageData) {
            damageData.damage = Math.max(0, damageData.damage - repairAmount);
            
            if (damageData.damage === 0) {
                this.damageLayer.removeTileAt(tileX, tileY);
                this.damageMap.delete(tileKey);
            } else {
                this.updateDamageOverlay(tileX, tileY, damageData);
            }
        }
    }

    /**
     * Get the damage percentage for a tile
     * @param tileX Tile X coordinate
     * @param tileY Tile Y coordinate
     * @returns Damage percentage (0-100)
     */
    getDamagePercent(tileX: number, tileY: number): number {
        const tileKey = `${tileX},${tileY}`;
        const damageData = this.damageMap.get(tileKey);
        
        if (!damageData) return 0;
        return (damageData.damage / damageData.maxHealth) * 100;
    }

    /**
     * Check if a tile is damaged
     * @param tileX Tile X coordinate
     * @param tileY Tile Y coordinate
     * @returns true if the tile is damaged, false otherwise
     */
    isDamaged(tileX: number, tileY: number): boolean {
        const tileKey = `${tileX},${tileY}`;
        return this.damageMap.has(tileKey);
    }

    /**
     * Get the damage layer for rendering
     * @returns The damage layer
     */
    getDamageLayer(): Phaser.Tilemaps.TilemapLayer {
        return this.damageLayer;
    }

    /**
     * Clear all damage from a specific chunk
     * @param chunkX Chunk X coordinate
     * @param chunkY Chunk Y coordinate
     * @param chunkWidthTiles Width of the chunk in tiles
     * @param chunkHeightTiles Height of the chunk in tiles
     */
    clearChunkDamage(chunkX: number, chunkY: number, chunkWidthTiles: number, chunkHeightTiles: number): void {
        const startX = chunkX * chunkWidthTiles;
        const startY = chunkY * chunkHeightTiles;
        const endX = startX + chunkWidthTiles;
        const endY = startY + chunkHeightTiles;

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const tileKey = `${x},${y}`;
                this.damageMap.delete(tileKey);
                this.damageLayer.removeTileAt(x, y);
            }
        }
    }
}