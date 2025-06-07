// import { BlockType } from "../../../utils/types";
import { Inventory } from "../player/inventory/Inventory";

export class InventoryUI extends Phaser.GameObjects.Container {    
    private inventory: Inventory;
    private totalBlockCountDisplay: Phaser.GameObjects.Container;
    private toolDisplay: Phaser.GameObjects.Container;
    private isToolSelectorVisible: boolean = false;
    private allUIElements: Phaser.GameObjects.GameObject[] = [];

    constructor(
        scene: Phaser.Scene, 
        inventoryX: number, 
        inventoryY: number, 
        inventory: Inventory
    ) {
        super(scene, inventoryX, inventoryY);
        this.inventory = inventory;
        
        this.createBlockDisplays(0, 0);
        this.createToolDisplay(0, - 40);
        this.setupEventHandlers();
        
        this.setScrollFactor(0);  
        this.setDepth(2000);       
    }

    private createBlockDisplays(x: number, y: number): void {   
        this.totalBlockCountDisplay = new Phaser.GameObjects.Container(this.scene, x, y);

        const bg = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 130, 25, 0x222222)
        bg.setStrokeStyle(2, 0x666666);

        const countText = new Phaser.GameObjects.Text(this.scene, 0, 0, '0/0', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        this.totalBlockCountDisplay.add([bg, countText]);
        this.totalBlockCountDisplay.setData('countText', countText);
        this.totalBlockCountDisplay.setScrollFactor(0);

        this.add(this.totalBlockCountDisplay);
        
        this.allUIElements.push(this.totalBlockCountDisplay);
        this.updateTotalBlockCount();
    }

    private createToolDisplay(x: number, y: number): void {
        this.toolDisplay = new Phaser.GameObjects.Container(this.scene, x, y);
        
        const toolBg = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, 200, 60, 0x333333);
        toolBg.setStrokeStyle(2, 0x666666);
        
        const toolIcon = new Phaser.GameObjects.Image(this.scene, -60, 0, 'basic_pickaxe');
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
        this.toolDisplay.setScrollFactor(0);

        this.add(this.toolDisplay);
        
        this.allUIElements.push(this.toolDisplay);
        this.updateToolDisplay();
    }

    getAllUIElements(): Phaser.GameObjects.GameObject[] {
        return [
            this.totalBlockCountDisplay,
            this.toolDisplay,
            ...this.allUIElements
        ];
    }

    getPlayerId(): string {
        return this.inventory.getPlayerId();
    }

    private setupEventHandlers(): void {
        this.inventory.on('blocksChanged', this.onBlocksChanged, this);
        this.inventory.on('toolSelected', this.onToolSelected, this);
        this.inventory.on('toolAdded', this.onToolAdded, this);
        this.inventory.on('uiVisibilityChanged', (data: {playerId: string, isVisible: boolean}) => {
            if (data.playerId !== this.inventory.getPlayerId()) return;
            if (data.isVisible) {
                this.showToolSelector();
            } else {
                this.hideToolSelector();
            } 
        });
    }

    private onBlocksChanged(): void {
        this.updateTotalBlockCount();
    }

    private onToolSelected(): void {
        this.updateToolDisplay();
    }

    private onToolAdded(): void {
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

    private updateToolDisplay(): void {
        const tool = this.inventory.getEquippedTool();
        const tools = this.inventory.getAllTools();
        const currentIndex = this.inventory.getEquippedToolIndex();
        
        if (tool) {
            console.log(`Updating tool display: ${tool.name} (ID: ${tool.id}) at index ${currentIndex}`);
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
        console.log('Showing tool selector');
        this.isToolSelectorVisible = true;
        this.updateToolDisplay();
    }

    hideToolSelector(): void {
        console.log('Hiding tool selector');
        this.isToolSelectorVisible = false;
        this.updateToolDisplay();
    }

    destroy(): void {
        this.inventory.off('blocksChanged', this.onBlocksChanged, this);
        this.inventory.off('toolSelected', this.onToolSelected, this);
        this.inventory.off('toolAdded', this.onToolAdded, this);
        
        this.allUIElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        
        super.destroy();
    }
}