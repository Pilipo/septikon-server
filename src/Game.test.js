import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { Septikon } from './Game';

const client =  Client({ game: { ...Septikon, seed: 42 }, multiplayer: Local(), playerID: '0' });
client.start();

test('player 0 placing clones', () => {
    
    client.moves.clickCell(0, '0');
    client.moves.clickCell(0, '0');
    client.moves.clickCell(1, '0');
    client.moves.clickCell(2, '0');
    client.moves.clickCell(3, '0');
    client.moves.clickCell(4, '0');
    client.moves.clickCell(5, '0');
    const { G } = client.store.getState();

    expect(G.players[0].clones).toEqual([
        { x: 0, y: 1, spy: false, gunner: false },
        { x: 0, y: 2, spy: false, gunner: false },
        { x: 0, y: 3, spy: false, gunner: false },
        { x: 0, y: 4, spy: false, gunner: false },
        { x: 0, y: 5, spy: false, gunner: false }
      ]);

});

test('player 1 placing clones', () => {
    
    client.moves.clickCell(650, '1');
    client.moves.clickCell(0, '1');
    client.moves.clickCell(649, '1');
    client.moves.clickCell(648, '1');
    client.moves.clickCell(647, '1');
    client.moves.clickCell(646, '1');
    const { G } = client.store.getState();

    expect(G.players[1].clones).toEqual([
        { x: 30, y: 20, spy: false, gunner: false },
        { x: 30, y: 19, spy: false, gunner: false },
        { x: 30, y: 18, spy: false, gunner: false },
        { x: 30, y: 17, spy: false, gunner: false },
        { x: 30, y: 16, spy: false, gunner: false }
      ]);
});

// test('player 0 ready to start', () => {
//     client.moves.confirmSetup('0');
//     const { G: G, ctx: ctx } = client.store.getState();
//     expect(G.setupConfirmations).toEqual([ true, false ]);
//     expect(ctx.currentPlayer).toEqual("1");
// });

// test('player 1 ready to start', () => {
//     client.moves.confirmSetup('1');
//     const { G: G, ctx: ctx } = client.store.getState();
//     expect(G.setupConfirmations).toEqual([ true, true ]);
//     expect(ctx.currentPlayer).toEqual("0");
// });

// test('player 2 placing clones', () => {
    
//     client.moves.clickCell(650, '1');
//     client.moves.clickCell(649, '1');
//     client.moves.clickCell(648, '1');
//     client.moves.clickCell(647, '1');
//     client.moves.clickCell(646, '1');

//     // should have 5 clones loaded on player 1
// });

// test('player 2 placing an extra clones', () => {
//     client.moves.clickCell(645, '1');
//     // this should fail
// });

// test('cut for deal state changes', () => {
//     let matchID = 'boomer';
//     let clientN = Client({ game: customGameSetup, playerID: '0', multiplayer: Local(), matchID });
//     clientN.start();
//     let clientS = Client({ game: customGameSetup, playerID: '1', multiplayer: Local(), matchID });
//     clientS.start();
//     clientN.moves.cutForDeal(1);
//     let { G: gN, ctx: cN } = clientN.store.getState();
//     let { G: gS, ctx: cS } = clientS.store.getState();
//     let { activePlayers: actN } = cN;
//     let { activePlayers: actS } = cS;
//     let { hands: hN } = gN;
//     let { hands: hS } = gS;
//     expect(actN).toEqual(actS);
//     expect(hN.north.played[0].id).toEqual(cardEnum.SK);
//     expect(hS.north.played[0].id).toEqual(cardEnum.SK);
//   });
