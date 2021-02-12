const tilesJSON = require('../constants/tile_map.json');
const wallsJSON = require('../constants/wallGrid.json');

function indexToCoordinates(index) {
    let x = (Math.floor(index / 21));
    let y = (index % 21);
    return { x, y };
}

function coordinatesToIndex(coordinates) {
    return coordinates.x * 21 + coordinates.y;
}

const tileProperties = {
    occupied: false,
    damaged: false,
    owner: null,
}

const directions = {
    NORTH: 1,
    EAST: 2,
    SOUTH: 4,
    WEST: 8,
}

const TileHelper = {
    tileIndexToCoordinates: (index) => {
        return indexToCoordinates(index);
    },
    tileCoordinatesToIndex: (coordinates) => {
        return coordinatesToIndex(coordinates);
    },
    getDamagedTiles: (G, ctx) => {
        let damagedTiles = [];
        G.cells.forEach(cell => {
            if (cell.owner === ctx.currentPlayer) {
                damagedTiles.push(cell);
            }
        });
        return damagedTiles;
    },
    getClickedTileByIndex: (G, index) => {
        return G.cells[index];
    },
    getClickedTileByCoordinates: (G, coordinates) => {
        let index = coordinatesToIndex(coordinates);
        return G.cells[index];
    },
    setValueForCoordinates: (G, coordinates, key, value) => {
        let index = coordinatesToIndex(coordinates);
        G.cells[index][key] = value;
    },
    getValueForCoordinates: (G, coordinates, key) => {
        let index = coordinatesToIndex(coordinates);
        console.log(index);
        return G.cells[index][key];
    },
    getLocks: (playerID) => {
        const returnArray = [];
        for (let i = 0; i < 651; i++) {
            let coordinates = indexToCoordinates(i);
            let tile = tilesJSON[coordinates.x][coordinates.y];
            if (tile.name === "lock" && tile.owner === playerID) {
                returnArray.push(coordinates);
            }
        }
        return returnArray;
    },
    setOwnership: (G) => {
        G.cells.map((cell, index) => {
            let coordinates = indexToCoordinates(index);
            let tileNode = tilesJSON[coordinates.x][coordinates.y];
            Object.entries(tileNode).forEach(pair => {
                cell[pair[0]] = pair[1];
            });
            if (cell.type == 'warehouse') {
                let column = index % 21;
                if (column < 5 || column > 15) {
                    cell.isFull = true;
                } else {
                    cell.isFull = false;
                }
            }

        });
    },
    getCoordinateByDirection(originCoordinate, direction) {
        const dirChange = { NORTH: { x: 0, y: -1 }, EAST: { x: 1, y: 0 }, SOUTH: { x: 0, y: 1 }, WEST: { x: -1, y: 0 } };

        const potentialResult = { x: (parseInt(originCoordinate.x) + parseInt(dirChange[direction].x)), y: (parseInt(originCoordinate.y) + parseInt(dirChange[direction].y)) };
        if (potentialResult.x < 0 || potentialResult.x > 30 | potentialResult.y < 0 | potentialResult.y > 20) {
            return false;
        } else {
            return potentialResult;
        }
    },
    checkWall (coordinate, direction) {
        switch (direction){
            case directions.NORTH:
                if (parseInt(wallsJSON.grid[coordinate.x][coordinate.y] & directions.NORTH) === 0) {
                    return true;
                }
                return false;
            case directions.SOUTH:
                if (parseInt(wallsJSON.grid[coordinate.x][coordinate.y] & directions.SOUTH) === 0) {
                    return true;
                }
                return false;
            case directions.EAST:
                if (parseInt(wallsJSON.grid[coordinate.x][coordinate.y] & directions.EAST) === 0) {
                    return true;
                }
                return false;
            case directions.WEST:
                if (parseInt(wallsJSON.grid[coordinate.x][coordinate.y] & directions.WEST) === 0) {
                    return true;
                }
                return false;
            default:
                return false;
        }
    },
};

export { TileHelper, tileProperties, directions };
