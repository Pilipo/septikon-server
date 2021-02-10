import Clone from '../tokens/Clone';
import { TileHelper, directions } from './tileHelper';

function getClonesLegalMoves(moves, currentCoordinates, previousCoordinates) {
    console.log(moves);
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

        // TODO: check for walls
        // TODO: check for occupants (clones and biodrones can "jump" teammates)

        getClonesLegalMoves(moves, nextMove, currentCoordinates);

        // if (moves === 0) {
        //     legalMoves.push(nextMove);
        // } else {
        //     returnArray = returnArray.concat(getClonesLegalMoves(moves, nextMove, currentCoordinates));
        //     for (let index in returnArray) {
        //         if (returnArray[index].x !== currentCoordinates.x || returnArray[index].y !== currentCoord.y) {
        //             legalMoves.push(returnArray[index]);
        //         }
        //     }
        // }

        // console.log("still alive");
        // console.log(nextTile);


    }
    return legalMoves;
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