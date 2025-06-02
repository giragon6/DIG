import { BlockType, SelectionType, PlayerSelectedTile } from "../../utils/types";

export default class Mine {
    private scene: Phaser.Scene;
    private map: Phaser.Tilemaps.Tilemap;
    private groundLayer: Phaser.Tilemaps.TilemapLayer; 
    private selectionLayer: Phaser.Tilemaps.TilemapLayer; 
    private worldWidthTiles: number;
    private worldHeightTiles: number;

    private selectedTiles: { [key: string]: PlayerSelectedTile | null } = {};

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.worldWidthTiles = 100;
        this.worldHeightTiles = 100; // temp

        this.map = scene.make.tilemap({
            tileWidth: 64,
            tileHeight: 64,
            width: this.worldWidthTiles,
            height: this.worldHeightTiles
        });

        const tileset = this.map.addTilesetImage('ground_tiles', 'ground_tiles');

        this.groundLayer = this.map.createBlankLayer('groundLayer', tileset!, 0, 0)!;
        this.groundLayer.setCollision([BlockType.BT_DIRT, BlockType.BT_STONE, BlockType.BT_BEDROCK]);

        const selectionTileset = this.map.addTilesetImage('selection_tiles', 'selection_tiles');
        this.selectionLayer = this.map.createBlankLayer('selectionLayer', selectionTileset!, 0, 0)!;
        // this.selectionLayer.fill(SelectionType.ST_BLOCK_WO);
    }

    private _generateChunk(chunkWidthTiles: number, chunkHeightTiles: number, startY: number): number[][] {
        const chunk: number[][] = [];

        for (let y = startY; y < chunkHeightTiles + startY; y++) {
            const row: number[] = [];
            for (let x = 0; x < chunkWidthTiles; x++) {
                let blockType: BlockType;

                // TODO: Make this less messy (cumulative heights)
                if (y < 10) {
                    blockType = BlockType.BT_EMPTY;
                } else if (y < 15) {
                    blockType = BlockType.BT_DIRT;
                } else if (y < 20) {
                    blockType = BlockType.BT_STONE;
                } else {
                    blockType = BlockType.BT_BEDROCK;
                }
                row.push(blockType);
            }
            chunk.push(row);

            // console.log(`Generated row ${y - startY}: ${row.join(', ')}`);
        }

        return chunk;
    }

    loadChunks(chunkWidthTiles: number, chunkHeightTiles: number): void {
        const chunkSizeX = chunkWidthTiles * this.map.tileWidth;
        const chunkSizeY = chunkHeightTiles * this.map.tileHeight;
        const camera = this.scene.cameras.main;
        const startX = (Math.floor(camera.scrollX / chunkSizeX));
        const startY = (Math.floor(camera.scrollY / chunkSizeY));
        const endX = Math.ceil(((camera.scrollX + camera.width) / chunkSizeX)) + 1;
        const endY = Math.ceil(((camera.scrollY + camera.height) / chunkSizeY)) + 1;

        // console.log(`Loading chunks from (${startX}, ${startY}) to (${endX}, ${endY}) with chunk size ${chunkSizeX}x${chunkSizeY}y`);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                // console.log(`Generating chunk at (${x}, ${y})`);
                const chunk_data = this._generateChunk(chunkWidthTiles, chunkHeightTiles, y * chunkHeightTiles);
                this.map.putTilesAt(chunk_data, x * chunkWidthTiles, y * chunkHeightTiles, false, this.groundLayer);
            }
        }
    }

    selectTile(tileX: number, tileY: number, playerId: string): boolean {
        const selectedTile = this.selectedTiles[playerId];

        if (selectedTile && this.selectionLayer.getTileAt(selectedTile.x, selectedTile.y)) {
            this.selectionLayer.removeTileAt(selectedTile.x, selectedTile.y);
        }

        const tile = this.groundLayer.getTileAt(tileX, tileY);
        if (!tile || tile.index === BlockType.BT_EMPTY) {
            this.selectedTiles[playerId] = null;
            return false; 
        }

        this.selectedTiles[playerId] = {
            x: tileX,
            y: tileY,
            type: tile.index as BlockType
        };

        this.selectionLayer.putTileAt(SelectionType.ST_BLOCK_WO, tileX, tileY);

        return true;
    }
    
    digTile(playerId: string): void {
        const selectedTile = this.selectedTiles[playerId];
        if (!selectedTile) {
            console.warn(`Player ${playerId} tried to dig but had no tiles selected.`);
            return;
        }

        const tileX = selectedTile.x;
        const tileY = selectedTile.y;

        const tile = this.groundLayer.getTileAt(tileX, tileY);
        if (tile && tile.index !== BlockType.BT_EMPTY) {
            this.groundLayer.removeTileAt(tileX, tileY);
            this.selectionLayer.removeTileAt(tileX, tileY);
            this.selectedTiles[playerId] = null;
        }
    }

    getTilePosition(x: number, y: number): { x: number; y: number } | null {
        const tile = this.getLayer().getTileAtWorldXY(x, y);
        if (!tile) {
            return null; 
        }
        return { x: tile.x, y: tile.y };
    }

    getLayer(): Phaser.Tilemaps.TilemapLayer {
        return this.groundLayer; 
    }

    getSelectionLayer(): Phaser.Tilemaps.TilemapLayer {
        return this.selectionLayer; 
    }

    getMap(): Phaser.Tilemaps.Tilemap {
        return this.map;
    }
}