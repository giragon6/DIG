import { Scene, GameObjects } from 'phaser';

export class Tutorial extends Scene {
    private currentStep: number = 0;
    private tutorialSteps: TutorialStep[] = [];
    private stepText: GameObjects.Text;
    private instructionText: GameObjects.Text;
    private skipText: GameObjects.Text;
    private progressBar: GameObjects.Rectangle;
    private progressFill: GameObjects.Rectangle;
    private demoSprite: GameObjects.Sprite;
    private keyPrompts: GameObjects.Group;

    constructor() {
        super('Tutorial');
    }

    create() {
        this.add.image(512, 384, 'background1');
        
        this.add.text(512, 80, 'TUTORIAL', {
            fontFamily: 'Arial Black', 
            fontSize: 48, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.createUI();
        this.setupTutorialSteps();
        this.setupInputHandlers();
        this.showCurrentStep();
    }

    private createUI(): void {
        this.progressBar = this.add.rectangle(512, 150, 400, 20, 0x444444);
        this.progressBar.setStrokeStyle(2, 0xffffff);
        
        this.progressFill = this.add.rectangle(312, 150, 0, 16, 0x44ff44);
        
        this.stepText = this.add.text(512, 180, '', {
            fontFamily: 'Arial Black', 
            fontSize: 24, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.instructionText = this.add.text(512, 350, '', {
            fontFamily: 'Arial Black', 
            fontSize: 20, 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);

        this.demoSprite = this.add.sprite(512, 250, 'idle', 'idle0').setScale(4).setVisible(false);

        this.keyPrompts = this.add.group();

        this.skipText = this.add.text(512, 700, 'Press ESC to skip tutorial or ENTER to continue', {
            fontFamily: 'Arial Black', 
            fontSize: 16, 
            color: '#cccccc',
            stroke: '#000000', 
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);
    }

    private setupTutorialSteps(): void {
        this.tutorialSteps = [
            {
                title: 'Welcome to DIG!',
                instruction: 'This tutorial will teach you the basic controls.\nPress ENTER to continue or ESC to skip.',
                demoAction: 'none',
                requiredKeys: []
            },
            {
                title: 'Movement - Left & Right',
                instruction: 'Use A/D (Player 1), Arrow Keys (Player 2), F/H (Player 3), or J/L (Player 4) to move left and right.\nTry moving around!',
                demoAction: 'movement',
                requiredKeys: ['left', 'right']
            },
            {
                title: 'Jumping',
                instruction: 'Press W (P1), UP Arrow (P2), T (P3), or I (P4) to jump.\nTry jumping a few times!',
                demoAction: 'jump',
                requiredKeys: ['up']
            },
            {
                title: 'Mining Blocks',
                instruction: 'Press ATK [Q (P1), / (P2), R (P3), or U (P4)] to enter block selection mode. The block underneath you will be selected first.',
                demoAction: 'ATK',
                requiredKeys: ['ATK']
            },
            {
                title: 'Confirming Mine',
                instruction: 'Press INT [E (P1), SHIFT (P2), Y (P3), or O (P4)] repeatedly to mine the selected block.\nYou can also press your left/right keys to select adjacent blocks.',
                demoAction: 'INT',
                requiredKeys: ['INT']
            },
            {
                title: 'Selecting Tools',
                instruction: 'Hold down your interact key and then press your left/right keys to select another tool once you get one',
                demoAction: 'INT', 
                requiredKeys: ['INT']
            },
            {
                title: 'Wall Climbing',
                instruction: 'Press S (P1), DOWN Arrow (P2), G (P3), or K (P4) next to a wall to enter climbing mode.\nThen, press your UP key to climb up!',
                demoAction: 'climb',
                requiredKeys: ['down']
            },
            {
                title: 'Tutorial Complete!',
                instruction: 'You\'re ready to start digging!\nGood luck and have fun mining!\nPress ENTER to return to the main menu.',
                demoAction: 'none',
                requiredKeys: []
            }
        ];
    }

    private setupInputHandlers(): void {
        this.input.keyboard?.on('keydown-ESC', () => {
            this.scene.start('MainMenu');
        });

        this.input.keyboard?.on('keydown-ENTER', () => {
            if (this.currentStep < this.tutorialSteps.length - 1) {
                this.nextStep();
            } else {
                this.scene.start('MainMenu');
            }
        });

        // Player 1 controls (WASD + QE)
        this.input.keyboard?.on('keydown-A', () => this.handleKeyPress('left'));
        this.input.keyboard?.on('keydown-D', () => this.handleKeyPress('right'));
        this.input.keyboard?.on('keydown-W', () => this.handleKeyPress('up'));
        this.input.keyboard?.on('keydown-S', () => this.handleKeyPress('down'));
        this.input.keyboard?.on('keydown-Q', () => this.handleKeyPress('ATK'));
        this.input.keyboard?.on('keydown-E', () => this.handleKeyPress('INT'));

        // Player 2 controls (Arrows + /Shift)
        this.input.keyboard?.on('keydown-LEFT', () => this.handleKeyPress('left'));
        this.input.keyboard?.on('keydown-RIGHT', () => this.handleKeyPress('right'));
        this.input.keyboard?.on('keydown-UP', () => this.handleKeyPress('up'));
        this.input.keyboard?.on('keydown-DOWN', () => this.handleKeyPress('down'));
        this.input.keyboard?.on('keydown-FORWARD_SLASH', () => this.handleKeyPress('ATK'));
        this.input.keyboard?.on('keydown-SHIFT', () => this.handleKeyPress('INT'));

        // Player 3 controls (TFGH + RY)
        this.input.keyboard?.on('keydown-F', () => this.handleKeyPress('left'));
        this.input.keyboard?.on('keydown-H', () => this.handleKeyPress('right'));
        this.input.keyboard?.on('keydown-T', () => this.handleKeyPress('up'));
        this.input.keyboard?.on('keydown-G', () => this.handleKeyPress('down'));
        this.input.keyboard?.on('keydown-R', () => this.handleKeyPress('ATK'));
        this.input.keyboard?.on('keydown-Y', () => this.handleKeyPress('INT'));

        // Player 4 controls (IJKL + UO)
        this.input.keyboard?.on('keydown-J', () => this.handleKeyPress('left'));
        this.input.keyboard?.on('keydown-L', () => this.handleKeyPress('right'));
        this.input.keyboard?.on('keydown-I', () => this.handleKeyPress('up'));
        this.input.keyboard?.on('keydown-K', () => this.handleKeyPress('down'));
        this.input.keyboard?.on('keydown-U', () => this.handleKeyPress('ATK'));
        this.input.keyboard?.on('keydown-O', () => this.handleKeyPress('INT'));
    }

    private handleKeyPress(keyType: string): void {
        const currentStepData = this.tutorialSteps[this.currentStep];
        
        if (currentStepData.requiredKeys.includes(keyType)) {
            this.performDemoAction(currentStepData.demoAction, keyType);
        }
    }

    private performDemoAction(action: string, keyType: string): void {
        switch (action) {
            case 'movement':
                if (keyType === 'left') {
                    this.tweens.add({
                        targets: this.demoSprite,
                        x: this.demoSprite.x - 50,
                        duration: 200,
                        yoyo: true
                    });
                } else if (keyType === 'right') {
                    this.tweens.add({
                        targets: this.demoSprite,
                        x: this.demoSprite.x + 50,
                        duration: 200,
                        yoyo: true
                    });
                }
                break;
                
            case 'jump':
                this.tweens.add({
                    targets: this.demoSprite,
                    y: this.demoSprite.y - 80,
                    duration: 300,
                    ease: 'Power2',
                    yoyo: true
                });
                break;
                
            case 'ATK':
                this.demonstrateBlockMining();
                break;
                
            case 'INT':
                if (this.currentStep === 4) { 
                    this.demonstrateMiningConfirmation();
                } else if (this.currentStep === 5) { 
                    this.demonstrateToolSelection();
                }
                break;
                
            case 'climb':
                this.demonstrateWallClimbing();
                break;
        }
    }

    private demonstrateBlockMining(): void {
        // Create ground blocks
        const groundTiles = this.add.group();
        for (let i = 0; i < 5; i++) {
            const tile = this.add.image(400 + (i * 64), 245, 'ground_tiles', 1); 
            tile.setDisplaySize(64, 64);
            groundTiles.add(tile);
        }

        // Show block selection
        const selectionOverlay = this.add.image(450 + (2 * 64), 245, 'selection_tiles', 0);
        selectionOverlay.setDisplaySize(64, 64);
        selectionOverlay.setAlpha(0.7);

        // Selection effect
        this.tweens.add({
            targets: selectionOverlay,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: 2
        });

        // Add instruction text
        const instructionText = this.add.text(512, 300, 'Block Selected for Mining!', {
            fontSize: '16px',
            color: '#ff4444',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Clean up after demo
        this.time.delayedCall(1500, () => {
            groundTiles.destroy(true);
            selectionOverlay.destroy();
            instructionText.destroy();
        });
    }

    private demonstrateMiningConfirmation(): void {
        const block = this.add.image(512, 240, 'ground_tiles', 1); // Light stone
        block.setDisplaySize(64, 64);
        
        const damageOverlay = this.add.image(512, 240, 'damage_tiles', 0);
        damageOverlay.setAlpha(0.7);

        let frameIndex = 0;
        const damageFrames = [0, 1, 2, 3];
        const damageInterval = setInterval(() => {
            if (frameIndex < damageFrames.length) {
                damageOverlay.setFrame(damageFrames[frameIndex]);
                frameIndex++;
            } else {
                clearInterval(damageInterval);
                block.destroy();
                damageOverlay.destroy();
            }
        }, 300);
    }

    private demonstrateToolSelection(): void {
        // Show tool icons
        const toolBg = this.add.rectangle(512, 245, 200, 80, 0x333333);
        toolBg.setStrokeStyle(2, 0x666666);

        const pickaxe1 = this.add.image(450, 245, 'pickaxes', 'basic_pickaxe');
        pickaxe1.setDisplaySize(40, 40);
        pickaxe1.setTint(0x888888); // Dimmed

        const pickaxe2 = this.add.image(512, 245, 'pickaxes', 'iron_pickaxe');
        pickaxe2.setDisplaySize(40, 40);
        pickaxe2.setTint(0xffffff); // Highlighted

        const pickaxe3 = this.add.image(574, 245, 'pickaxes', 'steel_pickaxe');
        pickaxe3.setDisplaySize(40, 40);
        pickaxe3.setTint(0x888888); // Dimmed

        // Selection arrows
        const leftArrow = this.add.text(420, 245, '◀', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const rightArrow = this.add.text(604, 245, '▶', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Tool name
        const toolName = this.add.text(512, 245, 'Iron Pickaxe', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Animate selection change
        this.time.delayedCall(500, () => {
            // Move to next tool
            pickaxe2.setTint(0x888888);
            pickaxe3.setTint(0xffffff);
            toolName.setText('Steel Pickaxe');
        });

        const instructionText = this.add.text(512, 300, 'Tool Selected!', {
            fontSize: '16px',
            color: '#44ff44',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Clean up
        this.time.delayedCall(1500, () => {
            [toolBg, pickaxe1, pickaxe2, pickaxe3, leftArrow, rightArrow, toolName, instructionText].forEach(obj => {
                if (obj.active) obj.destroy();
            });
        });
    }

    private demonstrateWallClimbing(): void {
        const wallTiles = this.add.group();
        for (let i = 0; i < 4; i++) {
            const tile = this.add.image(450, 280 - (i * 64), 'ground_tiles', 3);
            tile.setDisplaySize(64, 64);
            wallTiles.add(tile);
        }

        this.demoSprite.setPosition(380, 280);
        this.demoSprite.setVisible(true);

        this.tweens.add({
            targets: this.demoSprite,
            y: this.demoSprite.y - 128,
            duration: 1000,
            ease: 'Power2'
        });

        const instructionText = this.add.text(512, 300, 'Climbing Wall!', {
            fontSize: '16px',
            color: '#44ff44',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Clean up
        this.time.delayedCall(1500, () => {
            wallTiles.destroy(true);
            this.demoSprite.setVisible(false);
            this.demoSprite.setPosition(512, 250);
            if (instructionText.active) instructionText.destroy();
        });
    }

    private showCurrentStep(): void {
        const step = this.tutorialSteps[this.currentStep];
        
        this.stepText.setText(`Step ${this.currentStep + 1} of ${this.tutorialSteps.length}: ${step.title}`);
        
        this.instructionText.setText(step.instruction);
        
        const progress = (this.currentStep / (this.tutorialSteps.length - 1)) * 400;
        this.progressFill.setSize(progress, 16);
        this.progressFill.setPosition(312 + progress / 2, 150);
        
        // Show demo sprite for certain actions
        const showSpriteActions = ['movement', 'jump', 'climb'];
        this.demoSprite.setVisible(showSpriteActions.includes(step.demoAction));
        
        this.keyPrompts.clear(true, true);
        
        this.showKeyPrompts(step.requiredKeys);
    }

    private showKeyPrompts(keys: string[]): void {
        keys.forEach((key, index) => {
            const keyPrompt = this.add.text(
                400 + (index * 150), 
                450, 
                key, 
                {
                    fontSize: '16px',
                    color: '#ffff44',
                    backgroundColor: '#333333',
                    padding: { x: 8, y: 6 },
                    stroke: '#ffffff',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
            
            this.keyPrompts.add(keyPrompt);
            
            this.tweens.add({
                targets: keyPrompt,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        });
    }

    private nextStep(): void {
        this.currentStep++;
        if (this.currentStep >= this.tutorialSteps.length) {
            this.scene.start('MainMenu');
            return;
        }
        this.showCurrentStep();
    }
}

interface TutorialStep {
    title: string;
    instruction: string;
    demoAction: 'none' | 'movement' | 'jump' | 'ATK' | 'INT' | 'climb';
    requiredKeys: string[];
}
