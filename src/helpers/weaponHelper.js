import { TileHelper } from './tileHelper';

const WeaponHelper = {
  getGunnersTargets: (G, gunners, battleTile) => {
    const tarTiles = [];
    if (gunners.length === 0) return tarTiles;

    gunners.forEach((gunner) => {
      switch (battleTile.name) {
        case 'laser':
          // start at gunner x and iterate toward enemy base
          // until you reach teh first tile that is NOT:
          // unoccupied space, unoccupied surface,
          // undamaged battle/lock/armory/warehouse/production, off the board
          if (gunner.x < 10) {
            for (let x = gunner.x + 1; x < TileHelper.upperX; x += 1) {
              const tile = TileHelper.getClickedTileByCoordinates(G, { x, y: gunner.y });
              if (tile.name === 'space' && tile.occupied === true) {
                tarTiles.push(tile);
                break;
              } else if (tile.name === 'surface' && tile.occupied === true) {
                tarTiles.push(tile);
                break;
              } else if (tile.name !== 'space' && tile.name !== 'surface' && tile.damaged === false) {
                tarTiles.push(tile);
                break;
              }
            }
          }
          break;
        default:
          break;
      }
    });
    // returns tile impacted by gunner action
    return tarTiles;
  },
};

export default WeaponHelper;
