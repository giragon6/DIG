import { MoneyManager } from "../../capitalism/MoneyManager";

export class MoneyDisplayUI extends Phaser.GameObjects.Container {    
    private moneyDisplay: Phaser.GameObjects.Container;
    private moneyManager: MoneyManager;
    static moneyDisplayWidth: number = 130;
    static moneyDisplayHeight: number = 25;

    constructor(
        scene: Phaser.Scene,  
        moneyX: number, 
        moneyY: number, 
    ) {
        super(scene, 0, 0);
        this.moneyManager = MoneyManager.getInstance();
        
        this.createMoneyDisplay(moneyX, moneyY);
        this.setupEventHandlers();
        
        this.setScrollFactor(0);
        this.setDepth(2001);   
    }

    private createMoneyDisplay(x: number, y: number): void {
        this.moneyDisplay = new Phaser.GameObjects.Container(this.scene, x, y);
        
        const bg = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, MoneyDisplayUI.moneyDisplayWidth, MoneyDisplayUI.moneyDisplayHeight, 0x228822);
        bg.setStrokeStyle(2, 0x44aa44);
        
        const moneyText = new Phaser.GameObjects.Text(this.scene, 0, 0, '$0', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        this.moneyDisplay.add([bg, moneyText]);
        this.moneyDisplay.setData('moneyText', moneyText);
        this.moneyDisplay.setScrollFactor(0);
        this.moneyDisplay.setDepth(2000);

        this.add(this.moneyDisplay);
        
        this.updateMoneyDisplay();
    }

    private setupEventHandlers(): void {
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

    static getWidth(): number {
        return MoneyDisplayUI.moneyDisplayWidth;
    }

    getAllUIElements(): Phaser.GameObjects.GameObject[] {
        return [this.moneyDisplay, this];
    }

    destroy(): void {
        this.moneyManager.off('moneyChanged', this.onMoneyChanged, this);
    
        if (this.moneyDisplay) {
            this.moneyDisplay.destroy();
        }
        
        super.destroy();
    }
}