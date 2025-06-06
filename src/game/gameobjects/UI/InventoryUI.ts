// import { BlockType } from "../../../utils/types";
import { MoneyManager } from "../../capitalism/MoneyManager";
import { Inventory } from "../player/inventory/Inventory";

export class InventoryUI extends Phaser.GameObjects.Container {    
    private inventory: Inventory;
    // private blockDisplays: Map<BlockType, Phaser.GameObjects.Container> = new Map();
    private totalBlockCountDisplay: Phaser.GameObjects.Container = this.scene.add.container(-35, 50);
    private moneyDisplay: Phaser.GameObjects.Container;
    private toolDisplay: Phaser.GameObjects.Container;
    private isToolSelectorVisible: boolean = false;
    private moneyManager: MoneyManager; 

    constructor(scene: Phaser.Scene, x: number, y: number, inventory: Inventory) {
        super(scene, x, y);
        this.inventory = inventory;
        this.moneyManager = MoneyManager.getInstance();
        
        this.createMoneyDisplay();
        this.createBlockDisplays();
        this.createToolDisplay();
        this.setupEventHandlers();
        
        scene.add.existing(this);
    }

    private createMoneyDisplay(): void {
        // get width of the scene

        this.moneyDisplay = this.scene.add.container(this.scene.scale.width/2 - 130, -10);
        
        const bg = this.scene.add.rectangle(0, 0, 130, 25, 0x228822);
        bg.setStrokeStyle(2, 0x44aa44);
        
        const moneyText = this.scene.add.text(0, 0, '$0', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        this.moneyDisplay.add([bg, moneyText]);
        this.moneyDisplay.setData('moneyText', moneyText);
        this.add(this.moneyDisplay);
        
        this.updateMoneyDisplay();
    }

    private createBlockDisplays(): void {
        const bg = this.scene.add.rectangle(0, 0, 130, 25, 0x222222);

        const countText = this.scene.add.text(0, 0, '0/0', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        bg.setStrokeStyle(2, 0x666666);
        this.totalBlockCountDisplay.add([bg, countText]);
        this.totalBlockCountDisplay.setData('countText', countText);
        this.add(this.totalBlockCountDisplay);

        // const blockTypes = Object.values(BlockType).filter(value => typeof value === 'number') as BlockType[];

        // blockTypes.forEach((blockType, index) => {
        //     const container = this.scene.add.container(-80, 20 + index * 40);
            
        //     const icon = this.scene.add.image(0, 0, `ground_tiles`, blockType);
        //     icon.setDisplaySize(32, 32);

        //     const countText = this.scene.add.text(40, 0, '0', {
        //         fontSize: '16px',
        //         color: '#ffffff'
        //     }).setOrigin(0, 0.5);
            
        //     container.add([icon, countText]);
        //     container.setData('blockType', blockType);
        //     container.setData('countText', countText);
            
        //     this.blockDisplays.set(blockType, container);
        //     this.add(container);
        // });

        this.updateTotalBlockCount();
        // this.updateAllBlockCounts();
    }

    private createToolDisplay(): void {
        this.toolDisplay = this.scene.add.container(0, 0);
        
        const toolBg = this.scene.add.rectangle(0, 0, 200, 60, 0x333333);
        toolBg.setStrokeStyle(2, 0x666666);
        
        const toolIcon = this.scene.add.image(-60, 0, 'basic_pickaxe');
        toolIcon.setDisplaySize(40, 40);
        toolIcon.setData('toolIcon', true);
        
        const toolName = this.scene.add.text(0, -10, 'Basic Pickaxe', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        toolName.setData('toolName', true);
        
        const leftArrow = this.scene.add.text(-90, 25, '◀', {
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(0.5, 0.5).setVisible(false);
        
        const rightArrow = this.scene.add.text(90, 25, '▶', {
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(0.5, 0.5).setVisible(false);
        
        const toolIndex = this.scene.add.text(0, 25, '1/1', {
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(0.5, 0.5).setVisible(false);
        
        this.toolDisplay.add([toolBg, toolIcon, toolName, leftArrow, rightArrow, toolIndex]);
        this.toolDisplay.setData('leftArrow', leftArrow);
        this.toolDisplay.setData('rightArrow', rightArrow);
        this.toolDisplay.setData('toolIndex', toolIndex);
        
        this.add(this.toolDisplay);
        this.updateToolDisplay();
    }

    private setupEventHandlers(): void {
        console.log('Setting up InventoryUI event handlers');
        this.inventory.on('blocksChanged', this.onBlocksChanged, this);
        this.inventory.on('toolSelected', this.onToolSelected, this);
        this.inventory.on('toolAdded', this.onToolAdded, this);
        this.moneyManager.on('moneyChanged', this.onMoneyChanged, this);
    }

    private onMoneyChanged(data: any): void {
        this.updateMoneyDisplay();
    }

    private updateMoneyDisplay(): void {
        const display = this.moneyDisplay;
        if (display) {
            const moneyText = display.getData('moneyText') as Phaser.GameObjects.Text;
            const money = this.moneyManager.getMoney();
            moneyText.setText(`$${money}`);
        }
    }

    private onBlocksChanged(data: any): void {
        this.updateTotalBlockCount();
        // this.updateBlockCount(data.blockType);
    }

    private onToolSelected(data: any): void {
        this.updateToolDisplay();
    }

    private onToolAdded(data: any): void {
        this.updateToolDisplay();
    }

    private updateTotalBlockCount(): void {
        const display = this.totalBlockCountDisplay;
        if (display) {
            const countText = display.getData('countText') as Phaser.GameObjects.Text;
            const count = this.inventory.getTotalBlockCount();
            const max = this.inventory.getMaxBlockCount();
            countText.setText(count.toString() + '/' + max.toString());
        }
    }

    // private updateBlockCount(blockType: BlockType): void {
    //     const display = this.blockDisplays.get(blockType);
    //     if (display) {
    //         const countText = display.getData('countText') as Phaser.GameObjects.Text;
    //         const count = this.inventory.getBlockCount(blockType);
    //         countText.setText(count.toString());
            
    //         display.setVisible(count > 0);
    //     }
    // }

    // private updateAllBlockCounts(): void {
    //     Object.values(BlockType).forEach(blockType => {
    //         if (typeof blockType === 'number') {
    //             this.updateBlockCount(blockType);
    //         }
    //     });
    // }

    private updateToolDisplay(): void {
        const tool = this.inventory.getEquippedTool();
        const tools = this.inventory.getAllTools();
        const currentIndex = this.inventory.getEquippedToolIndex();
        
        if (tool) {
            const toolIcon = this.toolDisplay.list.find(child => 
                child.getData('toolIcon')
            ) as Phaser.GameObjects.Image;
            
            const toolName = this.toolDisplay.list.find(child => 
                child.getData('toolName')
            ) as Phaser.GameObjects.Text;
            
            if (toolIcon) toolIcon.setTexture(tool.id);
            if (toolName) toolName.setText(tool.name);
            
            const leftArrow = this.toolDisplay.getData('leftArrow') as Phaser.GameObjects.Text;
            const rightArrow = this.toolDisplay.getData('rightArrow') as Phaser.GameObjects.Text;
            const toolIndex = this.toolDisplay.getData('toolIndex') as Phaser.GameObjects.Text;
            
            const showSelector = this.isToolSelectorVisible && tools.length > 1;
            leftArrow.setVisible(showSelector);
            rightArrow.setVisible(showSelector);
            toolIndex.setVisible(showSelector);
            
            if (showSelector) {
                toolIndex.setText(`${currentIndex + 1}/${tools.length}`);
            }
        }
    }

    showToolSelector(): void {
        this.isToolSelectorVisible = true;
        this.updateToolDisplay();
    }

    hideToolSelector(): void {
        this.isToolSelectorVisible = false;
        this.updateToolDisplay();
    }

    destroy(): void {
        this.inventory.off('blocksChanged', this.onBlocksChanged, this);
        this.inventory.off('toolSelected', this.onToolSelected, this);
        this.inventory.off('toolAdded', this.onToolAdded, this);
        this.moneyManager.off('moneyChanged', this.onMoneyChanged, this);
        super.destroy();
    }
}