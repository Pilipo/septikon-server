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
    const cell = G.cells[TileHelper.coordinatesToIndex(nextMove)];
    if (cell.occupied === true) {
      // const opponentID = (playerID === '0' ? '1' : '0');
      // TODO: iterate the biodrones to check for a match.
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

function getCloneByCoordinates(G, coords) {
  let clone = null;
  G.players.forEach((player) => {
    if (clone) return;
    player.clones.forEach((el) => {
      if (clone) return;
      if (el.x === coords.x && el.y === coords.y) {
        clone = el;
      }
    });
  });
  return clone;
}

const PersonnelHelper = {
  getCloneIndexByCoordinates: (G, coordinates) => {
    // if (typeof playerID === 'undefined') throw new Error('playerID undefined');
    let cloneIdx = false;
    G.players.forEach((player) => {
      player.clones.forEach((el, idx) => {
        if (el.x === coordinates.x && el.y === coordinates.y) {
          cloneIdx = idx;
        }
      });
    });
    return cloneIdx;
  },
  getCloneByCoordinates,
  placeClone: (G, playerID, coordinates) => {
    if (G.players[playerID].clones.length < 5) {
      // console.log(coordinates);
      const tile = TileHelper.getClickedTileByCoordinates(G, coordinates);
      const tarIdx = TileHelper.coordinatesToIndex(coordinates);
      if (tile.owner === playerID && tile.name !== 'surface' && tile.type !== 'warehouse') {
        G.players[playerID].clones.push({
          owner: playerID,
          x: coordinates.x,
          y: coordinates.y,
          spy: false,
          gunner: false,
        });
        G.cells[tarIdx].occupied = true;
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
  moveClone: (G, orgCoords, tarCoords) => {
    const orgIdx = TileHelper.coordinatesToIndex(orgCoords);
    const tarIdx = TileHelper.coordinatesToIndex(tarCoords);
    if (JSON.stringify(orgIdx) === JSON.stringify(tarIdx)) {
      return;
    }
    const tarClone = getCloneByCoordinates(G, orgCoords);
    tarClone.x = tarCoords.x;
    tarClone.y = tarCoords.y;
    G.cells[orgIdx].occupied = false;
    G.cells[tarIdx].occupied = true;
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
  getPlayerSpies: (G, playerID) => {
    if (typeof playerID === 'undefined') throw new Error('playerID is undefined');
    const spies = [];
    // TODO: get spies
    G.players[playerID].clones.forEach((clone) => {
      if (clone.spy === true) {
        spies.push(clone);
      }
    });
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
