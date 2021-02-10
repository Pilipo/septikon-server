import Clone from '../tokens/Clone';
import { TileHelper, directions } from './tileHelper';

function getClonesLegalMoves(moves, currentCoordinates, previousCoordinates) {
    if (moves < 1) {
        return false;
    } else {
        moves--;
    }

    const legalMoves = [];
    let returnArray = [];
    let nextTile = null;

    if (typeof previousCoordinates == 'undefined') {
        // TODO: accommodate spies
        // TODO: look for locks
    }

    for (let direction in directions) {
        let nextMove = TileHelper.getCoordinateByDirection(currentCoordinates, direction);
        if (nextMove === false) continue;

        let nextTile = TileHelper.getClickedTileByCoordinates(nextMove);
        // MOVE RULES: clones can't go on space tiles, damaged tiles, warehouse tiles, or tiles occupied by enemy biodrones. They can't finish their move on an occupied tile.
        if (nextTile.damaged === true || nextTile.type === "space" || nextTile.type === "warehouse") continue;
        if (TileHelper.checkWall(currentCoordinates, directions[direction]) === false) continue;

        // TODO: check for occupants (clones and biodrones can "jump" teammates)

        if (typeof previousCoordinates === 'undefined' || (typeof previousCoordinates !== 'undefined' && (JSON.stringify(nextMove) !== JSON.stringify(previousCoordinates)))) {
            if (moves === 0) {
                legalMoves.push(nextMove);
            } else {
                returnArray = returnArray.concat(getClonesLegalMoves(moves, nextMove, currentCoordinates));
                for (let index in returnArray) {
                    if (JSON.stringify(returnArray[index]) === JSON.stringify(currentCoordinates)) continue;
                    legalMoves.push(returnArray[index]);
                }
            }
        }
    }
    return [...new Set(legalMoves)];
}

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
            if (tile.owner === playerID && tile.name !== "surface") {
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
    getClonesLegalMoves: () => {
        return getClonesLegalMoves(4, { x: 0, y: 0 });
    },
};

export default PersonnelHelper;