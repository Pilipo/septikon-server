import PersonnelHelper from './helpers/personnelHelper';
import ResourceHelper from './helpers/resourceHelper';
import { TileHelper, tileProperties} from './helpers/tileHelper';

function clickCell(G, ctx, id, playerID) {
    let coords = TileHelper.tileIndexToCoordinates(id);
    if (ctx.phase === "layout") {
        let cloneIndex = PersonnelHelper.getCloneIndexByCoordinates(G, playerID, coords);
        if (cloneIndex === false) {
            PersonnelHelper.placeClone(G, playerID, coords);
        } else {
            PersonnelHelper.removeClone(G, playerID, coords)
        }
    } else {
        G.clickedCell = TileHelper.getClickedTileByIndex(id);
    }
}

function rollDie(G, ctx) {
    G.rollValue = ctx.random.D6();
    console.log(G.rollValue + ' was yer roll');
    G.rollHistory.unshift(G.rollValue);
    ctx.events.endStage();
}

function confirmSetup(G, ctx, playerID) {
    if (G.players[playerID]['clones'].length === 5) {
        G.setupConfirmations[playerID] = !G.setupConfirmations[playerID];
    }
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
        cells: Array(651).fill(tileProperties),
        clickedCell: null,
        rollValue: 0,
        rollHistory: [],
        setupConfirmations: [
            false,
            false
        ],
        players: [
            {
                clones: [],
                biodrones: [],
                rockets: [],
                satellites: [],
                shields: [],
                resources: {},
            },
            {
                clones: [],
                biodrones: [],
                rockets: [],
                satellites: [],
                shields: [],
                resources: {},
            }
        ]
    }),


    phases: {
        layout: {
            onBegin: (G, ctx) => {
                ctx.events.setActivePlayers({ all: 'setBoard'});
                TileHelper.setOwnership(G);
            },
            endIf: (G, ctx) => {
                let playersReady = true;
                G.setupConfirmations.forEach(player => {
                    if (player === false) {
                        playersReady = false;
                    }
                });
                if (playersReady === true) {
                    return true;
                } else {
                    return false;
                }
            },
            moves: { clickCell, confirmSetup },
            start: true,
            next: 'play'
        },
        play: {
            turn: {
                order: {
                    first: (G, ctx) => 0,
                },
                onBegin: (G, ctx) => {
                    ctx.events.setStage('roll');
                    ResourceHelper.populatePlayerResources(G);
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
