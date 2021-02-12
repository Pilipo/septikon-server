import DevHelper from './helpers/devHelper';
import PersonnelHelper from './helpers/personnelHelper';
import ResourceHelper from './helpers/resourceHelper';
import { TileHelper, tileProperties } from './helpers/tileHelper';

function clickCell(G, ctx, id, playerID) {

    // TESTING
    // let result = PersonnelHelper.getClonesLegalMoves(playerID, 6, TileHelper.tileIndexToCoordinates(id));

    console.log(TileHelper.getClickedTileByIndex(id));
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
        switch (currentStage) {
            case 'moveClone':
                // BUG: player can select opponent clone
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
                            goToNextStage(G, ctx);
                        }
                    })
                }
                break;
            case 'activateModule':
                console.log('here');
                if (G.stagedObject.targetType == "gunner") {
                    console.log("Fire module after gunner selection (if reqs allow)");
                    // check requirements
                    // activate cell
                    // clear token/cell staging 
                    // advance turn stage
                } else {
                    console.log("Fire module after valid selection (if reqs allow)");
                    // check requirements
                    // activate cell
                    // clear token/cell staging 
                    // advance turn stage
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

function goToNextStage(G, ctx) {
    let currentStage = ctx.activePlayers[ctx.currentPlayer];
    switch (currentStage) {
        case 'rollDie':
            ctx.events.endStage();
            break;

        case 'moveClone':
            // TODO: Calculate Requirements
            // Potential Reqs include: resource cost, damaged tile, gunner, spy, enemy biodrone, satellite in gunner line of sight, enemy clone in gunner line of sight
            // Free modules include: surface, armory, lichen, lichenTwo
            // if player meets requirements
            //     activate automatics modules and fall through
            //     if not automatic, setStage('activateModule')
            // else
            //     fall through

        case 'activateModule':
            // TODO: if biodrone.length > 0 then setStage('moveBiodrones')

        case 'moveBiodrones':
            // TODO: if ordnance.length > 0 then setStage('moveOrdnance')

        case 'moveOrdnance':
            // TODO: if arms.length > 0 then setStage('fireArms')

        case 'fireArms':
            // TODO: clean up for next turn and endTurn()
    };
}

function rollDie(G, ctx) {
    // let roll = ctx.random.D6();
    let roll = 6;
    G.rollValue = roll;
    G.rollHistory.unshift(roll);
    goToNextStage(G, ctx);
}

function confirmSetup(G, ctx, playerID) {
    if (G.players[playerID]['clones'].length === 5) {
        G.setupConfirmations[playerID] = !G.setupConfirmations[playerID];
        ctx.events.endTurn();
    }
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
                ordnance: [],
                shields: [],
                resources: {},
            },
            {
                clones: [],
                biodrones: [],
                ordnance: [],
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
                        currentPlayer: 'rollDie',
                    });
                    ResourceHelper.populatePlayerResources(G);
                },
                stages: {
                    rollDie: {
                        moves: { rollDie, clickCell },
                        next: 'moveClone',
                        start: true,
                    },

                    moveClone: {
                        moves: { clickCell },
                        next: 'activateModule',
                    },

                    activateModule: {
                        moves: { clickCell },
                        next: 'moveBiodrones'
                    },

                    moveBiodrones: {
                        moves: { clickCell },
                        next: 'moveOrdnance'
                    },

                    moveOrdnance: {
                        moves: { clickCell },
                        next: 'fire'
                    },

                    fireArms: {
                        moves: { clickCell },
                    },
                },
            },
        }
    }
};
