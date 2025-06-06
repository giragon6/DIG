import { Direction } from "./controlTypes";

export interface PlayerSelectedTile {
    x: number;
    y: number;
    type: BlockType;
    adjacencies?: {
        [key in Direction]?: boolean;
    };
}

export enum BlockType {
    BT_EMPTY = -1,
    BT_DIRT,
    BT_COBBLED_STONE, // legally distinct
    BT_BEDROCK,
    BT_LIGHT_STONE,
    BT_DIAMOND,
    BT_DARK_STONE,
    BT_RUBY,
    BT_SODALITE,
    BT_BERYL
}

export enum SelectionType {
    ST_NONE = -1,
    ST_BLOCK_WO // White outline
}

export enum DamageType {
    DT_LIGHT,
    DT_MEDIUM,
    DT_HEAVY,
    DT_CRITICAL
}