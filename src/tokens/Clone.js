import { TileHelper } from '../helpers/tileHelper';

class Clone {
    constructor(playerID, coordinates) {
        this.x = coordinates.x;
        this.y = coordinates.y;
        this.spy = false;
        this.gunner = false;
    }
    move(G, ctx, targetCoordinates) {
        const originIndex = TileHelper.tileCoordinatesToIndex({ x: this.x, y: this.y });
        console.log('tile origin ' + originIndex);
        console.log(G.cells[originIndex].occupied);
        G.cells[originIndex].occupied = false;
        console.log(G.cells[originIndex].occupied);
        this.x = targetCoordinates.x;
        this.y = targetCoordinates.y;
    }
}

export default Clone;