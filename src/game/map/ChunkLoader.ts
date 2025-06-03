import Mine from "./Mine";

export default class ChunkLoader { 
    private map: Phaser.Tilemaps.Tilemap;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private mine: Mine; 

    private chunkWidthTiles: number;
    private chunkHeightTiles: number;

    private loadedChunks: Set<string> = new Set();
    private chunkLoadDistance: number = 2;
    private chunkUnloadDistance: number = 4;

    constructor(
        map: Phaser.Tilemaps.Tilemap, 
        camera: Phaser.Cameras.Scene2D.Camera, 
        mine: Mine,
        chunkWidthTiles: number,
        chunkHeightTiles: number
    ) {
        this.map = map;
        this.camera = camera;
        this.mine = mine;

        this.chunkWidthTiles = chunkWidthTiles; 
        this.chunkHeightTiles = chunkHeightTiles;
    }

    loadChunks(): void {
        const chunkWidthTiles = this.chunkWidthTiles;
        const chunkHeightTiles = this.chunkHeightTiles;

        const chunkSizeX = chunkWidthTiles * this.map.tileWidth;
        const chunkSizeY = chunkHeightTiles * this.map.tileHeight;
        const camera = this.camera;
        
        const cameraCenterX = camera.scrollX + camera.width / 2;
        const cameraCenterY = camera.scrollY + camera.height / 2;
        const currentChunkX = Math.floor(cameraCenterX / chunkSizeX);
        const currentChunkY = Math.floor(cameraCenterY / chunkSizeY);

        const startX = currentChunkX - this.chunkLoadDistance;
        const endX = currentChunkX + this.chunkLoadDistance;
        const startY = currentChunkY - this.chunkLoadDistance;
        const endY = currentChunkY + this.chunkLoadDistance;

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const chunkKey = `${x},${y}`;
                
                if (!this.loadedChunks.has(chunkKey)) {
                    console.log(`Loading chunk at (${x}, ${y})`);
                    this.mine.addChunk(chunkWidthTiles, chunkHeightTiles, x, y);
                    this.loadedChunks.add(chunkKey);
                }
            }
        }

        this.unloadDistantChunks(currentChunkX, currentChunkY);
    }

    private unloadDistantChunks(
        currentChunkX: number, 
        currentChunkY: number
    ): void {
        const chunkWidthTiles = this.chunkWidthTiles;
        const chunkHeightTiles = this.chunkHeightTiles;

        const chunksToUnload: string[] = [];

        this.loadedChunks.forEach(chunkKey => {
            const [x, y] = chunkKey.split(',').map(Number);
            const distance = Math.max(
                Math.abs(x - currentChunkX),
                Math.abs(y - currentChunkY)
            );

            if (distance > this.chunkUnloadDistance) {
                chunksToUnload.push(chunkKey);
            }
        });

        chunksToUnload.forEach(chunkKey => {
            const [x, y] = chunkKey.split(',').map(Number);
            console.log(`Unloading chunk at (${x}, ${y})`);
            this.mine.removeChunk(x, y, chunkWidthTiles, chunkHeightTiles);
            this.loadedChunks.delete(chunkKey);
        });
    }

    private lastChunkCheck: { x: number, y: number } = { x: -999, y: -999 };
    
    shouldUpdateChunks(): boolean {
        const chunkSizeX = this.chunkWidthTiles * this.map.tileWidth;
        const chunkSizeY = this.chunkHeightTiles * this.map.tileHeight;
        const camera = this.camera;
        
        const cameraCenterX = camera.scrollX + camera.width / 2;
        const cameraCenterY = camera.scrollY + camera.height / 2;
        const currentChunkX = Math.floor(cameraCenterX / chunkSizeX);
        const currentChunkY = Math.floor(cameraCenterY / chunkSizeY);

        if (currentChunkX !== this.lastChunkCheck.x || currentChunkY !== this.lastChunkCheck.y) {
            this.lastChunkCheck = { x: currentChunkX, y: currentChunkY };
            return true;
        }
        return false;
    }

}