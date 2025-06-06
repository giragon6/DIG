import { BlockType } from "../../../../../utils/types/tileTypes";

export enum ToolType {
    PICKAXE = 'pickaxe',
    SHOVEL = 'shovel',
    DRILL = 'drill'
}

export interface Tool {
    id: string;
    name: string;
    type: ToolType;
    damage: number;
    efficiency: number;
}

export interface BlockCollection {
    [BlockType.BT_EMPTY]: number; // necessary to index by BlockType
    [BlockType.BT_DIRT]: number;
    [BlockType.BT_COBBLED_STONE]: number;
    [BlockType.BT_BEDROCK]: number;
    [BlockType.BT_LIGHT_STONE]: number;
    [BlockType.BT_DIAMOND]: number;
    [BlockType.BT_DARK_STONE]: number;
    [BlockType.BT_RUBY]: number;
    [BlockType.BT_SODALITE]: number;
    [BlockType.BT_BERYL]: number;
}