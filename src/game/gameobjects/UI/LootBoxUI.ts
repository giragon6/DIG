import { LootBoxSystem, LootBoxType, LootBoxRarity } from "../../capitalism/LootBox";
import { MoneyManager } from "../../capitalism/MoneyManager";
import { Tool } from "../player/inventory/items/Item";
import { ControlKeys } from "../../../utils/types/controlTypes";

export class LootBoxUI extends Phaser.GameObjects.Container {
    scene: Phaser.Scene;
    private moneyManager: MoneyManager;
    private isVisible: boolean = false;
    private background: Phaser.GameObjects.Rectangle;
    private lootBoxContainers: Phaser.GameObjects.Container[] = [];
    private currentPlayerId: string | null = null;
    private currentPlayerKeys: ControlKeys | null = null;
    private selectedIndex: number = 0;

    constructor(scene: Phaser.Scene) {
        super(scene, scene.cameras.main.centerX, scene.cameras.main.centerY);
        this.scene = scene;
        this.moneyManager = MoneyManager.getInstance();

        this.createUI();
        this.setVisible(false);
        this.setScrollFactor(0);

        scene.add.existing(this);
    }

    private createUI(): void {
        this.background = this.scene.add.rectangle(0, 0, 600, 400, 0x000000, 0.95);
        this.background.setStrokeStyle(3, 0xffffff);
        this.add(this.background);

        const title = this.scene.add.text(0, -170, 'TOOL BOXES ( ATK = BUY | INT = EXIT)', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
        this.add(title);

        const moneyDisplay = this.scene.add.text(0, -140, `Money: $${this.moneyManager.getMoney()}`, {
            fontSize: '16px',
            color: '#44ff44'
        }).setOrigin(0.5, 0.5);
        moneyDisplay.setData('moneyText', true);
        this.add(moneyDisplay);

        this.createLootBoxOptions();
    }

    private createLootBoxOptions(): void {
        const lootBoxTypes = LootBoxSystem.getLootBoxTypes();
        const startY = -80;
        const spacing = 80;

        lootBoxTypes.forEach((boxType, index) => {
            const y = startY + (index * spacing);
            const container = this.createLootBoxOption(boxType, 0, y);
            this.lootBoxContainers.push(container);
            this.add(container);
        });
    }

    private createLootBoxOption(boxType: LootBoxType, x: number, y: number): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(0, 0, 500, 60, boxType.color, 0.3);
        bg.setStrokeStyle(2, boxType.color);
        container.add(bg);

        const name = this.scene.add.text(-200, -10, boxType.name, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        container.add(name);

        const cost = this.scene.add.text(-200, 10, `Cost: $${boxType.cost}`, {
            fontSize: '14px',
            color: '#ffff88'
        }).setOrigin(0, 0.5);
        container.add(cost);

        const dropRatesText = this.getDropRatesText(boxType);
        const dropRates = this.scene.add.text(0, 0, dropRatesText, {
            fontSize: '12px',
            color: '#cccccc'
        }).setOrigin(0.5, 0.7);
        container.add(dropRates);

        const buyButton = this.scene.add.rectangle(180, 0, 80, 40, 0x44aa44);
        buyButton.setStrokeStyle(2, 0x66cc66);
        buyButton.setInteractive({ useHandCursor: true });
        
        const buyText = this.scene.add.text(180, 0, 'BUY', {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        buyButton.on('pointerdown', () => this.purchaseLootBox(boxType));
        buyButton.on('pointerover', () => {
            buyButton.setFillStyle(0x66cc66);
            buyText.setScale(1.1);
        });
        buyButton.on('pointerout', () => {
            buyButton.setFillStyle(0x44aa44);
            buyText.setScale(1.0);
        });

        container.add([buyButton, buyText]);
        container.setData('boxType', boxType);
        container.setData('buyButton', buyButton);
        container.setData('buyText', buyText);

        return container;
    }

    private getDropRatesText(boxType: LootBoxType): string {
        const rates: string[] = [];
        for (const [rarity, chance] of boxType.dropRates.entries()) {
            if (chance > 0) {
                rates.push(`${rarity}: ${chance}%`);
            }
        }
        return rates.join(' | ');
    }

    show(): void {
        this.isVisible = true;
        this.setVisible(true);
        this.updateMoneyDisplay();
        this.updateButtonStates();
        this.selectedIndex = 0;
        this.updateSelection();
    }

    hide(): void {
        this.isVisible = false;
        this.setVisible(false);
        this.removeKeyboardListeners();
        this.emit('lootBoxUIClosed', this.currentPlayerId);
        this.currentPlayerId = null;
        this.currentPlayerKeys = null;
    }

    toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    showForPlayer(playerId: string, controlKeys: ControlKeys): void {
        this.currentPlayerId = playerId;
        this.currentPlayerKeys = controlKeys;
        this.show();
        this.setupKeyboardListeners();
    }

    private setupKeyboardListeners(): void {
        if (!this.currentPlayerKeys) return;

        this.currentPlayerKeys.up.on('down', this.selectPrevious, this);
        this.currentPlayerKeys.down.on('down', this.selectNext, this);
        this.currentPlayerKeys.attack.on('down', this.purchaseSelected, this);
        this.currentPlayerKeys.interact.on('down', this.hide, this);
    }

    private removeKeyboardListeners(): void {
        if (!this.currentPlayerKeys) return;

        this.currentPlayerKeys.up.off('down', this.selectPrevious, this);
        this.currentPlayerKeys.down.off('down', this.selectNext, this);
        this.currentPlayerKeys.attack.off('down', this.purchaseSelected, this);
        this.currentPlayerKeys.interact.off('down', this.hide, this);
    }

    private selectPrevious(): void {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.updateSelection();
    }

    private selectNext(): void {
        this.selectedIndex = Math.min(this.lootBoxContainers.length - 1, this.selectedIndex + 1);
        this.updateSelection();
    }

    private updateSelection(): void {
        this.lootBoxContainers.forEach((container, index) => {
            const bg = container.list[0] as Phaser.GameObjects.Rectangle;
            const boxType = container.getData('boxType') as LootBoxType;
            
            if (index === this.selectedIndex) {
                bg.setStrokeStyle(3, 0xffffff);
            } else {
                bg.setStrokeStyle(2, boxType.color);
            }
        });
    }

    private purchaseSelected(): void {
        if (this.selectedIndex >= 0 && this.selectedIndex < this.lootBoxContainers.length) {
            const container = this.lootBoxContainers[this.selectedIndex];
            const boxType = container.getData('boxType') as LootBoxType;
            this.purchaseLootBox(boxType);
        }
    }

    private purchaseLootBox(boxType: LootBoxType): void {
        const currentMoney = this.moneyManager.getMoney();
        
        if (currentMoney < boxType.cost) {
            this.showMessage('Not enough money!', 0xff4444);
            return;
        }

        this.moneyManager.removeMoney(boxType.cost);

        const tool = LootBoxSystem.openLootBox(boxType);
        
        this.showLootResult(tool);
        
        this.emit('lootBoxOpened', { tool, boxType, playerId: this.currentPlayerId });
    }

    private showLootResult(tool: Tool): void {
        const resultContainer = this.scene.add.container(0, 0);
        
        const resultBg = this.scene.add.rectangle(0, 0, 300, 150, 0x000000, 0.9);
        resultBg.setStrokeStyle(3, LootBoxSystem.getRarityColor(tool.rarity || LootBoxRarity.COMMON));
        
        const resultTitle = this.scene.add.text(0, -50, 'YOU GOT:', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        const toolName = this.scene.add.text(0, -20, tool.name, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
        toolName.setTint(LootBoxSystem.getRarityColor(tool.rarity || LootBoxRarity.COMMON));
        
        const toolStats = this.scene.add.text(0, 10, `Damage: ${tool.damage} | Efficiency: ${tool.efficiency}x`, {
            fontSize: '12px',
            color: '#cccccc'
        }).setOrigin(0.5, 0.5);
        
        const okButton = this.scene.add.text(0, 50, 'OK', {
            fontSize: '16px',
            color: '#44ff44',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
        
        okButton.setInteractive({ useHandCursor: true });
        okButton.on('pointerdown', () => {
            resultContainer.destroy();
        });
        
        resultContainer.add([resultBg, resultTitle, toolName, toolStats, okButton]);
        this.add(resultContainer);
        
        this.scene.time.delayedCall(5000, () => {
            if (resultContainer.active) {
                resultContainer.destroy();
            }
        });
    }

    private showMessage(text: string, color: number = 0xffffff): void {
        const message = this.scene.add.text(0, 150, text, {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5, 0.5);
        
        message.setTint(color);
        this.add(message);

        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            y: 130,
            duration: 2000,
            onComplete: () => message.destroy()
        });
    }

    private updateMoneyDisplay(): void {
        const moneyText = this.list.find(child => child.getData('moneyText')) as Phaser.GameObjects.Text;
        if (moneyText) {
            moneyText.setText(`Money: $${this.moneyManager.getMoney()}`);
        }
    }

    private updateButtonStates(): void {
        const currentMoney = this.moneyManager.getMoney();
        
        this.lootBoxContainers.forEach(container => {
            const boxType = container.getData('boxType') as LootBoxType;
            const buyButton = container.getData('buyButton') as Phaser.GameObjects.Rectangle;
            const buyText = container.getData('buyText') as Phaser.GameObjects.Text;
            
            if (currentMoney >= boxType.cost) {
                buyButton.setFillStyle(0x44aa44);
                buyText.setAlpha(1.0);
                buyButton.setInteractive();
            } else {
                buyButton.setFillStyle(0x666666);
                buyText.setAlpha(0.5);
                buyButton.disableInteractive();
            }
        });
    }

    isOpen(): boolean {
        return this.isVisible;
    }
}