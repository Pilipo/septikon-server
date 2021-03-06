import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import Septikon from './Game';

// function SplashScreen(rootElement) {
//   return new Promise(resolve => {
//     const createButton = playerID => {
//       const button = document.createElement('button');
//       button.textContent = 'Player ' + playerID;
//       button.onclick = () => resolve(playerID);
//       rootElement.append(button);
//     };
//     rootElement.innerHTML = ` <p>Play as</p>`;
//     const playerIDs = ['0', '1'];
//     playerIDs.forEach(createButton);
//   });
// }

class SeptikonClient {
  constructor(rootElement, { playerID }) {
    this.client = Client({
      game: Septikon,
      multiplayer: Local(),
      // multiplayer: SocketIO({ server: 'localhost:8000' }),
      playerID,
    });
    this.client.start();
    this.rootElement = rootElement;
    this.createBoard();
    this.attachListeners(playerID);
    this.client.subscribe((state) => this.update(state));
  }

  createBoard() {
    const rows = [];
    for (let y = 0; y < 21; y += 1) {
      const cells = [];
      for (let x = 0; x < 31; x += 1) {
        const id = 21 * x + y;
        cells.push(`<td class="cell" data-id="${id}">${id}</td>`);
      }
      rows.push(`<tr>${cells.join('')}</tr>`);
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML = `
        <button class="startButton">Start Game</button>
        <button class="rollButton">Roll</button>
        <table>${rows.join('')}</table>
        <p class="winner"></p>
        <code class="cellID"></code><br />
        <code class="clickedCell">testing</code>
      `;
  }

  attachListeners(playerID) {
    // This event handler will read the cell id from a cell’s
    // `data-id` attribute and make the `clickCell` move.
    const handleCellClick = (event) => {
      event.preventDefault();
      const id = parseInt(event.target.dataset.id, 10);
      this.client.moves.clickCell(id, playerID);
      const idUpdate = this.rootElement.querySelector('.cellID');
      idUpdate.innerHTML = id;
    };
    const handleRoll = () => {
      this.client.moves.rollDie();
    };
    const handleStart = () => {
      this.client.moves.confirmSetup(playerID);
    };
    // Attach the event listener to each of the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.addEventListener('contextmenu', handleCellClick);
    });
    const rollButton = this.rootElement.querySelector('.rollButton');
    rollButton.onclick = handleRoll;
    const startButton = this.rootElement.querySelector('.startButton');
    startButton.onclick = handleStart;
  }

  update(state) {
    if (state === null) return;
    // Get all the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    const textField = this.rootElement.querySelector('.clickedCell');
    // Update cells to display the values in game state.
    textField.innerText = JSON.stringify(state.G.clickedCell);

    cells.forEach((cell) => {
      const cellId = parseInt(cell.dataset.id, 10);
      const tile = state.G.cells[cellId];
      const x = (Math.floor(cellId / 21));
      const y = (cellId % 21);
      // console.log(cellId + " :: " + x + ", " + y);
      cell.textContent = '';
      // cell.classList.remove('highlighted');
      cell.className = '';
      cell.classList.add('cell');
      if (tile.type === 'space') {
        cell.classList.add('black');
      }
      if (tile.type === 'surface') {
        cell.classList.add('brown');
      }
      if (tile.type === 'lock') {
        cell.classList.add('pink');
      }
      if (tile.type === 'warehouse') {
        if (tile.name === 'metal') {
          if (tile.isFull === true) {
            cell.classList.add('white');
          } else {
            cell.classList.add('dark-white');
          }
        }
        if (tile.name === 'rocket') {
          if (tile.isFull === true) {
            cell.classList.add('red');
          } else {
            cell.classList.add('dark-red');
          }
        }
        if (tile.name === 'energy1' || tile.name === 'energy2') {
          if (tile.isFull === true) {
            cell.classList.add('yellow');
          } else {
            cell.classList.add('dark-yellow');
          }
        }
        if (tile.name === 'biomass') {
          if (tile.isFull === true) {
            cell.classList.add('green');
          } else {
            cell.classList.add('dark-green');
          }
        }
        if (tile.name === 'uranium') {
          if (tile.isFull === true) {
            cell.classList.add('orange');
          } else {
            cell.classList.add('dark-orange');
          }
        }
        if (tile.name === 'biodrone') {
          if (tile.isFull === true) {
            cell.classList.add('purple');
          } else {
            cell.classList.add('dark-purple');
          }
        }
        if (tile.name === 'oxygen') {
          if (tile.isFull === true) {
            cell.classList.add('blue');
          } else {
            cell.classList.add('dark-blue');
          }
        }
        if (tile.damaged === true) {
          cell.classList.add('black');
        }
      }
      state.G.stagedModuleOptions.forEach((stagedCell) => {
        if (stagedCell.x === x && stagedCell.y === y) {
          cell.classList.add('highlighted');
        }
      });
      state.G.players.forEach((player) => {
        player.clones.forEach((clone) => {
          if (clone.x === x && clone.y === y) {
            cell.textContent = 'c';
          }
        });
      });
    });

    // Get the gameover message element.
    const messageEl = this.rootElement.querySelector('.winner');
    // Update the element to show a winner if any.
    if (state.ctx.gameover) {
      messageEl.textContent = state.ctx.gameover.winner !== undefined
        ? `Winner: ${state.ctx.gameover.winner}`
        : 'Draw!';
    } else {
      messageEl.textContent = '';
    }
  }
}

// Multiplayer via Socket

// class App {
//   constructor(rootElement) {
//     SplashScreen(rootElement).then(playerID => {
//       this.client = new SeptikonClient(rootElement, {playerID});
//     });
//   }
// }

// const appElement = document.getElementById('app');
// const app = new App(appElement);

// Local Multiplayer

const appElement = document.getElementById('app');
const playerIDs = ['0', '1'];
playerIDs.map((playerID) => {
  const rootElement = document.createElement('div');
  rootElement.classList.add('board');
  appElement.append(rootElement);
  return new SeptikonClient(rootElement, { playerID });
});
