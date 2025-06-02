import { BlockType, PlayerSelectedTile, SelectionType } from "../../utils/types";

export default class SelectionMap {
        private selectionLayer: Phaser.Tilemaps.TilemapLayer; 
        private selectedTiles: { [key: string]: PlayerSelectedTile | null } = {};

        constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
            const selectionTileset = map.addTilesetImage('selection_tiles', 'selection_tiles');
            this.selectionLayer = map.createBlankLayer('selectionLayer', selectionTileset!, 0, 0)!;
            // this.selectionLayer.fill(SelectionType.ST_BLOCK_WO);
        }

        setSelectedTile(tile: PlayerSelectedTile | null, playerId: string): boolean {
            if (!tile) return false;

            const selectedTile = this.selectedTiles[playerId];

            if (selectedTile && this.selectionLayer.getTileAt(selectedTile.x, selectedTile.y)) {
                this.selectionLayer.removeTileAt(selectedTile.x, selectedTile.y);
            }

            this.selectedTiles[playerId] = null;

            this.selectedTiles[playerId] = {
                x: tile.x,
                y: tile.y,
                type: tile.type
            };

            this.selectionLayer.putTileAt(SelectionType.ST_BLOCK_WO, tile.x, tile.y);

            return true;
         }

        deselectTile(playerId: string): void {
            if (this.selectedTiles[playerId]) {
                this.selectionLayer.removeTileAt(this.selectedTiles[playerId]!.x, this.selectedTiles[playerId]!.y);
                this.selectedTiles[playerId] = null;
            }
        }

        getSelectedTile(playerId: string): PlayerSelectedTile | null {
            return this.selectedTiles[playerId] || null;
        }
}