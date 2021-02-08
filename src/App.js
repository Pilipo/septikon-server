import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer'
import { Septikon } from './Game';

class SeptikonClient {
    constructor(rootElement, { playerID }) {
      this.client = Client({ 
        game: Septikon,
        multiplayer: Local(),
        playerID,
      });
      this.client.start();
      this.rootElement = rootElement;
      this.createBoard();
      this.attachListeners(playerID);
      this.client.subscribe(state => this.update(state));
    }
  
    createBoard() {
      const rows = [];
      for (let i = 0; i < 31; i++) {
        const cells = [];
        for (let j = 0; j < 21; j++) {
          const id = 21 * i + j;
          cells.push(`<td class="cell" data-id="${id}"></td>`);
        }
        rows.push(`<tr>${cells.join('')}</tr>`);
      }
  
      // Add the HTML to our app <div>.
      // We’ll use the empty <p> to display the game winner later.
      this.rootElement.innerHTML = `
        <button class="startButton" disabled>Start Game</button>
        <button class="rollButton" disabled>Roll</button>
        <table>${rows.join('')}</table>
        <p class="winner"></p>
      `;
    }
  
    attachListeners(playerID) {
      // This event handler will read the cell id from a cell’s
      // `data-id` attribute and make the `clickCell` move.
      const handleCellClick = event => {
        const id = parseInt(event.target.dataset.id);
        this.client.moves.clickCell(id, playerID);
      };
      const handleRoll = event => {
        this.client.moves.rollDie();
      }
      const handleStart = event => {
        this.client.moves.startGame();
      }
      // Attach the event listener to each of the board cells.
      const cells = this.rootElement.querySelectorAll('.cell');
      cells.forEach(cell => {
        cell.onclick = handleCellClick;
      });
      const rollButton = this.rootElement.querySelector('.rollButton');
      rollButton.onclick = handleRoll;
      const startButton = this.rootElement.querySelector('.startButton');
      startButton.onclick = handleStart;
    }

    update(state) {
        // Get all the board cells.
        const cells = this.rootElement.querySelectorAll('.cell');
        const textField = this.rootElement.querySelectorAll('.selectedTile');
        // Update cells to display the values in game state.
        textField.textContent = state.G.clickedCell;
        cells.forEach(cell => {
          const cellId = parseInt(cell.dataset.id);
          const cellValue = state.G.cells[cellId];
          let x = (Math.floor(cellId / 21));
          let y = (cellId % 21);
          // cell.textContent = cellValue !== null ? cellValue : '';
        });

        // Get the gameover message element.
        const messageEl = this.rootElement.querySelector('.winner');
        // Update the element to show a winner if any.
        if (state.ctx.gameover) {
          messageEl.textContent =
            state.ctx.gameover.winner !== undefined
              ? 'Winner: ' + state.ctx.gameover.winner
              : 'Draw!';
        } else {
          messageEl.textContent = '';
        }
      }
  }
  
  const appElement = document.getElementById('app');
  const playerIDs = ['0', '1'];
  const clients = playerIDs.map(playerID => {
    const rootElement = document.createElement('div');
    rootElement.classList.add('board');
    appElement.append(rootElement);
    return new SeptikonClient(rootElement, { playerID })
  });