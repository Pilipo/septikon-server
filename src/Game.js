const tilesJSON = require('./constants/tile_map.json');

function clickCell(G, ctx, id) {
    // G.cells[id] = "X: " + (Math.floor(id / 21)) + " Y: " + (id % 21);
    let x = (Math.floor(id / 21));
    let y = (id % 21);
    G.clickedCell = tilesJSON[x][y];
}

function placeClone(G, ctx) {
    console.log('Clone placed.');
    G.pieces[ctx.currentPlayer]['clones']++;
    if (G.pieces[ctx.currentPlayer]['clones'] == 5) {
        console.log("Maxed");
    }
}

function rollDie(G, ctx) {
    G.rollValue = ctx.random.D6();
    console.log(G.rollValue + ' was yer roll');
    G.rollHistory.unshift(G.rollValue);
    ctx.events.endStage();
}

function moveClone(G, ctx) {
    G.clone++;
    console.log('move just one of yer clones ' + G.rollValue + ' spaces');
    ctx.events.endStage();
}

function activateModule(G, ctx) {
    console.log('activate the module yer clone just landed on (battlements are optional)');
    ctx.events.endStage();
}

function moveBiodrone(G, ctx) {
    console.log('optional: move any or all biodrones ' + G.rollValue + ' one time each');
}

function moveOrdnance(G, ctx) {
    console.log('choose the order ALL (even opponent owned) ordnance moves ' + G.rollValue + ' tiles each');
}

function fire(G, ctx) {
    console.log('choose the fire order of yer satellites and armaments');
}

export const Septikon = {
    setup: () => ({
        cells: Array(651).fill(null),
        clickedCell: null,
        rollValue: 0,
        rollHistory: [],
        pieces: [
            {
                clones: 0,
            },
            {
                clones: 0,
            }
        ]
    }),


    phases: {
        layout: {
            // onBegin: (G, ctx) => G,
            // onEnd: (G, ctx) => G,
            // endIf: (G, ctx) => G,
            moves: { placeClone },
            start: true,
            next: 'play'
        },
        play: {
            turn: {
                onBegin: (G, ctx) => {
                    ctx.events.setStage('roll');
                },
                stages: {
                    roll: {
                        moves: { rollDie, clickCell },
                        next: 'moveClone',
                        start: true,
                    },

                    moveClone: {
                        moves: { moveClone, clickCell },
                        endIf: (G, ctx) => G.clone >= 1,
                        next: 'module',
                    },

                    module: {
                        moves: { activateModule, clickCell },
                        next: 'moveBiodrones'
                    },

                    moveBiodrones: {
                        moves: { moveBiodrone, clickCell },
                        next: 'moveOrdnance'
                    },

                    moveOrdnance: {
                        moves: { moveOrdnance, clickCell },
                        next: 'fire'
                    },

                    fire: {
                        moves: { fire, clickCell },
                    },
                },
            },
        }
    }
};
