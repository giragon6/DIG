import Player from '../gameobjects/player/Player';
import { WorldScene } from '../../utils/types/sceneTypes';
import World from '../map/World';
import { InventoryUI } from '../gameobjects/UI/InventoryUI';
import { DumpTruck } from '../gameobjects/commerce/DumpTruck';

export class Game extends WorldScene {
    camera: Phaser.Cameras.Scene2D.Camera;

    private player1: Player;
    private player2: Player;
    private world: World;
    // private bg: Phaser.GameObjects.TileSprite;

    private inventoryUI1: InventoryUI;
    private inventoryUI2: InventoryUI;
    private playerMap: Map<string, Player> = new Map();

    private dumpTruck: DumpTruck;
    private playerNearDumpTruck: Map<string, boolean> = new Map();    

    constructor() {
        super('Game');
    }

    create() {
        this.physics.world.setBounds(0, 0, 2304, 1296, true, true, true, false);
        this.camera = this.cameras.main;
        this.world = new World(this);

        // this.bg = this.add.tileSprite(0, 0, 2304, 1296, 'background1')   
        // this.bg.setScrollFactor(1);
        // this.bg.setOrigin(0, 0);
        // this.bg.setTileScale(0.5, 0.5); 

        const p1Spawn = {x: 100, y: 100}; // this.world.getValidSpawnPosition('p1');
        const p2Spawn = {x: 200, y: 100}; // this.world.getValidSpawnPosition('p2');
        const dumpTruckSpawn = {x: 500, y: 100}; // this.world.getValidSpawnPosition('dumpTruck');

        this.player1 = new Player(this, p1Spawn.x, p1Spawn.y, 'player1', {
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            attack: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            interact: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        }, 0xff0000);

        this.player2 = new Player(this, p2Spawn.x, p2Spawn.y, 'player2', {
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            attack: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH),
            interact: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
        }, 0x0055ff);

        this.playerMap.set('player1', this.player1);
        this.playerMap.set('player2', this.player2);

        this.dumpTruck = new DumpTruck(this, dumpTruckSpawn.x, dumpTruckSpawn.y, 300);

        this.playerNearDumpTruck.set('player1', false);
        this.playerNearDumpTruck.set('player2', false);       

        this.setupInputHandlers();

        this.inventoryUI1 = new InventoryUI(this, 120, 50, this.player1.inventory).setScrollFactor(0);
        this.inventoryUI2 = new InventoryUI(this, this.cameras.main.width - 120, 50, this.player2.inventory).setScrollFactor(0);

        this.camera.startFollow(this.player1.sprite, true, 0.05, 0.05);
        this.physics.add.collider(this.player1.sprite, this.world.getMineLayer());
        this.physics.add.collider(this.player2.sprite, this.world.getMineLayer());
    }

    private setupInputHandlers(): void {
        for (const [playerId, player] of this.playerMap.entries()) {
            player.getControlKeys().down.on('down', () => {
                this.handleDumpTruckInteraction(playerId);
            });
        }
    }

    update(time: number, delta: number): void {
        this.world.update(time, delta);
        this.player1.update();
        this.player2.update();

        this.updateDumpTruckProximity();
    }

    private updateDumpTruckProximity(): void {
        const dumpTruckX = this.dumpTruck.x;
        const dumpTruckY = this.dumpTruck.y;
        
        const player1Distance = Phaser.Math.Distance.Between(
            this.player1.sprite.x, this.player1.sprite.y,
            dumpTruckX, dumpTruckY
        );
        
        const player2Distance = Phaser.Math.Distance.Between(
            this.player2.sprite.x, this.player2.sprite.y,
            dumpTruckX, dumpTruckY
        );
        
        const player1WasNear = this.playerNearDumpTruck.get('player1');
        const player2WasNear = this.playerNearDumpTruck.get('player2');
        
        const player1IsNear = player1Distance <= this.dumpTruck.getInteractionDistance();
        const player2IsNear = player2Distance <= this.dumpTruck.getInteractionDistance();
        
        this.playerNearDumpTruck.set('player1', player1IsNear);
        this.playerNearDumpTruck.set('player2', player2IsNear);
        
        if (player1IsNear && !player1WasNear) {
            console.log('Player 1 entered dump truck range');
        } else if (!player1IsNear && player1WasNear) {
            console.log('Player 1 left dump truck range');
        }
        
        if (player2IsNear && !player2WasNear) {
            console.log('Player 2 entered dump truck range');
        } else if (!player2IsNear && player2WasNear) {
            console.log('Player 2 left dump truck range');
        }
        
        const anyPlayerNear = player1IsNear || player2IsNear;
        this.dumpTruck.setPlayerNearby(anyPlayerNear);
    }

    handleDumpTruckInteraction(playerId: string): void {
        console.log(`${playerId} pressed interact key`);
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

    getWorld(): World {
        return this.world;
    }

    getPlayerById(playerId: string): Player | null {
        return this.playerMap.get(playerId) || null;
    }
}