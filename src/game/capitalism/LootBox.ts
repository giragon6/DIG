import { getDefaultTool, Tool, Backpack } from "../gameobjects/player/inventory/items/Item";

export enum LootBoxRarity {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

export interface LootBoxType {
    id: string;
    name: string;
    rarity: LootBoxRarity;
    cost: number;
    color: number;
    dropRates: Map<LootBoxRarity, number>;
}

export interface LootResult {
    tool: Tool;
    wasUpgrade: boolean;
}

export class LootBoxSystem {
    private static readonly toolPool: Map<LootBoxRarity, Tool[]> = new Map([
        [LootBoxRarity.COMMON, [
            {
                id: 'iron_pickaxe',
                name: 'Iron Pickaxe',
                damage: 20,
                efficiency: 1.2,
                rarity: LootBoxRarity.COMMON,
                type: 'pickaxe'
            },
            {
                id: 'small_backpack',
                name: 'Small Backpack',
                damage: 0,
                efficiency: 1.0,
                rarity: LootBoxRarity.COMMON,
                type: 'backpack',
                capacityIncrease: 20
            } as Backpack
        ]],
        [LootBoxRarity.RARE, [
            {
                id: 'steel_pickaxe',
                name: 'Steel Pickaxe',
                damage: 35,
                efficiency: 1.5,
                rarity: LootBoxRarity.RARE,
                type: 'pickaxe'
            },
            {
                id: 'medium_backpack',
                name: 'Medium Backpack',
                damage: 0,
                efficiency: 1.0,
                rarity: LootBoxRarity.RARE,
                type: 'backpack',
                capacityIncrease: 60
            } as Backpack
        ]],
        [LootBoxRarity.EPIC, [
            {
                id: 'gilded_pickaxe',
                name: 'Gilded Pickaxe',
                damage: 60,
                efficiency: 2.2,
                rarity: LootBoxRarity.EPIC,
                type: 'pickaxe'
            },
            {
                id: 'large_backpack',
                name: 'Large Backpack',
                rarity: LootBoxRarity.EPIC,
                type: 'backpack',
                capacityIncrease: 100
            } as Backpack
        ]],
        [LootBoxRarity.LEGENDARY, [
            {
                id: 'diamond_pickaxe',
                name: 'Diamond Pickaxe',
                damage: 120,
                efficiency: 4.0,
                rarity: LootBoxRarity.LEGENDARY,
                type: 'pickaxe'
            },
            {
                id: 'void_backpack',
                name: 'Void Backpack',
                rarity: LootBoxRarity.LEGENDARY,
                type: 'backpack',
                capacityIncrease: 200
            } as Backpack
        ]]
    ]);

    private static readonly lootBoxTypes: Map<string, LootBoxType> = new Map([
        ['basic', {
            id: 'basic',
            name: 'Basic Tool Box',
            rarity: LootBoxRarity.COMMON,
            cost: 50,
            color: 0x888888,
            dropRates: new Map([
                [LootBoxRarity.COMMON, 80],
                [LootBoxRarity.RARE, 20],
                [LootBoxRarity.EPIC, 0],
                [LootBoxRarity.LEGENDARY, 0]
            ])
        }],
        ['advanced', {
            id: 'advanced',
            name: 'Advanced Tool Box',
            rarity: LootBoxRarity.RARE,
            cost: 200,
            color: 0x4488ff,
            dropRates: new Map([
                [LootBoxRarity.COMMON, 40],
                [LootBoxRarity.RARE, 50],
                [LootBoxRarity.EPIC, 10],
                [LootBoxRarity.LEGENDARY, 0]
            ])
        }],
        ['premium', {
            id: 'premium',
            name: 'Premium Tool Box',
            rarity: LootBoxRarity.EPIC,
            cost: 500,
            color: 0xaa44ff,
            dropRates: new Map([
                [LootBoxRarity.COMMON, 20],
                [LootBoxRarity.RARE, 40],
                [LootBoxRarity.EPIC, 35],
                [LootBoxRarity.LEGENDARY, 5]
            ])
        }],
        ['legendary', {
            id: 'legendary',
            name: 'Legendary Tool Box',
            rarity: LootBoxRarity.LEGENDARY,
            cost: 1500,
            color: 0xffaa00,
            dropRates: new Map([
                [LootBoxRarity.COMMON, 5],
                [LootBoxRarity.RARE, 25],
                [LootBoxRarity.EPIC, 50],
                [LootBoxRarity.LEGENDARY, 20]
            ])
        }]
    ]);

    static getLootBoxTypes(): LootBoxType[] {
        return Array.from(this.lootBoxTypes.values());
    }

    static getLootBoxType(id: string): LootBoxType | null {
        return this.lootBoxTypes.get(id) || null;
    }

    static openLootBox(boxType: LootBoxType): Tool {
        const randomValue = Math.random() * 100;
        let cumulativeChance = 0;

        for (const [rarity, chance] of boxType.dropRates.entries()) {
            cumulativeChance += chance;
            if (randomValue <= cumulativeChance) {
                return this.getRandomToolOfRarity(rarity);
            }
        }

        return this.getRandomToolOfRarity(LootBoxRarity.COMMON);
    }

    private static getRandomToolOfRarity(rarity: LootBoxRarity): Tool {
        const toolsOfRarity = this.toolPool.get(rarity) || [];
        if (toolsOfRarity.length === 0) {
            const commonTools = this.toolPool.get(LootBoxRarity.COMMON) || [];
            return commonTools[Math.floor(Math.random() * commonTools.length)] || this.createDefaultTool();
        }

        const randomIndex = Math.floor(Math.random() * toolsOfRarity.length);
        return { ...toolsOfRarity[randomIndex] }; 
    }

    private static createDefaultTool(): Tool {
        return getDefaultTool();
    }

    static getRarityColor(rarity: LootBoxRarity): number {
        const colors = {
            [LootBoxRarity.COMMON]: 0x888888,
            [LootBoxRarity.RARE]: 0x4488ff,
            [LootBoxRarity.EPIC]: 0xaa44ff,
            [LootBoxRarity.LEGENDARY]: 0xffaa00
        };
        return colors[rarity];
    }
}