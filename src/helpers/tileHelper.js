const tilesJSON = require('../constants/tile_map.json');
const wallsJSON = require('../constants/wallGrid.json');

function indexToCoordinates(index) {
  if (index > 650 || index < 0) throw new Error('index exceeds limit');
  const x = (Math.floor(index / 21));
  const y = (index % 21);
  return { x, y };
}

function coordinatesToIndex(coordinates) {
  return parseInt(coordinates.x * 21 + coordinates.y, 10);
}

function getOccupantByCoordinates(G, ctx, coord) {
  if (typeof coord === 'undefined') throw new Error('coord is undefined');
  // const coord = indexToCoordinates(tileID);
  let occupant = null;
  G.players.forEach((player) => {
    if (occupant) return;
    player.clones.forEach((clone) => {
      if (occupant) return;
      if (clone.x === coord.x && clone.y === coord.y) {
        occupant = clone;
      }
    });
    player.rbss.forEach((rbss) => {
      if (occupant) return;
      if (rbss.x === coord.x && rbss.y === coord.y) {
        occupant = rbss;
      }
    });
  });
  return occupant;
}

const tileProperties = {
  occupied: false,
  damaged: false,
  owner: null,
};

const directions = {
  NORTH: 1,
  EAST: 2,
  SOUTH: 4,
  WEST: 8,
};

const TileHelper = {
  indexToCoordinates,
  coordinatesToIndex,
  getOccupantByCoordinates,
  getDamagedTiles: (G, ctx) => {
    const damagedTiles = [];
    G.cells.forEach((cell) => {
      if (cell.owner === ctx.currentPlayer) {
        damagedTiles.push(cell);
      }
    });
    return damagedTiles;
  },
  getClickedTileByIndex: (G, index) => G.cells[index],
  getClickedTileByCoordinates: (G, coordinates) => {
    const index = coordinatesToIndex(coordinates);
    return G.cells[index];
  },
  setValueForCoordinates: (G, coordinates, key, value) => {
    const index = coordinatesToIndex(coordinates);
    G.cells[index][key] = value;
  },
  getValueForCoordinates: (G, coordinates, key) => {
    const index = coordinatesToIndex(coordinates);
    return G.cells[index][key];
  },
  getLocks: (playerID) => {
    const returnArray = [];
    for (let i = 0; i < 651; i += 1) {
      const coordinates = indexToCoordinates(i);
      const tile = tilesJSON[coordinates.x][coordinates.y];
      if (tile.name === 'lock' && tile.owner === playerID) {
        returnArray.push(coordinates);
      }
    }
    return returnArray;
  },
  setOwnership: (G) => {
    G.cells.forEach((cell, index) => {
      const coordinates = indexToCoordinates(index);
      const tileNode = tilesJSON[coordinates.x][coordinates.y];
      Object.entries(tileNode).forEach((pair) => {
        // eslint-disable-next-line prefer-destructuring
        cell[pair[0]] = pair[1];
      });
      if (cell.type === 'warehouse') {
        const column = index % 21;
        if (column < 5 || column > 15) {
          cell.isFull = true;
        } else {
          cell.isFull = false;
        }
      }
    });
  },
  getCoordinateByDirection(originCoordinate, direction) {
    const dirChange = {
      NORTH: { x: 0, y: -1 }, EAST: { x: 1, y: 0 }, SOUTH: { x: 0, y: 1 }, WEST: { x: -1, y: 0 },
    };

    const newX = parseInt(originCoordinate.x, 10) + parseInt(dirChange[direction].x, 10);
    const newY = parseInt(originCoordinate.y, 10) + parseInt(dirChange[direction].y, 10);
    const result = { x: newX, y: newY };
    if (result.x < 0 || result.x > 30 || result.y < 0 || result.y > 20) {
      return false;
    }
    return result;
  },
  checkWall(coordinate, direction) {
    switch (direction) {
      case directions.NORTH:
        // eslint-disable-next-line no-bitwise
        if (parseInt((wallsJSON.grid[coordinate.x][coordinate.y] & directions.NORTH), 10) === 0) {
          return true;
        }
        return false;
      case directions.SOUTH:
        // eslint-disable-next-line no-bitwise
        if (parseInt(wallsJSON.grid[coordinate.x][coordinate.y] & directions.SOUTH, 10) === 0) {
          return true;
        }
        return false;
      case directions.EAST:
        // eslint-disable-next-line no-bitwise
        if (parseInt(wallsJSON.grid[coordinate.x][coordinate.y] & directions.EAST, 10) === 0) {
          return true;
        }
        return false;
      case directions.WEST:
        // eslint-disable-next-line no-bitwise
        if (parseInt(wallsJSON.grid[coordinate.x][coordinate.y] & directions.WEST, 10) === 0) {
          return true;
        }
        return false;
      default:
        return false;
    }
  },
  upperX: 30,
  lowerX: 0,
  upperY: 20,
  lowerY: 0,
};

export { TileHelper, tileProperties, directions };
