import { BlockType } from "../../../utils/types/tileTypes";
import { BlockValues } from "../../capitalism/BlockValue";
import { MoneyManager } from "../../capitalism/MoneyManager";
import { Inventory } from "../player/inventory/Inventory";

export class DumpTruck extends Phaser.GameObjects.Container {
    scene: Phaser.Scene;
    private sprite: Phaser.GameObjects.Sprite;
    private isPlayerNearby: boolean = false;
    private interactionPrompt: Phaser.GameObjects.Text;
    private moneyManager: MoneyManager;
    private interactionDistance: number;

    constructor(scene: Phaser.Scene, x: number, y: number, interactionDistance: number) {
        super(scene, x, y);
        this.scene = scene;
        this.moneyManager = MoneyManager.getInstance();

        this.interactionDistance = interactionDistance;

        this.createSprite();
        this.createInteractionPrompt();
        
        scene.add.existing(this);
    }

    private createSprite(): void {
        this.sprite = this.scene.add.sprite(0, 0, 'dump_truck');
        this.sprite.setDisplaySize(128, 96);
        this.add(this.sprite);
    }

    private createInteractionPrompt(): void {
        this.interactionPrompt = this.scene.add.text(0, -60, 'Press DOWN to sell blocks', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5, 0.5).setVisible(false);
        
        this.add(this.interactionPrompt);
    }

    setPlayerNearby(isNearby: boolean): void {
        this.isPlayerNearby = isNearby;
        this.interactionPrompt.setVisible(isNearby);
        
        if (isNearby) {
            this.sprite.setTint(0x44ff44);
        } else {
            this.sprite.clearTint();
        }
    }

    sellPlayerInventory(inventory: Inventory): { soldBlocks: number, earnedMoney: number } {
        if (!this.isPlayerNearby) {
            return { soldBlocks: 0, earnedMoney: 0 };
        }

        const blocks = inventory.getAllBlocks();
        let totalValue = 0;
        let totalBlocks = 0;
        const soldItems: { blockType: BlockType, count: number, value: number }[] = [];

        Object.entries(blocks).forEach(([blockTypeStr, count]) => {
            if (count > 0) {
                const blockType = parseInt(blockTypeStr) as BlockType;
                const unitValue = BlockValues.getValue(blockType);
                const totalBlockValue = unitValue * count;
                
                soldItems.push({
                    blockType,
                    count,
                    value: totalBlockValue
                });
                
                totalValue += totalBlockValue;
                totalBlocks += count;
            }
        });

        if (totalBlocks === 0) {
            this.showMessage('No blocks to sell!', 0xff4444);
            return { soldBlocks: 0, earnedMoney: 0 };
        }

        soldItems.forEach(item => {
            inventory.removeBlocks(item.blockType, item.count);
        });

        this.moneyManager.addMoney(totalValue);

        this.showSaleSummary(soldItems, totalValue);

        return { soldBlocks: totalBlocks, earnedMoney: totalValue };
    }

    private showSaleSummary(soldItems: any[], totalValue: number): void {
        let summaryText = `SOLD:\n`;
        soldItems.forEach(item => {
            const blockName = this.getBlockName(item.blockType);
            summaryText += `${item.count}x ${blockName} = $${item.value}\n`;
        });
        summaryText += `\nTotal: $${totalValue}`;

        this.showMessage(summaryText, 0x44ff44, 3000);
    }

    private showMessage(text: string, color: number = 0xffffff, duration: number = 2000): void {
        const message = this.scene.add.text(0, -100, text, {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            align: 'center'
        }).setOrigin(0.5, 0.5);

        message.setTint(color);
        this.add(message);

        this.scene.tweens.add({
            targets: message,
            y: -120,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                message.destroy();
            }
        });
    }

    private getBlockName(blockType: BlockType): string {
        const nameMap: { [key in BlockType]?: string } = {
            [BlockType.BT_DIRT]: 'Dirt',
            [BlockType.BT_LIGHT_STONE]: 'Light Stone',
            [BlockType.BT_DARK_STONE]: 'Dark Stone',
            [BlockType.BT_DIAMOND]: 'Diamond',
            [BlockType.BT_RUBY]: 'Ruby'
        };
        return nameMap[blockType] || 'Unknown';
    }

    getInteractionDistance(): number {
        return this.interactionDistance;
    }

    isPlayerInRange(): boolean {
        return this.isPlayerNearby;
    }
}