import Random from "../../../utils/Random";
import { BlockType } from "../../../utils/types";

export default abstract class TerrainGenerator {
    /**
     * Generates a random walk terrain map.
     * @param width Width of the terrain map.
     * @param height Height of the terrain map.
     * @param maxStartHeight Maximum starting height for the bottom layer.
     * @param minStartHeight Minimum starting height for the bottom layer.
     * @param bottomLayer Block type for the bottom layer.
     * @param topLayer Block type for the top layer.
     * @param minSectionSize Minimum size of each horizontal section in the terrain.
     * @param seed Random seed for generating the terrain.
     * @returns A 2D array of BlockType representing the terrain map.
     */
    public static randomWalkSmooth(
        width: number,
        height: number,
        maxStartHeight: number = height,
        minStartHeight: number = 0,
        minSectionSize: number,
        seed: string
    ): BlockType[][] {
        const dataWidth = width;
        const dataHeight = height;

        let data = Array.from({ length: dataWidth }, () => new Array(dataHeight).fill(0));

        const rand = new Random(seed);

        let lastHeight: integer = rand.range(minStartHeight, maxStartHeight + 1);

        let nextMove = 0;
        let sectionWidth = 0;

        for (let x = 0; x < dataWidth; x++)
        {
            nextMove = rand.range(0,2); // 0 = down, 1 = up

            if (nextMove == 0 && lastHeight > 0 && sectionWidth > minSectionSize)
            {
                lastHeight--;
                sectionWidth = 0;
            }
            else if (nextMove == 1 && lastHeight < dataHeight && sectionWidth > minSectionSize)
            {
                lastHeight++;
                sectionWidth = 0;
            }

            sectionWidth++;

            for (let y = lastHeight; y >= 0; y--)
                {
                    data[y][x] = 1;
                }
            }

            return data;
    }

    public static layerBoundaryWalk(
        width: number,
        baseDepth: number,
        maxVariation: number,
        minSectionSize: number,
        seed: string
    ): number[] {
        const rand = new Random(seed);
        const heights: number[] = [];
        
        let currentHeight = baseDepth + rand.range(-maxVariation, maxVariation + 1);
        let sectionWidth = 0;
        let direction = rand.range(0, 2) === 0 ? -1 : 1;
        
        for (let x = 0; x < width; x++) {
            if (sectionWidth >= minSectionSize && rand.float() < 0.3) {
                direction = rand.range(0, 2) === 0 ? -1 : 1;
                sectionWidth = 0;
            }
            
            if (rand.float() < 0.4) { // 40% chance to change height
                const newHeight = currentHeight + direction;
                if (newHeight >= baseDepth - maxVariation && 
                    newHeight <= baseDepth + maxVariation) {
                    currentHeight = newHeight;
                }
            }
            
            heights.push(currentHeight);
            sectionWidth++;
        }
        
        return heights;
    }

    public static perlinNoise(
        width: number,
        height: number,
        frequency: number = 0.1,
        amplitude: number = 1.0,
        seed: string
    ): number[][] {
        const noise = Array.from({ length: width }, () => new Array(height).fill(0));
        const rand = new Random(seed);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const nx = x * frequency;
                const ny = y * frequency;
                const value = Math.sin(nx + ny + rand.float() * Math.PI * 2) * amplitude;
                noise[x][y] = value;
            }
        }

        return noise;
    }
}