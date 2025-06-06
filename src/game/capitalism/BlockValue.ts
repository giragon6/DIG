import { BlockType } from "../../utils/types/tileTypes";
import { Inventory } from "../gameobjects/player/inventory/Inventory";

export interface BlockValue {
    blockType: BlockType;
    baseValue: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
}

export class BlockValues {
    private static readonly values: Map<BlockType, BlockValue> = new Map([
        [BlockType.BT_DIRT, {
            blockType: BlockType.BT_DIRT,
            baseValue: 1,
            rarity: 'common'
        }],
        [BlockType.BT_LIGHT_STONE, {
            blockType: BlockType.BT_LIGHT_STONE,
            baseValue: 1,
            rarity: 'common'
        }],
        [BlockType.BT_DARK_STONE, {
            blockType: BlockType.BT_DARK_STONE,
            baseValue: 2,
            rarity: 'common'
        }],
        [BlockType.BT_DIAMOND, {
            blockType: BlockType.BT_DIAMOND,
            baseValue: 50,
            rarity: 'rare'
        }],
        [BlockType.BT_RUBY, {
            blockType: BlockType.BT_RUBY,
            baseValue: 30,
            rarity: 'rare'
        }],
        [BlockType.BT_SODALITE, {
            blockType: BlockType.BT_SODALITE,
            baseValue: 20,
            rarity: 'uncommon'
        }],
        [BlockType.BT_BERYL, {
            blockType: BlockType.BT_BERYL,
            baseValue: 25,
            rarity: 'uncommon'
        }],
    ]);

    static getValue(blockType: BlockType): number {
        return this.values.get(blockType)?.baseValue || 0;
    }

    static getBlockValue(blockType: BlockType): BlockValue | null {
        return this.values.get(blockType) || null;
    }

    static calculateInventoryValue(inventory: Inventory): number {
        let totalValue = 0;
        const blocks = inventory.getAllBlocks();
        
        Object.entries(blocks).forEach(([blockTypeStr, count]) => {
            const blockType = parseInt(blockTypeStr) as BlockType;
            const value = this.getValue(blockType);
            totalValue += value * count;
        });
        
        return totalValue;
    }

    static getAllValues(): Map<BlockType, BlockValue> {
        return new Map(this.values);
    }
}