import { BlockType } from "./tileTypes";

export interface DepthLayerConfig {
    startDepth: number;
    endDepth: number;
    blockType: BlockType;
    weight?: number; 
}

export interface OreLayerConfig {
    startDepth: number;
    endDepth: number;
    blockType: BlockType;
    chance?: number; 
}

export interface TerrainConfig {
    layers: DepthLayerConfig[];
    surfaceLevel: number; // Y coordinate where terrain 
    oreLayers?: OreLayerConfig[];
}