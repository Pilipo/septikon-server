import DevHelper from './helpers/devHelper';
import PersonnelHelper from './helpers/personnelHelper';
import ResourceHelper from './helpers/resourceHelper';
import { TileHelper, tileProperties} from './helpers/tileHelper';

function clickCell(G, ctx, id, playerID) {

    // TESTING
    // let result = PersonnelHelper.getClonesLegalMoves(playerID, 6, TileHelper.tileIndexToCoordinates(id));

    // console.log(TileHelper.getClickedTileByIndex(id));
    // console.log(result);

    // END TESTING

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
        let currentStage = ctx.activePlayers[ctx.currentPlayer];
        switch(currentStage) {
            case 'moveClone':
                if (TileHelper.getValueForCoordinates(G, coords, 'occupied') === true) {
                    G.stagedObject = G.players[playerID]['clones'][PersonnelHelper.getCloneIndexByCoordinates(G, playerID, coords)];
                    G.stagedCells = PersonnelHelper.getClonesLegalMoves(G, playerID, G.rollHistory[0], coords);
                } else {
                    G.stagedCells.forEach(coordinate => {
                        if (JSON.stringify(coordinate) === JSON.stringify(coords)) {
                            PersonnelHelper.moveClone(G, playerID, G.stagedObject, coordinate);
                            // clear token/cell staging
                            G.stagedCells = [];
                            G.stagedObject = (G.clickedCell.type === "lock" ? null : G.clickedCell);
                            // advance turn stage
                            ctx.events.endStage();
                        }
                    })
                }
                break;
            case 'module':
                if (cell.automated) {
                    // check requirements
                    // activate cell
                    // clear token/cell staging 
                    // advance turn stage
                } else {
                    // TODO: offer targets
                    if (cell.requiresGunner) {
                        // check requirements
                        // activate cell
                        // clear token/cell staging 
                        // advance turn stage
                    } else {
                        // check requirements
                        // activate cell
                        // clear token/cell staging 
                        // advance turn stage
                    }
                }
                // Possible activations include:
                // - BATTLE
                //   - {PENDING} Gunner targetted: lasers, thermites, shield, biodrone, satellite, rocket, espionage, takeover (each gunner can be targetted)
                //   - {PENDING} non-gunner targetted: counter-espionage, repair, repairTwo (set number of targets)
                // - PROD
                //   - {PENDING} automated: everything but...
                //   - {PENDING} non-gunner targetted: repair, sensor cabin
                // - ARMORY
                //   - {PENDING} automated: everything
                // - SURFACE
                //   - {PENDING} automated: set clone.gunner: true
                break;
            default:
        }
    }
}

function rollDie(G, ctx) {
    // let roll = ctx.random.D6();
    let roll = 6;
    G.rollValue = roll;
    G.rollHistory.unshift(roll);
    ctx.events.endStage();
}

function confirmSetup(G, ctx, playerID) {
    if (G.players[playerID]['clones'].length === 5) {
        G.setupConfirmations[playerID] = !G.setupConfirmations[playerID];
        ctx.events.endTurn();
    }
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
        stagedObject: null,
        stagedCells: [],
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
                TileHelper.setOwnership(G);
                DevHelper.stageForMoveClone(G, ctx);
            },
            // onEnd: (G, ctx) => {
            //     ctx.events.endTurn();
            // },
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
                onBegin: (G, ctx) => {
                    ctx.events.setActivePlayers({
                        currentPlayer: 'roll',
                    });
                    ResourceHelper.populatePlayerResources(G);
                },
                stages: {
                    roll: {
                        moves: { rollDie, clickCell },
                        next: 'moveClone',
                        start: true,
                    },

                    moveClone: {
                        moves: { clickCell },
                        endIf: (G, ctx) => G.clone >= 1,
                        next: 'module',
                    },

                    module: {
                        moves: { clickCell },
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
