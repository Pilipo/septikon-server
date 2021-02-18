import { TileHelper } from '../helpers/tileHelper';

class Clone {
  constructor(playerID, coordinates) {
    this.x = coordinates.x;
    this.y = coordinates.y;
    this.spy = false;
    this.gunner = false;
  }

  move(G, ctx, tarCoords) {
    const originIndex = TileHelper.tileCoordinatesToIndex({ x: this.x, y: this.y });
    const tarIndex = TileHelper.tileCoordinatesToIndex({ x: tarCoords.x, y: tarCoords.y });
    G.cells[originIndex].occupied = false;
    G.cells[tarIndex].occupied = true;

    this.x = tarCoords.x;
    this.y = tarCoords.y;
  }
}

export default Clone;
