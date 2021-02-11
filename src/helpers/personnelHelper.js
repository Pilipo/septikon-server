import Clone from '../tokens/Clone';
import { TileHelper, directions } from './tileHelper';

function getClonesLegalMoves(G, playerID, moves, currentCoordinates, previousCoordinates) {
    if (moves < 1) {
        return false;
    } else {
        moves--;
    }

    const legalMoves = [];
    let returnArray = [];

    // first iteration
    if (typeof previousCoordinates == 'undefined') {
        // TODO: accommodate spies

        let locks = TileHelper.getLocks(playerID);
        let currentTile = TileHelper.getClickedTileByCoordinates(currentCoordinates);

        if (currentTile.type === 'lock') {
            locks.forEach(thisLock => {
                if (thisLock.x === currentTile.x && thisLock.y === currentTile.y) return;
                let lockTile = TileHelper.getClickedTileByCoordinates(thisLock);
                if (lockTile.occupied === true) return;
                if (moves > 0) {
                    returnArray = returnArray.concat(getClonesLegalMoves(G, playerID, moves, {x:thisLock.x, y:thisLock.y}, currentCoordinates));
                } else {
                    returnArray.push(thisLock);
                }
                returnArray.forEach(item => {
                    if (item.x !== currentCoordinates.x || item.y !== currentCoordinates.y) {
                        legalMoves.push(item);
                    }
                });
            })
        }
    }

    // all iterations
    for (let direction in directions) {
        let nextMove = TileHelper.getCoordinateByDirection(currentCoordinates, direction);
        if (nextMove === false) continue;

        let nextTile = TileHelper.getClickedTileByCoordinates(nextMove);
        // MOVE RULES: clones can't go on or pass through space tiles, damaged tiles, warehouse tiles, or tiles occupied by enemy biodrones. They can't finish their move on an occupied tile.
        if (nextTile.damaged === true || nextTile.type === "space" || nextTile.type === "warehouse") continue;
        if (TileHelper.checkWall(currentCoordinates, directions[direction]) === false) continue;
        let cell = G.cells[TileHelper.tileCoordinatesToIndex(nextMove)];
        if (cell.occupied === true) {
            let opponentID = (playerID === "0" ? "1" : "0");
            if (G.players[opponentID].biodrones.length > 0) {
               
                console.log('Enemy Biodrone in the list.');
                // TODO: iterate the biodrones to check for a match.
                
            }
        }

        if (typeof previousCoordinates === 'undefined' || (typeof previousCoordinates !== 'undefined' && (JSON.stringify(nextMove) !== JSON.stringify(previousCoordinates)))) {
            if (moves === 0 && cell.occupied === false) {
                legalMoves.push(nextMove);
            } else {
                returnArray = returnArray.concat(getClonesLegalMoves(G, playerID, moves, nextMove, currentCoordinates));
                for (let index in returnArray) {
                    if (JSON.stringify(returnArray[index]) === JSON.stringify(currentCoordinates)) continue;
                    legalMoves.push(returnArray[index]);
                }
            }
        }
    }
    return [...new Set(legalMoves)];
}

// function getTileOccupantByCoordinate(coordinates) {

// }

const PersonnelHelper = {
    getCloneIndexByCoordinates: (G, playerID, coordinates) => {
        let cloneIndex = false;
        if (G.players[playerID]['clones'].length > 0) {
            G.players[playerID]['clones'].forEach((element, index) => {
                if (element.x == coordinates.x && element.y == coordinates.y) {
                    cloneIndex = index;
                }
            });
        }
        return cloneIndex;
    },
    placeClone: (G, playerID, coordinates) => {
        if (G.players[playerID]['clones'].length < 5) {
            let tile = TileHelper.getClickedTileByCoordinates(coordinates);
            if (tile.owner === playerID && tile.name !== "surface" && tile.type !== "warehouse") {
                let newClone = {
                    type: "clone",
                    x: coordinates.x,
                    y: coordinates.y,
                };
                G.players[playerID]['clones'].push(newClone);
                TileHelper.setValueForCoordinates(G, coordinates, 'occupied', true);
            }
        }
    },
    removeClone: (G, playerID, coordinates) => {
        if (G.players[playerID]['clones'].length > 0) {
            G.players[playerID]['clones'].forEach((element, index) => {
                if (element.x == coordinates.x && element.y == coordinates.y) {
                    G.players[playerID]['clones'].splice(index, 1);
                    TileHelper.setValueForCoordinates(G, coordinates, 'occupied', false);
                }
            });
        }
    },
    getClonesLegalMoves: (G, playerID, moveCount, originCoordinate) => {
        return getClonesLegalMoves(G, playerID, moveCount, originCoordinate);
    },
};

export default PersonnelHelper;