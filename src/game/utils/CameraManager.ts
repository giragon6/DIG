export interface CameraLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class CameraManager {
    private scene: Phaser.Scene;
    private cameras: Map<string, Phaser.Cameras.Scene2D.Camera> = new Map();
    private layouts: Map<number, CameraLayout[]> = new Map();
    private uiCamera: Phaser.Cameras.Scene2D.Camera | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupLayouts();
    }

    private setupLayouts(): void {
        this.layouts.set(1, [
            { x: 0, y: 0, width: 1, height: 1 }
        ]);

        this.layouts.set(2, [
            { x: 0, y: 0, width: 0.5, height: 1 },
            { x: 0.5, y: 0, width: 0.5, height: 1 }
        ]);

        this.layouts.set(3, [
            { x: 0, y: 0, width: 1, height: 0.5 },
            { x: 0, y: 0.5, width: 0.5, height: 0.5 },
            { x: 0.5, y: 0.5, width: 0.5, height: 0.5 }
        ]);

        this.layouts.set(4, [
            { x: 0, y: 0, width: 0.5, height: 0.5 },
            { x: 0.5, y: 0, width: 0.5, height: 0.5 },
            { x: 0, y: 0.5, width: 0.5, height: 0.5 },
            { x: 0.5, y: 0.5, width: 0.5, height: 0.5 }
        ]);
    }

    getUIPositionForPlayer(playerId: string): { x: number, y: number } {
        const camera = this.cameras.get(playerId) || this.scene.cameras.main;
        return {
            x: camera.width / 2,
            y: camera.height / 2
        };
    }

    createCamerasForPlayers(playerIds: string[], targets: Phaser.GameObjects.GameObject[]): void {
        const playerCount = playerIds.length;
        const layout = this.layouts.get(playerCount);

        if (!layout) {
            console.error(`No layout defined for ${playerCount} players`);
            return;
        }

        this.cameras.forEach((camera, playerId) => {
            if (camera !== this.scene.cameras.main) {
                camera.destroy();
            }
        });
        this.cameras.clear();

        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;

        playerIds.forEach((playerId, index) => {
            const layoutConfig = layout[index];
            let camera: Phaser.Cameras.Scene2D.Camera;

            if (index === 0) {
                camera = this.scene.cameras.main;
            } else {
                camera = this.scene.cameras.add();
            }

            camera.setViewport(
                Math.floor(layoutConfig.x * gameWidth),
                Math.floor(layoutConfig.y * gameHeight),
                Math.floor(layoutConfig.width * gameWidth),
                Math.floor(layoutConfig.height * gameHeight)
            );

            camera.setBounds(0, 0, 2304, 1296);

            if (targets[index]) {
                camera.startFollow(targets[index], true, 0.05, 0.05);
            }

            if (playerCount > 1) {
                camera.setBackgroundColor('#000000');
                this.addCameraBorder(camera, playerId);
            }

            this.cameras.set(playerId, camera);
        });

        this.createUICamera();
    }

    private createUICamera(): void {
        console.log('making ui camera')
        this.uiCamera = this.scene.cameras.add(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
        this.uiCamera.setScroll(0, 0);
        this.uiCamera.setBackgroundColor('rgba(0,0,0,0)');
        
        this.scene.children.list.forEach((obj) => {
            this.uiCamera?.ignore(obj);
        })
    }

    getUICamera(): Phaser.Cameras.Scene2D.Camera | null {
        return this.uiCamera;
    }

    addToUICamera(gameObject: Phaser.GameObjects.GameObject): void {
        if (this.uiCamera) {
            this.uiCamera.addToRenderList(gameObject);
        }
    }

    ignoreForAllPlayerCameras(obj: Phaser.GameObjects.GameObject) {
        this.cameras.forEach((camera) => {
            camera.ignore([obj]);
        })
    }

    private addCameraBorder(camera: Phaser.Cameras.Scene2D.Camera, playerId: string): void {
        const borderGraphics = this.scene.add.graphics();
        borderGraphics.lineStyle(4, 0xffffff);
        borderGraphics.strokeRect(
            camera.x + 2,
            camera.y + 2,
            camera.width - 4,
            camera.height - 4
        );
        borderGraphics.setScrollFactor(0);
        borderGraphics.setDepth(1000);

        const label = this.scene.add.text(
            camera.x + 10,
            camera.y + 10,
            playerId.toUpperCase(),
            {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }
        );
        label.setScrollFactor(0);
        label.setDepth(1001);
    }

    getCameraForPlayer(playerId: string): Phaser.Cameras.Scene2D.Camera | undefined {
        return this.cameras.get(playerId);
    }

    updateCameraTargets(playerTargets: Map<string, Phaser.GameObjects.GameObject>): void {
        this.cameras.forEach((camera, playerId) => {
            const target = playerTargets.get(playerId);
            if (target) {
                camera.startFollow(target, true, 0.05, 0.05);
            }
        });
    }

    getCameras(): Map<string, Phaser.Cameras.Scene2D.Camera> {
        return this.cameras;
    }

    destroy(): void {
        this.cameras.forEach((camera, playerId) => {
            if (camera !== this.scene.cameras.main) {
                camera.destroy();
            }
        });
        this.cameras.clear();

        if (this.uiCamera) {
            this.uiCamera.destroy();
            this.uiCamera = null;
        }
    }
}
