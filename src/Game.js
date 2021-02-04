const tilesJSON = require('./constants/tile_map.json');

export const TicTacToe = {
    setup: () => ({ 
        cells: Array(651).fill(null),
     }),

    turn: {
        moveLimit: 1,
    },

    moves: {
        clickCell: (G, ctx, id) => {
            // G.cells[id] = "X: " + (Math.floor(id / 21)) + " Y: " + (id % 21);
            let x = (Math.floor(id / 21));
            let y = (id % 21);
            G.cells[id] = tilesJSON[x][y]['name'];
        }
    },
  };