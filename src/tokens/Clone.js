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
    if (JSON.stringify(originIndex) === JSON.stringify(tarIndex)) {
      return;
    }
    console.log(` this is origin ${originIndex}`);
    // console.log(`BEFORE: origin cell ${originIndex} occupied? ${G.cells[originIndex].occupied}`);
    G.cells[originIndex].occupied = false;
    // G.cells[147].occupied = !G.cells[originIndex].occupied;
    // console.log(`AFTER: origin cell ${originIndex} occupied? ${G.cells[originIndex].occupied}`);

    // console.log(`BEFORE: target cell ${tarIndex} occupied? ${G.cells[tarIndex].occupied}`);
    // G.cells[tarIndex].occupied = true;
    // console.log(`AFTER: target cell ${tarIndex} occupied? ${G.cells[tarIndex].occupied}`);

    this.x = tarCoords.x;
    this.y = tarCoords.y;
  }
}

export default Clone;
