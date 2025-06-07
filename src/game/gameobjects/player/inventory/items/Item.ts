import { BlockType } from "../../../../../utils/types/tileTypes";
import { LootBoxRarity } from "../../../../capitalism/LootBox";

export interface Tool {
    id: string;
    name: string;
    damage: number;
    efficiency: number;
    rarity: LootBoxRarity;
}

export const getDefaultTool = (): Tool => ({
    id: 'basic_pickaxe',
    name: 'Basic Pickaxe',
    damage: 15,
    efficiency: 1.0,
    rarity: LootBoxRarity.COMMON
});

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