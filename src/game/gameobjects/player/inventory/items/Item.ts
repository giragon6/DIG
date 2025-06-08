import { BlockType } from "../../../../../utils/types/tileTypes";
import { LootBoxRarity } from "../../../../capitalism/LootBox";

export interface Tool {
    id: string;
    name: string;
    damage: number;
    efficiency: number;
    rarity: LootBoxRarity;
    type: 'pickaxe' | 'backpack';
}

export interface Backpack extends Tool {
    type: 'backpack';
    capacityIncrease: number;
}

export const getDefaultTool = (): Tool => ({
    id: 'basic_pickaxe',
    name: 'Basic Pickaxe',
    damage: 3,
    efficiency: 1.0,
    rarity: LootBoxRarity.COMMON,
    type: 'pickaxe'
});

export const getDefaultBackpack = (): Backpack => ({
    id: 'basic_backpack',
    name: 'Basic Backpack',
    damage: 0,
    efficiency: 1.0,
    rarity: LootBoxRarity.COMMON,
    type: 'backpack',
    capacityIncrease: 0  
});

export interface BlockCollection {
    [BlockType.BT_EMPTY]: number;
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