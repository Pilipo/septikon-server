import Clone from '../tokens/Clone';
import { TileHelper, directions } from './tileHelper';

function getClonesLegalMoves(G, playerID, moves, curCoords, prevCoords) {
  let movesLeft = moves;
  if (movesLeft < 1) {
    return false;
  }
  movesLeft -= 1;

  const legalMoves = [];
  let returnArray = [];
  const curTile = TileHelper.getClickedTileByCoordinates(G, curCoords);

  // check for allLocks on first iteration
  if (typeof prevCoords === 'undefined' && curTile.type === 'lock') {
    // TODO: accommodate spies

    const allLocks = TileHelper.getLocks(playerID);

    // TODO: Fix bug in which the lock the clone is presently standing on is a legal target.
    allLocks.forEach((curLock) => {
      if (curLock.x === curTile.x && curLock.y === curTile.y) return;
      const curLockTile = TileHelper.getClickedTileByCoordinates(G, curLock);
      if (curLockTile.occupied === true) return;
      // More moves to check, so queue it up
      if (movesLeft > 0) {
        const lockCoords = { x: curLock.x, y: curLock.y };
        const curLegalMoves = getClonesLegalMoves(G, playerID, movesLeft, lockCoords, curCoords);
        returnArray = returnArray.concat(curLegalMoves);
      } else {
        returnArray.push(curLock);
      }
      returnArray.forEach((item) => {
        if (item.x !== curCoords.x || item.y !== curCoords.y) {
          legalMoves.push(item);
        }
      });
    });
  }

  // all iterations
  Object.keys(directions).forEach((direction) => {
    const nextMove = TileHelper.getCoordinateByDirection(curCoords, direction);
    if (nextMove === false) {
      return;
    }

    const nextTile = TileHelper.getClickedTileByCoordinates(G, nextMove);
    // MOVE RULES: clones can't go on or pass through space tiles,
    // damaged tiles, warehouse tiles, or tiles occupied by enemy biodrones.
    // They can't finish their move on an occupied tile.
    if (nextTile.damaged === true || nextTile.type === 'space' || nextTile.type === 'warehouse') {
      return;
    }
    if (TileHelper.checkWall(curCoords, directions[direction]) === false) {
      return;
    }
    const cell = G.cells[TileHelper.tileCoordinatesToIndex(nextMove)];
    if (cell.occupied === true) {
      const opponentID = (playerID === '0' ? '1' : '0');
      if (G.players[opponentID].biodrones.length > 0) {
        // TODO: iterate the biodrones to check for a match.
      }
    }

    if (typeof prevCoords === 'undefined' || (typeof prevCoords !== 'undefined' && (JSON.stringify(nextMove) !== JSON.stringify(prevCoords)))) {
      if (movesLeft === 0 && cell.occupied === false) {
        legalMoves.push(nextMove);
      } else {
        const curLegalMoves = getClonesLegalMoves(G, playerID, movesLeft, nextMove, curCoords);
        returnArray = returnArray.concat(curLegalMoves);
        returnArray.forEach((entry) => {
          if (JSON.stringify(entry) === JSON.stringify(curCoords)) return;
          legalMoves.push(entry);
        });
      }
    }
  });

  return [...new Set(legalMoves)];
}

const PersonnelHelper = {
  getCloneIndexByCoordinates: (G, playerID, coordinates) => {
    let cloneIndex = false;
    if (G.players[playerID].clones.length > 0) {
      G.players[playerID].clones.forEach((element, index) => {
        if (element.x === coordinates.x && element.y === coordinates.y) {
          cloneIndex = index;
        }
      });
    }
    return cloneIndex;
  },
  placeClone: (G, playerID, coordinates) => {
    if (G.players[playerID].clones.length < 5) {
      const tile = TileHelper.getClickedTileByCoordinates(G, coordinates);
      if (tile.owner === playerID && tile.name !== 'surface' && tile.type !== 'warehouse') {
        const newClone = new Clone(playerID, coordinates);
        G.players[playerID].clones.push(newClone);
        TileHelper.setValueForCoordinates(G, coordinates, 'occupied', true);
      }
    }
  },
  removeClone: (G, playerID, coordinates) => {
    if (G.players[playerID].clones.length > 0) {
      G.players[playerID].clones.forEach((element, index) => {
        if (element.x === coordinates.x && element.y === coordinates.y) {
          G.players[playerID].clones.splice(index, 1);
          TileHelper.setValueForCoordinates(G, coordinates, 'occupied', false);
        }
      });
    }
  },
  getGunners: (G, ctx) => {
    const gunners = [];
    G.players[ctx.currentPlayer].clones.forEach((clone) => {
      if (clone.gunner === true) {
        gunners.push(clone);
      }
    });
    return gunners;
  },
  getSpies: () => {
    const spies = [];
    // TODO: get spies
    // opponentID = ctx.currentPlayer == 0 ? 1 : 0;
    // G.players[opponentID].clones.forEach((clone) => {
    //   if (clone.spy === true) {
    //     spies.push(clone);
    //   }
    // });
    return spies;
  },
  getBiodrones: (G, ctx) => G.players[ctx.currentPlayer].biodrones,
  getClonesLegalMoves: (G, playerID, mC, oC) => getClonesLegalMoves(G, playerID, mC, oC),
  getOccupiedTiles: (G) => {
    const occupiedTiles = [];
    G.players.forEach((player) => {
      player.forEach((token) => {
        occupiedTiles.push({ x: token.x, y: token.y });
      });
    });
    return occupiedTiles;
  },
};

export default PersonnelHelper;
