export class MoneyManager extends Phaser.Events.EventEmitter {
    private currentMoney: number = 0;
    private static instance: MoneyManager;

    constructor() {
        super();
    }

    static getInstance(): MoneyManager {
        if (!MoneyManager.instance) {
            MoneyManager.instance = new MoneyManager();
        }
        return MoneyManager.instance;
    }

    addMoney(amount: number): void {
        this.currentMoney += amount;
        this.emit('moneyChanged', {
            newAmount: this.currentMoney,
            change: amount
        });
    }

    removeMoney(amount: number): boolean {
        if (this.currentMoney >= amount) {
            this.currentMoney -= amount;
            this.emit('moneyChanged', {
                newAmount: this.currentMoney,
                change: -amount
            });
            return true;
        }
        return false;
    }

    getMoney(): number {
        return this.currentMoney;
    }

    setMoney(amount: number): void {
        const change = amount - this.currentMoney;
        this.currentMoney = amount;
        this.emit('moneyChanged', {
            newAmount: this.currentMoney,
            change: change
        });
    }
}