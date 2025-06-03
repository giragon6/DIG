import { BlockType } from "./types";

export interface DepthLayerConfig {
    startDepth: number;
    endDepth: number;
    blockType: BlockType;
    weight?: number; // Optional: for random generation within the layer
}

export interface TerrainConfig {
    layers: DepthLayerConfig[];
    surfaceLevel: number; // Y coordinate where terrain starts
}