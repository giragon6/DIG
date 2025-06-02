import Random from "../../../utils/random";
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
        bottomLayer: BlockType = BlockType.BT_DIRT,
        topLayer: BlockType = BlockType.BT_EMPTY,
        minSectionSize: number,
        seed: string
    ): BlockType[][] {
        const dataWidth = width;
        const dataHeight = height;

        let data = Array.from({ length: dataWidth }, () => new Array(dataHeight).fill(bottomLayer));

        const rand = new Random(seed);

        let lastHeight: integer = rand.range(minStartHeight, maxStartHeight + 1);

        //Used to determine which direction to go
        let nextMove = 0;
        //Used to keep track of the current sections width
        let sectionWidth = 0;

        //Work through the array width
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
                    data[y][x] = topLayer;
                }
            }

            return data;
    }
}