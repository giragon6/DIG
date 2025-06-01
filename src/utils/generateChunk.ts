import { BlockType } from "./types";

export function generateChunk(size: number, startY: number): BlockType[][] {
    const chunk: number[][] = [];
    
    for (let y = startY; y < size + startY; y++) {
        const row: number[] = [];
        for (let x = 0; x < size; x++) {
            if (y < 2) {
                row.push(BlockType.BT_EMPTY);
            } else if (y < 4) {
                row.push(BlockType.BT_DIRT); 
            } else if (y < 6) {
                row.push(BlockType.BT_STONE); 
            } else {
                row.push(BlockType.BT_BEDROCK); 
            }
        }
        chunk.push(row);
    }
    
    return chunk;
}
