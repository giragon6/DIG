import { WorldScene } from '../../utils/types/sceneTypes';
import { LootBoxType } from '../capitalism/LootBox';
import { DumpTruck } from '../gameobjects/commerce/DumpTruck';
import { Tool } from '../gameobjects/player/inventory/items/Item';
import Player from '../gameobjects/player/Player';
import { InventoryUI } from '../gameobjects/UI/InventoryUI';
import { MoneyDisplayUI } from '../gameobjects/UI/MoneyDisplayUI';
import World from '../map/World';
import { CameraManager } from '../utils/CameraManager';

export class Game extends WorldScene {
    camera: Phaser.Cameras.Scene2D.Camera;

    private players: Map<string, Player> = new Map();
    private world: World;
    // private bg: Phaser.GameObjects.TileSprite;

    private inventoryUIs: Map<string, InventoryUI> = new Map();
    private moneyDisplayUI: MoneyDisplayUI;
    private cameraManager: CameraManager;

    private playerMap: Map<string, Player> = new Map();

    private dumpTruck: DumpTruck;
    private playerNearDumpTruck: Map<string, boolean> = new Map();    

    private currentLootBoxPlayer: string | null = null;

    private playerConfigs = [
        {
            id: 'player1',
            keys: {
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                attack: Phaser.Input.Keyboard.KeyCodes.Q,
                interact: Phaser.Input.Keyboard.KeyCodes.E,
            },
            tint: 0xff0000,
            spawnOffset: 200
        },
        {
            id: 'player2',
            keys: {
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                attack: Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH,
                interact: Phaser.Input.Keyboard.KeyCodes.SHIFT,
            },
            tint: 0x0055ff,
            spawnOffset: 400
        },
        {
            id: 'player3',
            keys: {
                left: Phaser.Input.Keyboard.KeyCodes.F,
                right: Phaser.Input.Keyboard.KeyCodes.H,
                up: Phaser.Input.Keyboard.KeyCodes.T,
                down: Phaser.Input.Keyboard.KeyCodes.G,
                attack: Phaser.Input.Keyboard.KeyCodes.R,
                interact: Phaser.Input.Keyboard.KeyCodes.Y,
            },
            tint: 0x00ff00,
            spawnOffset: 600
        },
        {
            id: 'player4',
            keys: {
                left: Phaser.Input.Keyboard.KeyCodes.J,
                right: Phaser.Input.Keyboard.KeyCodes.L,
                up: Phaser.Input.Keyboard.KeyCodes.I,
                down: Phaser.Input.Keyboard.KeyCodes.K,
                attack: Phaser.Input.Keyboard.KeyCodes.U,
                interact: Phaser.Input.Keyboard.KeyCodes.O,
            },
            tint: 0xffff00,
            spawnOffset: 800
        }
    ];

    private activePlayerCount: number;

    constructor() {
        super('Game');
    }

    create(data: {numPlayers: number}) {
        this.physics.world.setBounds(0, 0, 2304, 1296, true, true, true, false);
        this.camera = this.cameras.main;
        this.world = new World(this);
        this.cameraManager = new CameraManager(this);
        this.activePlayerCount = data.numPlayers;

        this.createPlayers();
        this.setupDumpTruck();
        this.setupInputHandlers();
        this.setupCameras();
        this.setupInventoryUIs();
        this.setupCollisions();
    }

    private createPlayers(): void {
        for (let i = 0; i < this.activePlayerCount; i++) {
            const config = this.playerConfigs[i];
            const spawn = this.world.getValidSpawnPosition(config.spawnOffset);
            
            const controlKeys = {
                left: this.input.keyboard!.addKey(config.keys.left),
                right: this.input.keyboard!.addKey(config.keys.right),
                up: this.input.keyboard!.addKey(config.keys.up),
                down: this.input.keyboard!.addKey(config.keys.down),
                attack: this.input.keyboard!.addKey(config.keys.attack),
                interact: this.input.keyboard!.addKey(config.keys.interact),
            };

            const player = new Player(this, spawn.x, spawn.y, config.id, controlKeys, config.tint);
            
            this.players.set(config.id, player);
            this.playerMap.set(config.id, player);
            this.playerNearDumpTruck.set(config.id, false);
        }
    }

    private setupDumpTruck(): void {
        const dumpTruckSpawn = this.world.getValidSpawnPosition(1000);
        this.dumpTruck = new DumpTruck(this, dumpTruckSpawn.x, dumpTruckSpawn.y - 32, 300);
        this.dumpTruck.on('toolPurchased', this.handleToolPurchased, this);
        this.dumpTruck.getLootBoxUI().on('lootBoxUIClosed', this.handleLootBoxUIClosed, this);
        this.dumpTruck.getLootBoxUI().setDepth(1000);
    }

    private setupCameras(): void {
        const playerIds = Array.from(this.players.keys());
        const targets = playerIds.map(id => this.players.get(id)!.sprite);
        this.cameraManager.createCamerasForPlayers(playerIds, targets);
    }

    private setupInventoryUIs(): void {
        const playerIds = Array.from(this.players.keys());
        
        this.moneyDisplayUI = new MoneyDisplayUI(this, this.scale.width / 2 - (playerIds.length % 2 == 0 ? MoneyDisplayUI.getWidth() / 2 + 20 : 0), 30);
        this.add.existing(this.moneyDisplayUI);
        this.camera.ignore(this.moneyDisplayUI);
        this.cameraManager.ignoreForAllPlayerCameras(this.moneyDisplayUI);
        this.cameraManager.addToUICamera(this.moneyDisplayUI);
                
        playerIds.forEach((playerId, index) => {
            const player = this.players.get(playerId)!;
            const camera = this.cameraManager.getCameraForPlayer(playerId);

            const cameraScale = (1 / playerIds.length) * 0.2 + 0.8;
            
            if (camera) {
                const inventoryUI = new InventoryUI(
                    this, 
                    130 * cameraScale,
                    100 * cameraScale, 
                    player.inventory
                );
                
                this.setupCameraVisibility(inventoryUI, camera, playerIds);

                inventoryUI.setScale(cameraScale);
                
                this.inventoryUIs.set(playerId, inventoryUI);

                this.add.existing(inventoryUI);
                this.camera.ignore(inventoryUI)
            }
        });

    }

    private setupCameraVisibility(ui: InventoryUI, playerCamera: Phaser.Cameras.Scene2D.Camera, allPlayerIds: string[]): void {
        this.cameraManager.getCameras().forEach((camera) => {
            if (camera !== playerCamera) {
                camera.ignore(ui.getAllUIElements());
            }
        });
        
        playerCamera.ignore([]);
        
        allPlayerIds.forEach(otherPlayerId => {
            if (otherPlayerId !== ui.getPlayerId()) {
                const otherUI = this.inventoryUIs.get(otherPlayerId);
                if (otherUI) {
                    playerCamera.ignore(otherUI.getAllUIElements());
                }
            }
        });
    }

    private setupCollisions(): void {
        this.players.forEach((player) => {
            this.physics.add.collider(player.sprite, this.world.getMineLayer());
        });
    }

        private setupInputHandlers(): void {
        for (const [playerId, player] of this.playerMap.entries()) {
            player.getControlKeys().down.on('down', () => {
                if (!this.currentLootBoxPlayer || this.currentLootBoxPlayer !== playerId) {
                    this.handleDumpTruckInteraction(playerId);
                }
            });
            player.getControlKeys().interact.on('down', () => {
                // if player isnt nearby, return
                const playerNear = this.playerNearDumpTruck.get(playerId) || false;
                if (!playerNear) return;
                if (this.currentLootBoxPlayer && this.currentLootBoxPlayer !== playerId) return;

                console.log(`${playerId} is interacting with the dump truck`);
                this.handleLootBoxInteraction(playerId);
            });
        }
    }

    private handleLootBoxUIClosed(playerId: string): void {
        console.log(`Loot box UI closed for player ${playerId}`);
        this.playerMap.get(playerId)?.setInteracting(false);
        this.currentLootBoxPlayer = null;
    };

    update(time: number, delta: number): void {
        this.world.update(time, delta);
        this.players.forEach(player => player.update());

        this.updateDumpTruckProximity();
        this.checkLootBoxUIRange();
    }

    private checkLootBoxUIRange(): void {
        if (this.currentLootBoxPlayer && this.dumpTruck.isLootBoxUIOpen()) {
            const playerNear = this.playerNearDumpTruck.get(this.currentLootBoxPlayer) || false;
            if (!playerNear) {
                this.playerMap.get(this.currentLootBoxPlayer)!.setInteracting(false);
                this.dumpTruck.closeLootBoxUI();
                this.currentLootBoxPlayer = null;
            }
        }
    }

    private updateDumpTruckProximity(): void {
        const dumpTruckX = this.dumpTruck.x;
        const dumpTruckY = this.dumpTruck.y;
        
        this.players.forEach((player, playerId) => {
            const distance = Phaser.Math.Distance.Between(
                player.sprite.x, player.sprite.y,
                dumpTruckX, dumpTruckY
            );
            
            const wasNear = this.playerNearDumpTruck.get(playerId);
            const isNear = distance <= this.dumpTruck.getInteractionDistance();
            
            this.playerNearDumpTruck.set(playerId, isNear);
            
            if (isNear && !wasNear) {
                console.log(`${playerId} entered dump truck range`);
            } else if (!isNear && wasNear) {
                console.log(`${playerId} left dump truck range`);
            }
        });
        
        const anyPlayerNear = Array.from(this.playerNearDumpTruck.values()).some(near => near);
        this.dumpTruck.setPlayerNearby(anyPlayerNear);
    }

    handleDumpTruckInteraction(playerId: string): void {
        const playerNear = this.playerNearDumpTruck.get(playerId) || false;

        if (playerNear) {
            const player = this.playerMap.get(playerId);
            if (player) {
                console.log(`${playerId} is selling inventory to dump truck`);
                const result = this.dumpTruck.sellPlayerInventory(player.inventory);
                console.log(`Player ${playerId} sold ${result.soldBlocks} blocks for $${result.earnedMoney}`);
            }
        } else {
            console.log(`Player ${playerId} is not near the dump truck (distance check failed)`);
        }
    }

    private handleLootBoxInteraction(playerId: string): void {
        const playerNear = this.playerNearDumpTruck.get(playerId) || false;

        if (playerNear) {
            const player = this.playerMap.get(playerId);
            if (player) {
                this.currentLootBoxPlayer = playerId;
                this.playerMap.get(playerId)!.setInteracting(true);
                this.dumpTruck.openLootBoxUI(playerId, player.getControlKeys());
            }
        }
    }

    private handleToolPurchased(data: { tool: Tool, boxType: LootBoxType, playerId: string }): void {
        this.playerMap.get(data.playerId)!.inventory.addTool(data.tool);
        console.log(`Player ${data.playerId} received ${data.tool.name} from ${data.boxType.name}`);
    }

    getWorld(): World {
        return this.world;
    }

    getPlayerById(playerId: string): Player | null {
        return this.playerMap.get(playerId) || null;
    }
}