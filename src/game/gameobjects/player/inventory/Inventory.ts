import { BlockType } from "../../../../utils/types/tileTypes";
import { BlockCollection, getDefaultTool, Tool } from "./items/Item";

export class Inventory extends Phaser.Events.EventEmitter {
    private playerId: string;
    private blocks: BlockCollection;
    private tools: Tool[] = [];
    private equippedToolIndex: number = 0; 
    private maxBlockCount: number = 100;

    constructor(playerId: string) {
        super();
        this.playerId = playerId;
        
        this.blocks = {
            [BlockType.BT_EMPTY]: 0, // necessary to index by BlockType
            [BlockType.BT_DIRT]: 0,
            [BlockType.BT_COBBLED_STONE]: 0,
            [BlockType.BT_BEDROCK]: 0,
            [BlockType.BT_LIGHT_STONE]: 0,
            [BlockType.BT_DIAMOND]: 0,
            [BlockType.BT_DARK_STONE]: 0,
            [BlockType.BT_RUBY]: 0,
            [BlockType.BT_SODALITE]: 0,
            [BlockType.BT_BERYL]: 0
        };

        this.addTool(getDefaultTool());
    }

    addBlocks(blockType: BlockType, amount: number): void {
        if (blockType in this.blocks) {
            this.blocks[blockType] += amount;
            console.log(`Added ${amount} of ${BlockType[blockType]} to inventory. New amount: ${this.blocks[blockType]}`);
            this.emit('blocksChanged', {
                playerId: this.playerId,
                blockType,
                newAmount: this.blocks[blockType],
                change: amount
            });
        }
    }

    removeBlocks(blockType: BlockType, amount: number): boolean {
        if (blockType in this.blocks && this.blocks[blockType] >= amount) {
            this.blocks[blockType] -= amount;
            this.emit('blocksChanged', {
                playerId: this.playerId,
                blockType,
                newAmount: this.blocks[blockType],
                change: -amount
            });
            return true;
        }
        return false;
    }

    getBlockCount(blockType: BlockType): number {
        return this.blocks[blockType] || 0;
    }

    getTotalBlockCount(): number {
        // sum of values in this.blocks
        return Object.values(this.blocks).reduce((total, count) => total + count, 0);
    }

    isAtCapacity(): boolean {
        return this.getTotalBlockCount() >= this.getMaxBlockCount();
    }

    getMaxBlockCount(): number {
        return this.maxBlockCount;
    }

    getAllBlocks(): BlockCollection {
        return { ...this.blocks };
    }

    addTool(tool: Tool): void {
        this.tools.push(tool);
        this.emit('toolAdded', {
            playerId: this.playerId,
            tool,
            toolIndex: this.tools.length - 1
        });
    }

    removeTool(index: number): Tool | null {
        if (index >= 0 && index < this.tools.length) {
            const tool = this.tools.splice(index, 1)[0];
            
            if (this.equippedToolIndex >= this.tools.length) {
                this.equippedToolIndex = Math.max(0, this.tools.length - 1);
            }
            
            this.emit('toolRemoved', {
                playerId: this.playerId,
                tool,
                newEquippedIndex: this.equippedToolIndex
            });
            
            return tool;
        }
        return null;
    }

    selectTool(index: number): boolean {
        if (index >= 0 && index < this.tools.length) {
            const previousIndex = this.equippedToolIndex;
            this.equippedToolIndex = index;
            
            this.emit('toolSelected', {
                playerId: this.playerId,
                previousIndex,
                newIndex: index,
                tool: this.tools[index]
            });
            
            return true;
        }
        return false;
    }

    selectNextTool(): void {
        if (this.tools.length > 0) {
            const nextIndex = (this.equippedToolIndex + 1) % this.tools.length;
            this.selectTool(nextIndex);
        }
    }

    selectPreviousTool(): void {
        if (this.tools.length > 0) {
            const prevIndex = this.equippedToolIndex === 0 
                ? this.tools.length - 1 
                : this.equippedToolIndex - 1;
            this.selectTool(prevIndex);
        }
    }

    getEquippedTool(): Tool | null {
        return this.tools[this.equippedToolIndex] || null;
    }

    getAllTools(): Tool[] {
        console.log('getAllTools called', this.tools);
        return [...this.tools]; 
    }

    getEquippedToolIndex(): number {
        return this.equippedToolIndex;
    }

    getMiningDamage(): number {
        const tool = this.getEquippedTool();
        const baseDamage = 10;
        return tool ? baseDamage * tool.damage / 10 : baseDamage;
    }

    getPlayerId(): string {
        return this.playerId;
    }

    setUIVisible(isVisible: boolean): void {
        this.emit('uiVisibilityChanged', {
            playerId: this.playerId,
            isVisible
        });
    }

    destroy(): void {
        this.removeAllListeners();
    }
}